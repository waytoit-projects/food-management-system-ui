import React from 'react';
import { X, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeConfigurator = () => {
  const {
    primaryColor, setPrimaryColor,
    sidebarType, setSidebarType,
    isNavbarFixed, setIsNavbarFixed,
    isSidebarMini, setIsSidebarMini,
    isConfiguratorOpen, setIsConfiguratorOpen
  } = useTheme();

  if (!isConfiguratorOpen) return null;

  const colors = [
    { name: 'Purple', hex: '#cb3cff' },
    { name: 'Dark Blue', hex: '#060b26' },
    { name: 'Blue', hex: '#0075ff' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Orange', hex: '#f59e0b' },
    { name: 'Red', hex: '#ef4444' }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '350px', height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', color: '#1f2937',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#060b26' }}>Soft UI Configurator</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0' }}>See our dashboard options.</p>
        </div>
        <button onClick={() => setIsConfiguratorOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {/* Sidenav Colors */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Sidenav Colors</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {colors.map(color => (
              <div
                key={color.hex}
                onClick={() => setPrimaryColor(color.hex)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: color.hex, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: primaryColor === color.hex ? '2px solid #060b26' : 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                {primaryColor === color.hex && <Check size={12} color="white" />}
              </div>
            ))}
          </div>
        </div>

        {/* Sidenav Type */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sidenav Type</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Choose between 2 different sidenav types.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setSidebarType('transparent')}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.75rem',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: sidebarType === 'transparent' ? 'var(--primary)' : 'transparent',
                color: sidebarType === 'transparent' ? 'white' : 'var(--primary)',
                outline: sidebarType === 'transparent' ? 'none' : '1px solid var(--primary)'
              }}
            >
              TRANSPARENT
            </button>
            <button
              onClick={() => setSidebarType('white')}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.75rem',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: sidebarType === 'white' ? 'var(--primary)' : 'transparent',
                color: sidebarType === 'white' ? 'white' : 'var(--primary)',
                outline: sidebarType === 'white' ? 'none' : '1px solid var(--primary)'
              }}
            >
              WHITE
            </button>
          </div>
        </div>

        {/* Navbar Fixed */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Navbar Fixed</h3>
          <div 
            onClick={() => setIsNavbarFixed(!isNavbarFixed)}
            style={{ 
              width: '40px', height: '22px', borderRadius: '11px', 
              backgroundColor: isNavbarFixed ? 'var(--primary)' : '#cbd5e1',
              position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            <div style={{ 
              position: 'absolute', top: '2px', left: isNavbarFixed ? '20px' : '2px', 
              width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
              transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
          </div>
        </div>

        {/* Sidenav Mini */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Sidenav Mini</h3>
          <div 
            onClick={() => setIsSidebarMini(!isSidebarMini)}
            style={{ 
              width: '40px', height: '22px', borderRadius: '11px', 
              backgroundColor: isSidebarMini ? 'var(--primary)' : '#cbd5e1',
              position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            <div style={{ 
              position: 'absolute', top: '2px', left: isSidebarMini ? '20px' : '2px', 
              width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
              transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeConfigurator;
