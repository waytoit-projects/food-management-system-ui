import React, { useState } from 'react';
import { Search, Bell, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ searchQuery, setSearchQuery, showSlider, setShowSlider }) => {
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const displayName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'User';
  const profileImage = user?.userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80";

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img 
          src={profileImage} 
          alt="Profile" 
          onClick={() => setIsProfileModalOpen(true)}
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'transform 0.2s' }} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Welcome back, <span style={{ color: 'var(--primary)' }}>{displayName}</span>
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)', zIndex: 10 }} size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type here..." 
            style={{ 
              width: '100%', padding: '0.75rem 1.25rem 0.75rem 3.25rem', 
              borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)',
              outline: 'none', fontSize: '0.8rem', backdropFilter: 'blur(10px)'
            }}
          />
        </div>
        
        {setShowSlider && (
          <div 
            onClick={() => setShowSlider(!showSlider)} 
            style={{ 
              position: 'relative', cursor: 'pointer', color: showSlider ? 'var(--primary)' : '#a0aec0', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              width: '42px', height: '42px', 
              borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={showSlider ? "Hide Offers" : "Show Offers"}
          >
            {showSlider ? <Eye size={20} /> : <EyeOff size={20} />}
          </div>
        )}

        <div style={{ 
          position: 'relative', cursor: 'pointer', color: 'var(--text-main)', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          width: '42px', height: '42px', 
          borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-main)' }}></span>
        </div>
      </div>

      {/* Profile Image Popup Modal */}
      {isProfileModalOpen && (
        <div 
          onClick={() => setIsProfileModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', padding: '1rem' }}
          >
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              style={{
                position: 'absolute', top: '-1rem', right: '-1rem',
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10
              }}
            >
              <X size={24} color="#000" />
            </button>
            <img 
              src={profileImage} 
              alt="Profile Big" 
              style={{ 
                width: '350px', height: '350px', 
                borderRadius: '50%', border: '8px solid rgba(255,255,255,0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                objectFit: 'cover'
              }}
            />
            <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-main)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{displayName}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem' }}>{user?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
