import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeConfigurator from '../components/ThemeConfigurator';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
  const { isSidebarMini } = useTheme();

  return (
    <div className="vision-theme" style={{ display: 'flex', minHeight: '100vh', width: '100vw', gap: '0', position: 'relative', overflow: 'hidden' }}>
      <div className="vision-bg"></div>
      
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        position: 'relative', 
        zIndex: 200, 
        padding: isSidebarMini ? '1.5rem 1.5rem 1.5rem 1.5rem' : '1.5rem 2rem 1.5rem 1rem',
        transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <Outlet />
      </div>

      {/* Theme Configurator Drawer */}
      <ThemeConfigurator />
    </div>
  );
};

export default MainLayout;

