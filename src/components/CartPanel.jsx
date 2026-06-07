import React, { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Trash2, MapPin, Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import ThermalReceipt from './ThermalReceipt';
import { saveOrderHistory } from '../services/orderService';

const CartPanel = ({ cartItems, onAdd, onRemove, onClearCart }) => {
  const { user } = useAuth();
  const [orderType, setOrderType] = useState('Dine In');
  const [cartView, setCartView] = useState('CART'); // 'CART', 'DETAILS', 'SUCCESS'
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(() => `ORD${Math.floor(Date.now() / 1000)}`);
  const preReceiptRef = useRef();
  const postReceiptRef = useRef();
  
  const [customerInfo, setCustomerInfo] = useState({
    customerName: 'Walk-in',
    customerMobile: '',
    tableNo: 'T1',
    remarks: '',
    paymentMode: 'CASH',
    paymentStatus: 'PENDING',
    transactionId: '',
    discountAmount: 0
  });
  const [orderStatus, setOrderStatus] = useState('PENDING');

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * item.qty), 0);
  const gst = cartItems.reduce((sum, item) => {
    const itemGst = Number(item.gstPercentage || 0);
    return sum + (Number(item.sellingPrice || 0) * item.qty * (itemGst / 100));
  }, 0);
  const deliveryCharge = orderType === 'Delivery' ? 5.00 : 0;
  const total = subtotal + gst + deliveryCharge;

  const [showEmptyCartWarning, setShowEmptyCartWarning] = useState(false);

  const handleConfirmOrderClick = () => {
    if (cartItems.length === 0) {
      setShowEmptyCartWarning(true);
      setTimeout(() => setShowEmptyCartWarning(false), 3000);
      return;
    }
    const generatedOrderId = `ORD${Math.floor(Date.now() / 1000)}`;
    setCurrentOrderId(generatedOrderId);
    setCartView('DETAILS');
  };

  const handleCompleteOrder = async (skip = false) => {
    setIsConfirming(true);
    const now = new Date();
    const orderDate = now.toISOString().split('T')[0];
    const orderTime = now.toTimeString().split(' ')[0];
    
    const infoToUse = skip ? {
      customerName: 'Walk-in', customerMobile: '', tableNo: 'T1', remarks: '', paymentMode: 'CASH', paymentStatus: 'PAID', transactionId: '', discountAmount: 0
    } : customerInfo;

    try {
      const promises = cartItems.map(item => {
        const itemSellingAmount = Number(item.sellingPrice || 0) * item.qty;
        const itemGst = item.gstPercentage ? (itemSellingAmount * Number(item.gstPercentage) / 100) : 0;
        
        const payload = {
          hotelId: user?.hotelId || "HOTEL001",
          hotelName: user?.hotelName || "WayToIT Restaurant",
          hotelAddress: user?.hotelAddress || "Mumbai",
          orderId: currentOrderId,
          orderStatus: orderStatus,
          itemId: item.id || item.itemId || `ITEM${Math.floor(Math.random() * 1000)}`,
          itemName: item.itemName,
          itemCategory: item.mainCategory || item.category?.mainCategory || (typeof item.category === 'string' ? item.category : "Food"),
          quantity: item.qty,
          itemPrice: Number(item.sellingPrice || 0),
          gstAmount: itemGst,
          discountAmount: infoToUse.discountAmount || 0,
          sellingAmount: itemSellingAmount,
          totalAmount: itemSellingAmount + itemGst,
          givenType: orderType.toUpperCase().replace(' ', '_'),
          tableNo: infoToUse.tableNo || "T1",
          customerName: infoToUse.customerName || "Walk-in",
          customerMobile: infoToUse.customerMobile || "",
          paymentMode: infoToUse.paymentMode || "CASH",
          paymentStatus: infoToUse.paymentStatus || "PAID",
          transactionId: infoToUse.transactionId || "",
          orderDate: orderDate,
          orderTime: orderTime,
          insertedBy: user?.username || "ADMIN",
          remarks: infoToUse.remarks || ""
        };
        return saveOrderHistory(payload);
      });

      const results = await Promise.all(promises);
      
      // Capture the backend-generated OrderId from the response (e.g., {"OrderId": "6"})
      const successResult = results.find(res => res.success && res.data && (res.data.OrderId || res.data.orderId));
      if (successResult) {
        const id = successResult.data.OrderId || successResult.data.orderId;
        setCurrentOrderId(String(id));
      }

      setCartView('SUCCESS');
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Failed to confirm order. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleNewOrder = () => {
    setCartView('CART');
    setCurrentOrderId(`ORD${Math.floor(Date.now() / 1000)}`);
    if(onClearCart) onClearCart();
    setCustomerInfo({ customerName: 'Walk-in', customerMobile: '', tableNo: 'T1', remarks: '', paymentMode: 'CASH', paymentStatus: 'PAID', transactionId: '', discountAmount: 0 });
    setOrderStatus('PENDING');
  };

  const handlePrintPre = useReactToPrint({
    contentRef: preReceiptRef,
  });

  const handlePrintPost = useReactToPrint({
    contentRef: postReceiptRef,
  });

  // Store print handlers in refs to avoid adding them as useEffect dependencies
  // (useReactToPrint returns a new function reference on every render)
  const handlePrintPreRef = useRef(handlePrintPre);
  const handlePrintPostRef = useRef(handlePrintPost);
  useEffect(() => { handlePrintPreRef.current = handlePrintPre; });
  useEffect(() => { handlePrintPostRef.current = handlePrintPost; });

  const paymentStatusRef = useRef(customerInfo.paymentStatus);
  useEffect(() => { paymentStatusRef.current = customerInfo.paymentStatus; }, [customerInfo.paymentStatus]);

  useEffect(() => {
    if (cartView === 'SUCCESS') {
      // Auto-print based on payment status at time of order confirmation
      const timer = setTimeout(() => {
        if (paymentStatusRef.current === 'PAID') {
          handlePrintPostRef.current();
        } else {
          handlePrintPreRef.current();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartView]);

  return (
    <div style={{ 
      width: '320px', display: 'flex', flexDirection: 'column', 
      padding: '1.5rem', height: '100vh', 
      background: 'rgba(15, 23, 42, 0.8)', 
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(30px)',
      position: 'relative',
      borderRadius: '2rem 0 0 2rem',
      boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
    }}>
      
      {cartView === 'CART' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', paddingTop: '0.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Cart</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hotel ID: {user?.hotelId || "N/A"}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.75rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ backgroundColor: 'var(--primary)', padding: '0.6rem', borderRadius: '0.75rem', display: 'flex' }}>
              <MapPin size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '0.02em' }}>{user?.hotelName || "Hotel Address"}</h4>
              <p style={{ fontSize: '0.7rem', color: '#a0aec0', margin: 0, lineHeight: '1.4', marginTop: '0.1rem' }}>{user?.hotelAddress || "Bengaluru, India"}</p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: '2rem', 
            padding: '0.3rem', 
            marginBottom: '1rem', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
          }}>
            {['Delivery', 'Dine In', 'Takeaway'].map((type) => (
              <button 
                key={type} 
                onClick={() => setOrderType(type)} 
                style={{ 
                  flex: 1, 
                  backgroundColor: orderType === type ? 'var(--primary)' : 'transparent', 
                  color: orderType === type ? 'white' : 'var(--text-muted)', 
                  border: 'none', 
                  padding: '0.5rem 0.25rem', 
                  borderRadius: '2rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: orderType === type ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.75rem' }}>No items in cart</div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'} alt={item.itemName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, lineHeight: '1.1' }}>{item.itemName}</h4>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          ₹{Number(item.sellingPrice || 0).toFixed(2)} x {item.qty} = <span style={{ color: 'var(--text-main)', fontWeight: 700, marginLeft: '0.2rem' }}>₹{(Number(item.sellingPrice || 0) * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.15rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <button onClick={() => onRemove(item)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                          {item.qty === 1 ? <Trash2 size={10} color="#ef4444" /> : <Minus size={10} />}
                        </button>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '15px', textAlign: 'center', color: 'white' }}>{item.qty}</span>
                        <button onClick={() => onAdd(item)} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>GST</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{gst.toFixed(2)}</span>
              </div>
              {orderType === 'Delivery' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Delivery Charge</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{deliveryCharge.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
            </div>

            <div style={{ 
              width: '100%', 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              padding: '0.6rem 0.8rem', 
              borderRadius: '2rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '0.6rem' 
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Order Status</span>
              <div 
                onClick={() => setOrderStatus(prev => prev === 'PENDING' ? 'COMPLETED' : 'PENDING')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: orderStatus === 'COMPLETED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: `1px solid ${orderStatus === 'COMPLETED' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '1.5rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: orderStatus === 'COMPLETED' ? '0 0 12px rgba(34, 197, 94, 0.15)' : '0 0 12px rgba(245, 158, 11, 0.15)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  position: 'relative',
                  marginRight: '0.5rem',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: orderStatus === 'COMPLETED' ? '#22c55e' : '#f59e0b',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '3px',
                    left: orderStatus === 'COMPLETED' ? '21px' : '3px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: orderStatus === 'COMPLETED' ? '0 0 8px #22c55e' : '0 0 8px #f59e0b'
                  }} />
                </div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  color: orderStatus === 'COMPLETED' ? '#22c55e' : '#f59e0b',
                  letterSpacing: '0.05em'
                }}>
                  {orderStatus}
                </span>
              </div>
            </div>

            {showEmptyCartWarning && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#ef4444',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                textAlign: 'center',
                marginBottom: '0.5rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                Please add items to your cart first!
              </div>
            )}

            <button 
              className="btn-primary" 
              style={{ 
                padding: '0.6rem', 
                borderRadius: '2rem', 
                fontSize: '0.8125rem',
                opacity: cartItems.length === 0 ? 0.5 : 1,
                cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }} 
              onClick={handleConfirmOrderClick}
            >
              Confirm Order
            </button>
          </div>
        </>
      )}

      {cartView === 'DETAILS' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
            <button onClick={() => setCartView('CART')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Customer Details</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Customer Name</label>
              <input 
                type="text" 
                value={customerInfo.customerName}
                onChange={(e) => setCustomerInfo({...customerInfo, customerName: e.target.value})}
                style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Mobile Number</label>
                <input 
                  type="text" 
                  maxLength="10"
                  value={customerInfo.customerMobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setCustomerInfo({...customerInfo, customerMobile: val});
                    }
                  }}
                  style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
                />
              </div>

              {orderType === 'Dine In' && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Table No</label>
                  <input 
                    type="text" 
                    value={customerInfo.tableNo}
                    onChange={(e) => setCustomerInfo({...customerInfo, tableNo: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Payment Mode</label>
                <select 
                  value={customerInfo.paymentMode}
                  onChange={(e) => setCustomerInfo({...customerInfo, paymentMode: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
                >
                  <option value="CASH" style={{ background: '#0f172a', color: 'white' }}>CASH</option>
                  <option value="UPI" style={{ background: '#0f172a', color: 'white' }}>UPI</option>
                  <option value="CARD" style={{ background: '#0f172a', color: 'white' }}>CARD</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Status</label>
                <select 
                  value={customerInfo.paymentStatus}
                  onChange={(e) => setCustomerInfo({...customerInfo, paymentStatus: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
                >
                  <option value="PAID" style={{ background: '#0f172a', color: 'white' }}>PAID</option>
                  <option value="PENDING" style={{ background: '#0f172a', color: 'white' }}>PENDING</option>
                </select>
              </div>
            </div>

            {(customerInfo.paymentMode === 'UPI' || customerInfo.paymentMode === 'CARD') && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Transaction ID</label>
                <input 
                  type="text" 
                  value={customerInfo.transactionId}
                  onChange={(e) => setCustomerInfo({...customerInfo, transactionId: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
                  placeholder="e.g., TXN123456"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Discount Amount (₹)</label>
              <input 
                type="number" 
                min="0"
                step="any"
                value={customerInfo.discountAmount === 0 ? '' : customerInfo.discountAmount}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setCustomerInfo({...customerInfo, discountAmount: 0});
                  } else {
                    setCustomerInfo({...customerInfo, discountAmount: parseFloat(val)});
                  }
                }}
                placeholder="0"
                style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Remarks</label>
              <input 
                type="text" 
                value={customerInfo.remarks}
                onChange={(e) => setCustomerInfo({...customerInfo, remarks: e.target.value})}
                style={{ width: '100%', padding: '0.5rem 0.6rem', fontSize: '0.8rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
                placeholder="e.g., Less spicy"
              />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount to Pay</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{Math.max(0, total - (customerInfo.discountAmount || 0)).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => handleCompleteOrder(true)}
                disabled={isConfirming}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: isConfirming ? 0.7 : 1 }}
              >
                Skip & Save
              </button>
              <button 
                onClick={() => handleCompleteOrder(false)}
                disabled={isConfirming}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '2rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: isConfirming ? 0.7 : 1 }}
              >
                {isConfirming ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cartView === 'SUCCESS' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <CheckCircle size={32} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Order ID: {currentOrderId}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => handlePrintPre()}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '2rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Printer size={18} /> Pre-Bill
              </button>
              <button 
                onClick={() => handlePrintPost()}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '2rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Printer size={18} /> Post-Bill
              </button>
            </div>
            <button 
              onClick={handleNewOrder}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '2rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Start New Order
            </button>
          </div>
        </div>
      )}

      {/* Hidden Receipts for Printing */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div ref={preReceiptRef}>
          <ThermalReceipt 
            type="pre"
            orderData={{
              hotelName: user?.hotelName,
              hotelAddress: user?.hotelAddress,
              orderId: currentOrderId,
              tableNo: customerInfo.tableNo,
              customerName: customerInfo.customerName,
              paymentMode: customerInfo.paymentMode,
              paymentStatus: customerInfo.paymentStatus,
              items: cartItems,
              totalAmount: total - (customerInfo.discountAmount || 0),
              gstAmount: gst,
              givenType: orderType.toUpperCase().replace(' ', '_'),
              orderDate: new Date().toLocaleDateString(),
              orderTime: new Date().toLocaleTimeString()
            }}
          />
          {/* Tear Line for Kitchen Slip */}
          <div style={{ width: '80mm', margin: '20px 0', borderBottom: '2px dashed black', textAlign: 'center', fontSize: '10px' }}>✂️ TEAR HERE ✂️</div>
          <ThermalReceipt 
            type="kot"
            orderData={{
              hotelName: user?.hotelName,
              hotelAddress: user?.hotelAddress,
              orderId: currentOrderId,
              tableNo: customerInfo.tableNo,
              customerName: customerInfo.customerName,
              items: cartItems,
              givenType: orderType.toUpperCase().replace(' ', '_'),
              orderDate: new Date().toLocaleDateString(),
              orderTime: new Date().toLocaleTimeString()
            }}
          />
        </div>

        <div ref={postReceiptRef}>
          <ThermalReceipt 
            type="post"
            orderData={{
              hotelName: user?.hotelName,
              hotelAddress: user?.hotelAddress,
              orderId: currentOrderId,
              tableNo: customerInfo.tableNo,
              customerName: customerInfo.customerName,
              paymentMode: customerInfo.paymentMode,
              paymentStatus: customerInfo.paymentStatus,
              items: cartItems,
              totalAmount: total - (customerInfo.discountAmount || 0),
              gstAmount: gst,
              givenType: orderType.toUpperCase().replace(' ', '_'),
              orderDate: new Date().toLocaleDateString(),
              orderTime: new Date().toLocaleTimeString()
            }}
          />
          {/* Tear Line for Kitchen Slip */}
          <div style={{ width: '80mm', margin: '20px 0', borderBottom: '2px dashed black', textAlign: 'center', fontSize: '10px' }}>✂️ TEAR HERE ✂️</div>
          <ThermalReceipt 
            type="kot"
            orderData={{
              hotelName: user?.hotelName,
              hotelAddress: user?.hotelAddress,
              orderId: currentOrderId,
              tableNo: customerInfo.tableNo,
              customerName: customerInfo.customerName,
              items: cartItems,
              givenType: orderType.toUpperCase().replace(' ', '_'),
              orderDate: new Date().toLocaleDateString(),
              orderTime: new Date().toLocaleTimeString()
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default CartPanel;
