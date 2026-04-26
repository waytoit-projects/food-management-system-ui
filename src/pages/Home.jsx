import React, { useState } from 'react';
import { Search, MonitorPlay, Bell, Settings, MapPin, Plus, Star, Heart, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const popularDishes = [
  { id: 1, name: 'Fish Burger', price: '$5.59', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', rating: 5, discount: '15% Off' },
  { id: 2, name: 'Beef Burger', price: '$5.59', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=80', rating: 5 },
  { id: 3, name: 'Cheese Burger', price: '$5.59', img: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=300&q=80', rating: 5 },
  { id: 4, name: 'Veg. Burger', price: '$5.59', img: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300&q=80', rating: 5, discount: '15% Off' }
];

const recentOrders = [
  { id: 1, name: 'Fish Burger', price: '$5.59', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80' },
  { id: 2, name: 'Japan Ramen', price: '$5.59', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&q=80' },
  { id: 3, name: 'Fried Rice', price: '$5.59', img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&q=80' },
  { id: 4, name: 'Fried Rice', price: '$5.59', img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=80' }
];

const orderMenu = [
  { id: 1, name: 'Pepperoni Pizza', qty: 1, price: '$5.59', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=100&q=80' },
  { id: 2, name: 'Cheese Burger', qty: 1, price: '$5.59', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=80' },
  { id: 3, name: 'Vegan Pizza', qty: 1, price: '$5.59', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100&q=80' }
];

const Home = () => {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(true);
  
  const displayName = user?.username || 'User';
  const profileImage = user?.userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80";
  const hotelName = user?.hotelName || "Vision POS";
  const hotelId = user?.hotelId || "N/A";

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '100%', padding: '0.5rem 0' }}>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '0.5rem' }}>
        
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={profileImage} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} 
              />
              {user?.hotelLogo && (
                <img 
                  src={user.hotelLogo} 
                  alt="Hotel Logo" 
                  style={{ 
                    position: 'absolute', bottom: '-2px', right: '-2px', 
                    width: '18px', height: '18px', borderRadius: '4px', 
                    border: '1px solid rgba(255,255,255,0.4)', backgroundColor: '#1a1f37',
                    objectFit: 'cover'
                  }} 
                />
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Hi, {displayName}!
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#a0aec0', margin: 0 }}>{hotelName}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(0, 117, 255, 0.1)' }}>
                  ID: {hotelId}
                </span>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'white', zIndex: 10 }} size={16} />
            <input 
              type="text" 
              placeholder="Type here..." 
              style={{ 
                width: '100%', padding: '0.65rem 1rem 0.65rem 2.75rem', 
                borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.1)', 
                backgroundColor: 'rgba(6, 11, 38, 0.5)', color: 'white',
                outline: 'none', fontSize: '0.75rem'
              }}
            />
          </div>
        </div>

        {/* Promo Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(6, 11, 38, 0.9), rgba(26, 31, 55, 0.9))',
          borderRadius: '1.5rem', 
          padding: '2rem 2.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: 'white',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(0, 117, 255, 0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0', marginBottom: '0.5rem' }}>WELCOME TO VISION POS</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: '1.2', marginBottom: '1rem' }}>
              Control your restaurant<br/><span style={{ color: 'var(--primary)' }}>with precision and style</span>
            </h2>
            <button style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              VIEW STATISTICS
            </button>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" 
            alt="Burger Promo" 
            style={{ height: '140px', objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }} 
          />
        </div>

        {/* Popular Dishes */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>Popular Dishes</h2>
            <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>View all</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {popularDishes.map(dish => (
              <div key={dish.id} className="glass-panel" style={{ padding: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: '#a0aec0', cursor: 'pointer', zIndex: 1 }}>
                  <Heart size={16} />
                </div>
                
                <img src={dish.img} alt={dish.name} style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '0.75rem' }} />
                
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: 'white' }}>{dish.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{dish.price}</span>
                  <button style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table Style */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem' }}>Recent Orders</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentOrders.map((order, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={order.img} alt={order.name} style={{ width: '40px', height: '40px', borderRadius: '0.75rem', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', margin: 0 }}>{order.name}</h3>
                    <p style={{ fontSize: '0.65rem', color: '#a0aec0', margin: 0 }}>Order #24252</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white', display: 'block' }}>{order.price}</span>
                  <span style={{ fontSize: '0.6rem', color: '#48bb78', fontWeight: 700 }}>COMPLETED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '2rem 0 1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: '#a0aec0'
        }}>
          <p style={{ fontSize: '0.75rem', margin: 0, fontWeight: 600 }}>
            Powered by <span style={{ color: 'var(--primary)', fontWeight: 800 }}>WayToIT</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#48bb78' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>VERSION 1.0.1</span>
          </div>
        </div>

      </div>

      {/* Right Sidebar (Cart / Profile) */}
      <div style={{ 
        width: '320px', display: 'flex', flexDirection: 'column', 
        padding: '1.5rem', height: '100vh', 
        position: 'sticky', top: '0', right: '0',
        background: 'rgba(6, 11, 38, 0.85)', 
        borderLeft: isCartOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        backdropFilter: 'blur(24px)',
        marginRight: isCartOpen ? '-2rem' : '0',
        overflow: 'hidden',
        borderRadius: '1.5rem 0 0 1.5rem',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          style={{
            position: 'absolute',
            left: isCartOpen ? '-15px' : '-40px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            color: 'white'
          }}
        >
          {isCartOpen ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
        
        {/* Top Icons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>Billing Details</h3>
          <div style={{ display: 'flex', gap: '0.75rem', color: '#a0aec0' }}>
            <Bell size={18} cursor="pointer" />
            <Settings size={18} cursor="pointer" />
          </div>
        </div>



        {/* Order Menu */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>Your Cart</h3>
            <span style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700 }}>3 items</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orderMenu.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={item.img} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', marginBottom: '0.1rem' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.65rem', color: '#a0aec0' }}>Qty: {item.qty}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Checkout */}
        <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>Subtotal</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>$201.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>Total</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>$202.00</span>
          </div>

          <button className="btn-primary" style={{ padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.75rem', boxShadow: '0 4px 15px rgba(0, 117, 255, 0.4)', marginBottom: '1.5rem' }}>
            PLACE ORDER
          </button>

          {/* Hotel Address Footer */}
          <div style={{ 
            padding: '1rem', borderRadius: '0.75rem', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h4 style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Hotel Location</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '52px' }}>
              <MapPin size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{user?.hotelAddress?.split(',')[0] || "Main Branch"}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#a0aec0', lineHeight: '1.4', margin: 0 }}>{user?.hotelAddress?.split(',').slice(1).join(',') || "Bengaluru, India"}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
