import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Clock, Loader2, CheckCircle, XCircle, 
  MapPin, User, Package, Calendar, RefreshCcw, Utensils, Circle
} from 'lucide-react';
import { getPendingOrders, updateOrderStatus } from '../services/orderService';
import { useTheme } from '../context/ThemeContext';

const PendingOrders = () => {
  const { sidebarType } = useTheme();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, orderId: null, action: null, message: '' });
  
  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await getPendingOrders();
      if (response && response.data) {
        // Ensure data is an array
        const items = Array.isArray(response.data) ? response.data : [response.data];
        setOrdersData(items);
      } else {
        setOrdersData([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 45000); // 45 seconds refresh
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, itemId = "%") => {
    try {
      // Optimistically update UI
      if (itemId === "%") {
        setOrdersData(prev => prev.filter(item => item.orderId !== orderId));
      } else {
        setOrdersData(prev => prev.map(item => {
          if (item.orderId === orderId && item.itemId === itemId) {
            return { ...item, orderStatus: newStatus };
          }
          return item;
        }));
      }
      
      const res = await updateOrderStatus(orderId, newStatus, itemId);
      if (!res.success) {
        // Re-fetch if failed
        fetchOrders();
      }
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
      fetchOrders();
    }
  };

  // Group items by orderId
  const groupedOrdersObj = ordersData.reduce((acc, item) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = {
        ...item,
        items: []
      };
    }
    acc[item.orderId].items.push(item);
    return acc;
  }, {});
  
  const allGroupedOrders = Object.values(groupedOrdersObj);

  // Summaries
  const totalOrders = allGroupedOrders.length;
  const totalItemsCount = ordersData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const dineInCount = allGroupedOrders.filter(o => {
    const type = (o.given_type || o.givenType || '').toUpperCase();
    return type.includes('DINE');
  }).length;
  const deliveryCount = allGroupedOrders.filter(o => {
    const type = (o.given_type || o.givenType || '').toUpperCase();
    return type.includes('DELIVERY');
  }).length;
  const takeawayCount = allGroupedOrders.filter(o => {
    const type = (o.given_type || o.givenType || '').toUpperCase();
    return type.includes('TAKEAWAY');
  }).length;


  // Filtering & Searching
  const filteredOrders = allGroupedOrders.filter(order => {
    const orderType = (order.given_type || order.givenType || '').toUpperCase();
    const matchesFilter = filterType === 'All' || 
                          orderType === filterType.toUpperCase() ||
                          orderType.replace('_', ' ') === filterType.toUpperCase();
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchLower) ||
      order.tableNo?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' };
      case 'COMPLETED': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'CANCELLED': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="spinner" size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <h3 style={{ color: 'var(--text-muted)' }}>Loading pending orders...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0',
            background: 'linear-gradient(90deg, #ffffff, #a0aec0)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Pending Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Auto-refreshing every 45s
            {refreshing && <RefreshCcw size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search ID, Table, Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '2rem',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.03)',
                color: 'white',
                width: '250px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '2rem', padding: '0.25rem', border: '1px solid var(--border-color)' }}>
            {['All', 'DINE_IN', 'DELIVERY', 'TAKEAWAY'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  border: 'none',
                  background: filterType === type ? 'var(--primary)' : 'transparent',
                  color: filterType === type ? 'white' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Pending', count: totalOrders, icon: Clock, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
          { label: 'Total Items', count: totalItemsCount, icon: Package, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
          { label: 'Dine In', count: dineInCount, icon: Utensils, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'Delivery', count: deliveryCount, icon: Package, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Takeaway', count: takeawayCount, icon: Package, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
        ].map((stat, idx) => (
          <div key={idx} style={{ 
            background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', 
            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div style={{ 
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', background: 'rgba(255,255,255,0.02)', 
          borderRadius: '1.5rem', border: '1px dashed var(--border-color)', padding: '3rem'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <CheckCircle size={40} color="var(--text-muted)" />
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'white', fontWeight: 700 }}>No Pending Orders Available</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Kitchen is all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {filteredOrders.map(order => {
            const allCompleted = order.items.every(i => i.orderStatus === 'COMPLETED');
            const displayStatus = allCompleted ? 'COMPLETED' : 'PENDING';
            const statusStyle = getStatusColor(displayStatus);

            return (
              <div key={order.orderId} style={{ 
                background: 'var(--bg-card)', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}>
                {/* Card Header */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{order.orderId}</h3>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {order.orderTime?.split('.')[0] || order.orderTime}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {order.orderDate}</span>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700,
                      background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`
                    }}>
                      {displayStatus}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#818cf8" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{order.customerName || 'Walk-in'}</div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', 
                      background: (order.given_type || order.givenType)?.toUpperCase().includes('DINE') ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', 
                      padding: '0.75rem', borderRadius: '1rem', 
                      border: (order.given_type || order.givenType)?.toUpperCase().includes('DINE') ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(245, 158, 11, 0.15)',
                      boxShadow: 'inset 0 0 12px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: (order.given_type || order.givenType)?.toUpperCase().includes('DINE') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        {(order.given_type || order.givenType)?.toUpperCase().includes('DINE') ? <MapPin size={16} color="#10b981" /> : <Package size={16} color="#f59e0b" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Type</div>
                        <div style={{ 
                          fontWeight: 800, 
                          color: (order.given_type || order.givenType)?.toUpperCase().includes('DINE') ? '#10b981' : '#f59e0b',
                          fontSize: '0.9rem',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <span>{(order.given_type || order.givenType)?.replace('_', ' ').toUpperCase()}</span>
                          {(order.given_type || order.givenType)?.toUpperCase().includes('DINE') && (
                            <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>TABLE {order.tableNo}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ padding: '1.25rem', flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Order Items</span>
                    <span style={{ color: 'white', fontWeight: 700, background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                      {order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
                    </span>
                  </h4>
                  
                  <div style={{ 
                    display: 'flex', flexDirection: 'column', gap: '0.75rem', 
                    maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' 
                  }}>
                    {order.items.map((item, idx) => {
                      const isItemCompleted = item.orderStatus === "COMPLETED";
                      return (
                        <div key={idx} 
                          onClick={() => handleUpdateStatus(order.orderId, isItemCompleted ? 'PENDING' : 'COMPLETED', item.itemId)}
                          style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
                            padding: '0.75rem', background: isItemCompleted ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)', 
                            border: isItemCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '0.75rem', transition: 'all 0.2s', cursor: 'pointer'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = isItemCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)'}
                          onMouseOut={(e) => e.currentTarget.style.background = isItemCompleted ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)'}
                        >
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ paddingTop: '0.1rem' }}>
                              {isItemCompleted ? (
                                <CheckCircle size={20} color="#10b981" fill="rgba(16, 185, 129, 0.2)" />
                              ) : (
                                <Circle size={20} color="var(--text-muted)" />
                              )}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isItemCompleted ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                <span style={{ fontWeight: 800, color: isItemCompleted ? '#10b981' : 'white', fontSize: '0.9rem' }}>{item.quantity}x</span>
                                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>{item.itemName}</span>
                              </div>
                              {item.remarks && (
                                <div style={{ fontSize: '0.75rem', color: isItemCompleted ? '#10b981' : '#f59e0b', marginTop: '0.2rem', fontStyle: 'italic', opacity: isItemCompleted ? 0.5 : 1 }}>
                                  Note: {item.remarks}
                                </div>
                              )}
                            </div>
                          </div>
                          <span style={{ 
                            fontSize: '0.65rem', fontWeight: 700,
                            color: isItemCompleted ? '#10b981' : '#f59e0b', 
                            background: isItemCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                            padding: '0.2rem 0.5rem', borderRadius: '1rem', transition: 'all 0.2s'
                          }}>
                            {isItemCompleted ? 'COMPLETED' : 'PENDING'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setConfirmDialog({
                      isOpen: true,
                      orderId: order.orderId,
                      action: 'CANCELLED',
                      message: 'Are you sure you want to cancel this order?'
                    })}
                    style={{ 
                      flex: 1, padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem',
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                  <button 
                    disabled={!allCompleted}
                    onClick={() => {
                      if (allCompleted) {
                        setConfirmDialog({
                          isOpen: true,
                          orderId: order.orderId,
                          action: 'COMPLETED',
                          message: 'Are you sure you want to mark this entire order as completed?'
                        });
                      }
                    }}
                    style={{ 
                      flex: 1, padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem',
                      background: allCompleted ? '#10b981' : 'rgba(16, 185, 129, 0.2)', 
                      color: allCompleted ? 'white' : 'rgba(255,255,255,0.4)', border: 'none',
                      cursor: allCompleted ? 'pointer' : 'not-allowed', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      boxShadow: allCompleted ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none', 
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { if(allCompleted) e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={(e) => { if(allCompleted) e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <CheckCircle size={16} /> Mark Completed
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Awesome Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            padding: '2.5rem', borderRadius: '1.5rem',
            width: '90%', maxWidth: '420px', 
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ 
              width: '72px', height: '72px', borderRadius: '50%', marginBottom: '1.5rem',
              background: confirmDialog.action === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: confirmDialog.action === 'COMPLETED' ? '#10b981' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {confirmDialog.action === 'COMPLETED' ? <CheckCircle size={36} /> : <XCircle size={36} />}
            </div>
            
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.35rem', fontWeight: 800 }}>Confirm Action</h2>
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '1rem', 
              fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '1rem',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}>
              Order ID: {confirmDialog.orderId}
            </div>
            <p style={{ margin: '0 0 2rem 0', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {confirmDialog.message}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, orderId: null, action: null, message: '' })}
                style={{ 
                  flex: 1, padding: '0.85rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                  background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                No, Go Back
              </button>
              <button 
                onClick={() => {
                  handleUpdateStatus(confirmDialog.orderId, confirmDialog.action, '%');
                  setConfirmDialog({ isOpen: false, orderId: null, action: null, message: '' });
                }}
                style={{ 
                  flex: 1, padding: '0.85rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
                  background: confirmDialog.action === 'COMPLETED' ? '#10b981' : '#ef4444', 
                  color: 'white', border: 'none',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: confirmDialog.action === 'COMPLETED' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Yes, {confirmDialog.action === 'COMPLETED' ? 'Complete' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
