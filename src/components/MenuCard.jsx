import React from 'react';
import { Plus, Minus, Heart, Leaf } from 'lucide-react';

const MenuCard = ({ item, cartQty, onAdd, onRemove }) => {
  return (
    <div className="glass-panel" style={{ padding: '0.6rem', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Badges */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#cbd5e1', cursor: 'pointer', zIndex: 1 }}>
        <Heart size={20} fill="currentColor" />
      </div>
      {item.isVeg !== undefined && item.isVeg !== null && (
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: item.isVeg ? '#10b981' : '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '0.5rem', zIndex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Leaf size={10} /> {item.isVeg ? 'Veg' : 'Non-Veg'}
        </div>
      )}
      
      <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'} alt={item.itemName} style={{ width: '100%', height: '90px', objectFit: 'contain', marginBottom: '0.5rem' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.itemName}</h3>
      </div>
      
      {/* Meta Info */}
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        {item.spicyLevel && <span>🌶️ {item.spicyLevel}</span>}
        {item.preparationTime && <span>⏱️ {item.preparationTime}</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        {/* Price: show totalAmount (selling + GST), fallback to sellingPrice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ₹{Number(
                item.totalAmount ||
                (Number(item.sellingPrice || 0) + Number(item.gstAmount || 0))
              ).toFixed(2)}
          </span>
          {Number(item.gstAmount || item.gstPercentage) > 0 && (
            <span style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 500 }}>incl. GST</span>
          )}
        </div>
        
        {cartQty > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '2rem', padding: '0.25rem' }}>
            <button onClick={() => onRemove(item)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
              <Minus size={16} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{cartQty}</span>
            <button onClick={() => onAdd(item)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => onAdd(item)} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Plus size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
