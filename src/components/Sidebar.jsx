import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, ClipboardList, Clock, PieChart, Users, Building2,
  Settings as SettingsIcon, LogOut, HelpCircle, Star, ShieldCheck,
  ChevronsRight, ChevronsLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { setIsConfiguratorOpen, sidebarType, isSidebarMini, setIsSidebarMini } = useTheme();

  const navItems = [
    { name: 'Menu', path: '/home', icon: LayoutGrid, section: 'MAIN' },
    { name: 'Item Management', path: '/item-management', icon: ClipboardList, section: 'PAGES' },
    { name: 'Order History', path: '/history', icon: Clock, section: 'PAGES' },
    { name: 'Report', path: '/report', icon: PieChart, section: 'PAGES' },
    { name: 'Hotel Management', path: '/hotel-management', icon: Building2, section: 'ADMIN' },
    { name: 'User Management', path: '/user-management', icon: Users, section: 'ADMIN' },
    { name: 'Settings', action: () => setIsConfiguratorOpen(true), icon: SettingsIcon, section: 'ADMIN' },
  ];

  const sections = ['MAIN', 'PAGES', 'ADMIN'];

  return (
    <aside className="vision-sidebar" style={{
      width: isSidebarMini ? '56px' : '280px',
      minWidth: isSidebarMini ? '56px' : '280px',
      height: '100vh',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      padding: isSidebarMini ? '1.5rem 0' : '1.5rem 1rem',
      zIndex: 100,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: sidebarType === 'white' ? '#ffffff' : 'rgba(6, 11, 38, 0.85)',
      color: sidebarType === 'white' ? '#1f2937' : 'white',
      borderRight: sidebarType === 'white' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
      flexShrink: 0
    }}>
      {/* Mini Sidebar Toggle */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarMini(!isSidebarMini);
        }}
        style={{
          position: 'absolute', top: '1.25rem', right: '0.75rem',
          width: '28px', height: '28px', borderRadius: '0.5rem', 
          backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1000, transition: 'all 0.3s',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        {isSidebarMini ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </div>

      {/* App Logo/Name */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '0.75rem', 
        padding: isSidebarMini ? '0' : '0.5rem 1rem 1.5rem', 
        borderBottom: isSidebarMini ? 'none' : '1px solid rgba(255,255,255,0.1)', 
        marginBottom: isSidebarMini ? '0.5rem' : '1rem', 
        opacity: isSidebarMini ? 0 : 1, transition: 'all 0.2s', 
        visibility: isSidebarMini ? 'hidden' : 'visible',
        height: isSidebarMini ? '20px' : 'auto'
      }}>
        <div style={{ 
          backgroundColor: user?.hotelLogo ? 'rgba(255,255,255,0.05)' : 'var(--primary)', 
          padding: user?.hotelLogo ? '0' : '0.6rem', 
          borderRadius: '0.75rem', 
          display: 'flex',
          overflow: 'hidden',
          width: '50px',
          height: '50px',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {user?.hotelLogo ? (
            <img src={user.hotelLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Star size={24} color="white" fill="white" />
          )}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', color: 'white', textTransform: 'uppercase' }}>
          {user?.hotelName || "VISION POS"}
        </span>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {sections.map(section => (
          <React.Fragment key={section}>
            <div style={{ 
              fontSize: '0.6rem', fontWeight: 800, color: '#a0aec0', 
              padding: isSidebarMini ? '1rem 0 0.5rem' : '0.75rem 1rem 0.25rem', 
              letterSpacing: '0.1em', textAlign: isSidebarMini ? 'center' : 'left',
              transition: 'all 0.3s'
            }}>
              {section}
            </div>
            {navItems.filter(item => item.section === section).map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/home');
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  onClick={() => item.action ? item.action() : navigate(item.path)}
                  className={`vision-nav-item ${isActive ? 'active' : ''}`}
                  style={{ 
                    color: sidebarType === 'white' && !isActive ? '#64748b' : 'inherit',
                    justifyContent: isSidebarMini ? 'center' : 'flex-start',
                    padding: isSidebarMini ? '0.75rem 0' : '0.75rem 1rem'
                  }}
                >
                  <div 
                    className="icon-box" 
                    style={{ 
                      minWidth: isSidebarMini ? '30px' : '34px', 
                      height: isSidebarMini ? '30px' : '34px',
                      backgroundColor: isActive ? 'var(--primary)' : (sidebarType === 'white' ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                      boxShadow: !isActive ? '0 4px 6px rgba(0,0,0,0.05)' : '0 4px 12px var(--primary-shadow)',
                      borderRadius: '0.6rem',
                      color: isActive ? 'white' : 'var(--primary)'
                    }}
                  >
                    <Icon size={isSidebarMini ? 14 : 18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {!isSidebarMini && <span>{item.name}</span>}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </nav>


      {/* Logout */}
      <div
        onClick={logout}
        className="vision-nav-item"
        style={{ 
          marginTop: '1rem', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          paddingTop: '1rem',
          justifyContent: isSidebarMini ? 'center' : 'flex-start',
          paddingLeft: isSidebarMini ? 0 : '1rem'
        }}
      >
        <div className="icon-box" style={{ background: '#fef2f2', color: '#ef4444', minWidth: isSidebarMini ? '30px' : '34px', height: isSidebarMini ? '30px' : '34px', borderRadius: '0.6rem' }}>
          <LogOut size={isSidebarMini ? 14 : 18} />
        </div>
        {!isSidebarMini && <span style={{ color: '#ef4444' }}>Logout</span>}
      </div>
    </aside>
  );
};

export default Sidebar;
