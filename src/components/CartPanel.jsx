import React, { useState } from 'react';
import { Minus, Plus, Trash2, MapPin, Printer, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CartPanel = ({ cartItems, onAdd, onRemove }) => {
  const { user } = useAuth();
  const [orderType, setOrderType] = useState('Dine In');
  const [showBill, setShowBill] = useState(false);

  // calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + ((item.sellingPrice || 0) * item.qty), 0);
  
  // calculate GST
  const gst = cartItems.reduce((sum, item) => {
    const itemGst = item.gstPercentage || 0;
    return sum + ((item.sellingPrice || 0) * item.qty * (itemGst / 100));
  }, 0);

  // Example: Add delivery charge if order type is delivery
  const deliveryCharge = orderType === 'Delivery' ? 5.00 : 0;
  const total = subtotal + gst + deliveryCharge;

  return (
    <div style={{ 
      width: '320px', display: 'flex', flexDirection: 'column', 
      padding: '1.5rem', height: '100vh', 
      background: 'rgba(6, 11, 38, 0.85)', 
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(24px)',
      position: 'relative',
      borderRadius: '1.5rem 0 0 1.5rem'
    }}>
      


      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', 
        marginBottom: '1rem', paddingTop: '0.5rem' 
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Cart</h2>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Order ID: #1099</span>
      </div>

      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '0.75rem', 
        marginBottom: '1.25rem', padding: '0.75rem', borderRadius: '1rem', 
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{ backgroundColor: 'var(--primary)', padding: '0.6rem', borderRadius: '0.75rem', display: 'flex' }}>
          <MapPin size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '0.02em' }}>{user?.hotelName || "Hotel Address"}</h4>
          <p style={{ fontSize: '0.7rem', color: '#a0aec0', margin: 0, lineHeight: '1.4', marginTop: '0.1rem' }}>{user?.hotelAddress || "Bengaluru, India"}</p>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: 'var(--bg-main)', 
        borderRadius: '2rem', 
        padding: '0.2rem', 
        marginBottom: '0.75rem',
        border: '1px solid var(--border-color)'
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
              padding: '0.35rem',
              borderRadius: '2rem',
              fontSize: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      
      {/* Items Container - Removed flex: 1 to pull totals up */}
      <div style={{ 
        maxHeight: 'calc(100vh - 350px)', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem', 
        paddingRight: '0.25rem' 
      }}>
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
                      ₹{item.sellingPrice.toFixed(2)} x {item.qty} = 
                      <span style={{ color: 'var(--text-main)', fontWeight: 700, marginLeft: '0.2rem' }}>
                        ₹{(item.sellingPrice * item.qty).toFixed(2)}
                      </span>
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

      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        
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

        <button style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', padding: '0.6rem 0.8rem', borderRadius: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', cursor: 'pointer' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Promotion Code</span>
          <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.15rem 0.6rem', borderRadius: '1rem', fontSize: '0.6rem', fontWeight: 700 }}>TRYNEW</span>
        </button>

        <button 
          className="btn-primary" 
          style={{ padding: '0.6rem', borderRadius: '2rem', fontSize: '0.8125rem' }} 
          disabled={cartItems.length === 0}
          onClick={() => setShowBill(true)}
        >
          Confirm Order
        </button>
      </div>

      {/* Bill Slip Modal */}
      {showBill && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ 
            width: '380px', background: 'white', padding: '2rem', borderRadius: '0.5rem',
            color: '#333', fontFamily: '"Courier New", Courier, monospace',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative'
          }}>
            {/* Modal Close */}
            <button onClick={() => setShowBill(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
              <X size={20} />
            </button>

            {/* Bill Content for Printing */}
            <div id="bill-slip" style={{ border: '1px solid #eee', padding: '1.5rem', background: '#fff' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>{user?.hotelName || "VISION FOODS"}</h2>
                <p style={{ fontSize: '0.75rem', margin: '0', color: '#666' }}>{user?.hotelAddress || "123 Food Street, Bengaluru"}</p>
                <p style={{ fontSize: '0.75rem', margin: '0', color: '#666' }}>GSTIN: 29AAAAA0000A1Z5</p>
                <div style={{ borderBottom: '1px dashed #ccc', margin: '1rem 0' }}></div>
                <h4 style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>TAX INVOICE</h4>
              </div>

              <div style={{ fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0.2rem 0' }}><strong>Order:</strong> #1099</p>
                  <p style={{ margin: '0.2rem 0' }}><strong>Type:</strong> {orderType}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0.2rem 0' }}>{new Date().toLocaleDateString()}</p>
                  <p style={{ margin: '0.2rem 0' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '0.5rem 0', marginBottom: '1rem' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Item</th>
                      <th style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>Qty</th>
                      <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Price</th>
                      <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.id}>
                        <td style={{ padding: '0.4rem 0' }}>{item.itemName}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>{item.sellingPrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{(item.sellingPrice * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                <p style={{ margin: '0.3rem 0' }}>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p style={{ margin: '0.3rem 0' }}>GST (5%): ₹{gst.toFixed(2)}</p>
                {orderType === 'Delivery' && <p style={{ margin: '0.3rem 0' }}>Delivery: ₹{deliveryCharge.toFixed(2)}</p>}
                <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', fontWeight: 900, borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
                  GRAND TOTAL: ₹{total.toFixed(2)}
                </h3>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#666' }}>
                <p style={{ margin: '0.2rem 0' }}>*** Thank You! Visit Again ***</p>
                <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>Powered by Vision POS</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                onClick={() => setShowBill(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const printContent = document.getElementById('bill-slip').innerHTML;
                  const printWindow = window.open('', '', 'height=600,width=400');
                  printWindow.document.write('<html><head><title>Print Bill</title>');
                  printWindow.document.write('<style>body{font-family: "Courier New", Courier, monospace; padding: 20px;}</style>');
                  printWindow.document.write('</head><body>');
                  printWindow.document.write(printContent);
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.print();
                }}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: '#0075ff', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Printer size={18} /> Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CartPanel;
