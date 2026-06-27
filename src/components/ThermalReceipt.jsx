import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const ThermalReceipt = forwardRef(({ orderData, type = 'post' }, ref) => {
  if (!orderData) return null;

  const {
    hotelName = "RESTAURANT NAME",
    hotelAddress = "123, Food Street, Mumbai",
    orderId = "N/A",
    orderDate = new Date().toLocaleDateString(),
    orderTime = new Date().toLocaleTimeString(),
    customerName = "Walk-in",
    tableNo = "N/A",
    items = [],
    subtotal = 0,
    gstAmount = 0,
    totalAmount = 0,
    paymentMode = "CASH",
    paymentStatus = "PAID",
    givenType = "DINE_IN"
  } = orderData;

  const isKOT = type === 'kot';
  const isPrePayment = type === 'pre';
  const isPostPayment = type === 'post';

  return (
    <div ref={ref} style={{
      width: '80mm',
      padding: '10px',
      background: 'white',
      color: 'black',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: isKOT ? '14px' : '12px',
      fontWeight: isKOT ? 'bold' : 'normal',
      lineHeight: '1.2'
    }}>
      <style>
        {`
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 80mm;
            }
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
          }
          .receipt-table th {
            border-bottom: 2px dashed black;
            padding: 5px 0;
          }
          .receipt-table td {
            padding: 5px 0;
            vertical-align: top;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .dashed-line {
            border-top: 2px dashed black;
            width: 100%;
            margin: 8px 0;
          }
          .bold { font-weight: bold; }
          .item-row { font-size: ${isKOT ? '14px' : '11px'}; font-weight: ${isKOT ? 'bold' : 'normal'}; }
          .notes { font-size: ${isKOT ? '12px' : '10px'}; font-style: italic; margin-top: 2px; }
        `}
      </style>

      {/* Header */}
      <div className="text-center" style={{ width: '100%', marginBottom: '10px' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: isKOT ? '22px' : '18px', fontWeight: '900' }}>
          {hotelName}
        </h2>
        {!isKOT && <p style={{ margin: '0', fontSize: '11px', fontWeight: '500' }}>{hotelAddress}</p>}
        {isKOT && <h3 style={{ margin: '5px 0', fontSize: '18px', borderBottom: '2px solid black', display: 'inline-block' }}>KITCHEN SLIP</h3>}
        <div className="dashed-line"></div>
      </div>

      {/* Order Info */}
      <div style={{ fontSize: isKOT ? '13px' : '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="bold">Order ID: {orderId}</span>
          <span className="bold">Table: {tableNo}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date: {orderDate}</span>
          <span>Time: {orderTime}</span>
        </div>
        {!isKOT && <div>Customer: {customerName}</div>}
        <div className="bold" style={{ fontSize: isKOT ? '16px' : '12px', marginTop: '4px' }}>Type: {givenType?.replace('_', ' ')}</div>
        {isPostPayment && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Method: {paymentMode}</span>
            <span className="bold">Status: {paymentStatus}</span>
          </div>
        )}
      </div>

      <div className="dashed-line"></div>

      {/* Items Table */}
      <table className="receipt-table">
        <thead>
          <tr>
            <th className="text-left" style={{ width: isKOT ? '70%' : '45%' }}>Item</th>
            <th className="text-center" style={{ width: isKOT ? '30%' : '20%' }}>Qty</th>
            {!isKOT && <th className="text-right" style={{ width: '35%' }}>Total</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const qty = item.quantity || item.qty || 1;
            // Unit price = totalAmount (selling + GST) per unit
            const unitPrice = Number(
              item.totalAmount ||
              (Number(item.sellingPrice || 0) + Number(item.gstAmount || 0)) ||
              Number(item.sellingPrice || 0)
            );
            const lineTotal = unitPrice * qty;
            return (
              <React.Fragment key={index}>
                <tr className="item-row">
                  <td className="text-left">
                    <div>{item.itemName}</div>
                    {!isKOT && (
                      <div style={{ fontSize: '10px', color: '#555', fontWeight: 'normal' }}>
                        ₹{unitPrice.toFixed(2)} × {qty}
                      </div>
                    )}
                    {item.remarks && <div className="notes">Note: {item.remarks}</div>}
                  </td>
                  <td className="text-center" style={{ fontSize: isKOT ? '16px' : 'inherit', fontWeight: isKOT ? '900' : 'inherit' }}>
                    {qty}
                  </td>
                  {!isKOT && <td className="text-right" style={{ fontWeight: 'bold' }}>₹{lineTotal.toFixed(2)}</td>}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="dashed-line"></div>

      {/* Totals - Hidden for KOT */}
      {!isKOT && (
        <div style={{ fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₹{Number(subtotal || (totalAmount - gstAmount)).toFixed(2)}</span>
          </div>
          {gstAmount > 0 && (() => {
            // Use provided CGST/SGST amounts; fallback to half of total GST each
            const cgst = Number(orderData.ngstAmount || (gstAmount / 2));
            const sgst = Number(orderData.sgstAmount || (gstAmount / 2));
            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                  <span>CGST:</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>SGST:</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', borderTop: '1px dashed black', paddingTop: '2px' }}>
                  <span>Total GST:</span>
                  <span>₹{Number(gstAmount).toFixed(2)}</span>
                </div>
              </>
            );
          })()}
          {orderData.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-₹{Number(orderData.discountAmount).toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '15px' }} className="bold">
            <span>GRAND TOTAL:</span>
            <span>₹{Number(totalAmount).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* QR Code for Pre-Payment */}
      {isPrePayment && (
        <div className="text-center" style={{ marginTop: '15px' }}>
          <p style={{ fontSize: '10px', marginBottom: '5px' }}>Scan QR to Pay</p>
          <div style={{ display: 'inline-block', padding: '5px', background: 'white' }}>
            <QRCodeSVG 
              value={`upi://pay?pa=your-upi-id@bank&pn=${hotelName}&am=${totalAmount}&cu=INR`} 
              size={100}
            />
          </div>
          <p style={{ fontSize: '12px', marginTop: '5px' }} className="bold">Please complete payment</p>
        </div>
      )}

      {/* Footer / Payment Success */}
      {isPostPayment && (
        <div className="text-center" style={{ marginTop: '15px' }}>
          {orderData.transactionId && (
            <p style={{ fontSize: '10px', margin: '0 0 5px 0' }}>Txn ID: {orderData.transactionId}</p>
          )}
          <p className="bold" style={{ fontSize: '14px', margin: '0' }}>Payment Successful</p>
          <p style={{ fontSize: '12px', margin: '2px 0 0 0' }}>Paid: ₹{Number(totalAmount).toFixed(2)}</p>
          <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>Thank You Visit Again</p>
        </div>
      )}

      {!isKOT && (
        <>
          <div className="dashed-line" style={{ marginTop: '15px' }}></div>
          <div className="text-center" style={{ fontSize: '8px', color: '#666' }}>
            Powered by WayToIT
          </div>
        </>
      )}
    </div>
  );
});

export default ThermalReceipt;

