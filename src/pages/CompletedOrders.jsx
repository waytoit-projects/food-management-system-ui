import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Loader2, Calendar as CalendarIcon, CheckCircle, 
  MapPin, Package, RefreshCcw, Utensils, ChevronLeft, ChevronRight, ArrowUpDown, Download
} from 'lucide-react';
import { getCompletedOrders } from '../services/orderService';
import { useTheme } from '../context/ThemeContext';

const AwesomeDatePicker = ({ selectedDate, onSelect, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const startDay = firstDay === 0 ? 6 : firstDay - 1; // Map to Monday=0
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const handleSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const tzOffset = newDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(newDate - tzOffset)).toISOString().split('T')[0];
    
    if (maxDate && localISOTime > maxDate) return;
    
    onSelect(localISOTime);
    setIsOpen(false);
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => { setIsOpen(!isOpen); setViewDate(new Date(selectedDate)); }}
        style={{ 
          display: 'flex', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '1.5rem', padding: '0.5rem 1.25rem', 
          color: '#60a5fa', fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
      >
        <CalendarIcon size={16} style={{ marginRight: '0.5rem' }} />
        <span>{new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
      
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
          <div style={{ 
            position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
            background: '#1e293b', borderRadius: '1rem', padding: '1.25rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 100,
            width: '280px', color: 'white', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{monthNames[currentMonth]} {currentYear}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.75rem', textAlign: 'center' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{d}</div>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const d = new Date(currentYear, currentMonth, day);
                const tzOffset = d.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(d - tzOffset)).toISOString().split('T')[0];
                const isSelected = localISOTime === selectedDate;
                const isFuture = maxDate && localISOTime > maxDate;
                
                return (
                  <button 
                    key={day}
                    disabled={isFuture}
                    onClick={() => handleSelect(day)}
                    style={{ 
                      width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%', background: isSelected ? '#3b82f6' : 'transparent',
                      color: isSelected ? 'white' : (isFuture ? 'rgba(255,255,255,0.2)' : 'white'),
                      border: 'none', cursor: isFuture ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem', fontWeight: 600, margin: 'auto',
                      boxShadow: isSelected ? '0 4px 10px rgba(59, 130, 246, 0.4)' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { if(!isSelected && !isFuture) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                    onMouseOut={(e) => { if(!isSelected && !isFuture) e.currentTarget.style.background = 'transparent' }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => setIsOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '2rem', background: '#475569', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
              <button onClick={() => setIsOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '2rem', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>Done</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CompletedOrders = () => {
  const { sidebarType } = useTheme();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date selection state (YYYY-MM-DD format)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Use local time, offset correction
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - tzOffset)).toISOString().split('T')[0];
    return localISOTime;
  });

  const maxDate = useMemo(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return (new Date(today - tzOffset)).toISOString().split('T')[0];
  }, []);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'orderId', direction: 'asc' });

  const handleExport = () => {
    if (sortedData.length === 0) return;
    
    const headers = ["Order ID", "Hotel ID", "Customer", "Mobile", "Table", "Item ID", "Item Name", "Category", "Qty", "Type", "Date", "Time", "Status"];
    const csvContent = [
      headers.join(","),
      ...sortedData.map(item => [
        item.orderId,
        item.hotelId,
        item.customerName || 'Walk-in',
        item.customerMobile || '',
        item.tableNo,
        item.itemId,
        item.itemName,
        item.itemCategory,
        item.quantity,
        item.givenType,
        item.orderDate,
        item.orderTime,
        item.orderStatus
      ].map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchOrders = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const response = await getCompletedOrders(selectedDate);
      if (response && response.data) {
        setOrdersData(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setOrdersData([]);
      }
    } catch (error) {
      console.error("Failed to fetch completed orders:", error);
      setOrdersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // Initial load

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Derived stats
  const totalCompletedOrders = useMemo(() => {
    const uniqueOrders = new Set(ordersData.filter(o => o.orderStatus === 'COMPLETED').map(o => o.orderId));
    return uniqueOrders.size;
  }, [ordersData]);

  const totalItemsCount = useMemo(() => {
    return ordersData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [ordersData]);

  const dineInCount = useMemo(() => {
    const uniqueOrders = new Set(ordersData.filter(o => {
      const type = (o.given_type || o.givenType || '').toUpperCase();
      return type.includes('DINE');
    }).map(o => o.orderId));
    return uniqueOrders.size;
  }, [ordersData]);

  const deliveryCount = useMemo(() => {
    const uniqueOrders = new Set(ordersData.filter(o => {
      const type = (o.given_type || o.givenType || '').toUpperCase();
      return type.includes('DELIVERY');
    }).map(o => o.orderId));
    return uniqueOrders.size;
  }, [ordersData]);

  const takeawayCount = useMemo(() => {
    const uniqueOrders = new Set(ordersData.filter(o => {
      const type = (o.given_type || o.givenType || '').toUpperCase();
      return type.includes('TAKEAWAY');
    }).map(o => o.orderId));
    return uniqueOrders.size;
  }, [ordersData]);

  // Filtering
  const filteredData = useMemo(() => {
    return ordersData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.orderId?.toLowerCase().includes(searchLower) ||
        item.customerName?.toLowerCase().includes(searchLower) ||
        item.customerMobile?.toLowerCase().includes(searchLower) ||
        item.itemName?.toLowerCase().includes(searchLower) ||
        item.tableNo?.toLowerCase().includes(searchLower)
      );
    });
  }, [ordersData, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Pagination
  const effectiveItemsPerPage = itemsPerPage === -1 ? sortedData.length : itemsPerPage;
  const indexOfLastItem = currentPage * effectiveItemsPerPage;
  const indexOfFirstItem = effectiveItemsPerPage === 0 ? 0 : indexOfLastItem - effectiveItemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = effectiveItemsPerPage === 0 ? 1 : Math.ceil(sortedData.length / effectiveItemsPerPage);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' };
      case 'COMPLETED': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'CANCELLED': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <div style={{ padding: '1rem', height: '100%', width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0',
            background: 'linear-gradient(90deg, #ffffff, #a0aec0)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Completed Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>View and manage historical completed orders.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date Picker Group */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '2rem', border: '1px solid var(--border-color)', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            
            <AwesomeDatePicker selectedDate={selectedDate} onSelect={setSelectedDate} maxDate={maxDate} />

            <button 
              onClick={fetchOrders}
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem', borderRadius: '1.5rem', background: 'var(--primary)', 
                color: 'white', border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                boxShadow: '0 4px 10px var(--primary-shadow)'
              }}
            >
              {loading ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : 'View Data'}
            </button>
          </div>

          </div>
        </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Completed Orders', count: totalCompletedOrders, icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'Total Items Sold', count: totalItemsCount, icon: Package, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
          { label: 'Dine In Orders', count: dineInCount, icon: Utensils, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Delivery Orders', count: deliveryCount, icon: MapPin, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
          { label: 'Takeaway Orders', count: takeawayCount, icon: RefreshCcw, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
        ].map((stat, idx) => (
          <div key={idx} style={{ 
            background: 'var(--bg-card)', padding: '1rem', borderRadius: '1.25rem', 
            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.2s',
            ':hover': { transform: 'translateY(-3px)' }
          }}>
            <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: '1.2', wordBreak: 'break-word' }}>{stat.label}</p>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.35rem', fontWeight: 800 }}>{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div style={{ 
        background: 'var(--bg-card)', borderRadius: '1.25rem', border: '1px solid var(--border-color)', 
        overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column'
      }}>
        {/* Table Action Bar */}
        <div style={{ 
          padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Show</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 700, outline: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                <option value={10} style={{ background: '#1e293b' }}>10</option>
                <option value={25} style={{ background: '#1e293b' }}>25</option>
                <option value={50} style={{ background: '#1e293b' }}>50</option>
                <option value={-1} style={{ background: '#1e293b' }}>All</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>entries</span>
            </div>

            <button 
              onClick={handleExport}
              disabled={sortedData.length === 0}
              style={{
                padding: '0.4rem 1rem', borderRadius: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', 
                color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)', fontWeight: 600, 
                cursor: sortedData.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if(sortedData.length > 0) e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)' }}
              onMouseOut={(e) => { if(sortedData.length > 0) e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)' }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.4rem 0.75rem 0.4rem 2rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.02)',
                color: 'white',
                width: '180px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Loader2 size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ color: 'var(--text-muted)' }}>Fetching orders for {selectedDate}...</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '380px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#1e293b' }}>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {[
                    '#', 'Order ID', 'Status', 'Item ID', 'Item Name', 'Category', 'Qty', 
                    'Item Price', 'Discount', 'Selling Amt', 'GST', 'Total Amt', 
                    'Payment Mode', 'Pay Status', 'Order Type', 'Transaction ID', 'Voucher ID',
                    'Customer', 'Mobile', 'Table', 'Del. Address', 
                    'Order Date', 'Order Time', 'Inserted By', 'Inserted Time',
                    'Updated By', 'Updated Time', 'Hotel Name', 'Hotel Address',
                    'Remarks'
                  ].map((h, i) => (
                    <th key={i} style={{ padding: '1rem 0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{indexOfFirstItem + index + 1}</td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>{item.orderId}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)',
                          padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700 
                        }}>
                          {item.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.itemId}</td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>{item.itemName}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.itemCategory}</td>
                      <td style={{ padding: '1rem 0.75rem', color: 'var(--primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.quantity}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>₹{item.itemPrice}</td>
                      <td style={{ padding: '1rem 0.75rem', color: '#ef4444', whiteSpace: 'nowrap' }}>₹{item.discountAmount}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>₹{item.sellingAmount}</td>
                      <td style={{ padding: '1rem 0.75rem', color: '#f59e0b', whiteSpace: 'nowrap' }}>₹{item.gstAmount}</td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>₹{item.totalAmount}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>{item.paymentMode}</span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ color: item.paymentStatus === 'PAID' ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '0.75rem' }}>{item.paymentStatus}</span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {(item.given_type || item.givenType)?.toUpperCase().includes('DINE') 
                            ? `DINE IN (T${item.tableNo})` 
                            : (item.given_type || item.givenType)?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.transactionId || '-'}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.voucherCardId || '-'}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.customerName || 'Walk-in'}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.customerMobile || '-'}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.tableNo}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.deliveryAddress || '-'}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.orderDate}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.orderTime?.split('.')[0]}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.insertedBy}</td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.insertedTime}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.updatedBy || '-'}</td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.updatedTime || '-'}</td>
                      <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap' }}>{item.hotelName}</td>
                      <td style={{ padding: '1rem 0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.hotelAddress}>{item.hotelAddress}</td>
                      <td style={{ padding: '1rem 0.75rem', color: '#fca5a5', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{item.remarks || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="29" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Search size={32} color="var(--text-muted)" />
                          </div>
                          <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>No orders found</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>No completed orders available for the selected date.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sortedData.length > 0 && (
              <div style={{ 
                padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing <span style={{ color: 'white', fontWeight: 600 }}>{indexOfFirstItem + 1}</span> to <span style={{ color: 'white', fontWeight: 600 }}>{Math.min(indexOfLastItem, sortedData.length)}</span> of <span style={{ color: 'white', fontWeight: 600 }}>{sortedData.length}</span> entries
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {totalPages > 1 && itemsPerPage !== -1 && (
                    <>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ 
                          padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-main)', 
                          border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-muted)' : 'white',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center'
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          pageNum = currentPage - 2 + i;
                          if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                        }
                        return (
                          <button 
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{ 
                              width: '32px', height: '32px', borderRadius: '0.5rem', fontWeight: 600,
                              background: currentPage === pageNum ? 'var(--primary)' : 'var(--bg-main)', 
                              border: currentPage === pageNum ? 'none' : '1px solid var(--border-color)', 
                              color: currentPage === pageNum ? 'white' : 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ 
                          padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-main)', 
                          border: '1px solid var(--border-color)', color: currentPage === totalPages ? 'var(--text-muted)' : 'white',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center'
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      </div>
  );
};

export default CompletedOrders;
