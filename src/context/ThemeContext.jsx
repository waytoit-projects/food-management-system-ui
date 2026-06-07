import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#0075ff'); // Default Vision Blue
  const [sidebarType, setSidebarType] = useState('transparent'); // transparent or white
  const [isNavbarFixed, setIsNavbarFixed] = useState(true);
  const [isSidebarMini, setIsSidebarMini] = useState(false);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

  // Apply colors to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    
    // Set hover color (slightly darker)
    const hoverColor = primaryColor === '#0075ff' ? '#0066e0' : primaryColor; 
    document.documentElement.style.setProperty('--primary-hover', hoverColor);

    // Set shadow color (Slightly more vibrant: 30% = 4D in hex)
    document.documentElement.style.setProperty('--primary-shadow', `${primaryColor}4D`);

    // Dynamic Background logic
    const isWhite = sidebarType === 'white';
    
    const getBgColor = (hex) => {
      if (isWhite) return '#f8fafc'; // Standard Soft UI Light Background
      
      const bgMap = {
        '#cb3cff': '#1a052e', // Purple
        '#060b26': '#060b26', // Dark Blue
        '#0075ff': '#060b26', // Default Blue
        '#10b981': '#051b14', // Green
        '#f59e0b': '#1b1205', // Orange
        '#ef4444': '#1b0505'  // Red
      };
      return bgMap[hex.toLowerCase()] || '#060b26';
    };
    
    const bgColor = getBgColor(primaryColor);
    document.documentElement.style.setProperty('--bg-main', bgColor);
    document.documentElement.style.setProperty('--bg-panel', isWhite ? '#ffffff' : `${bgColor}d9`);
    document.documentElement.style.setProperty('--bg-card', isWhite ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)');
    document.documentElement.style.setProperty('--glass-bg', isWhite ? 'rgba(255, 255, 255, 0.8)' : `${bgColor}cc`);
    
    // Adjust Text and Borders for Light Theme
    if (isWhite) {
      document.documentElement.style.setProperty('--text-main', '#1e293b');
      document.documentElement.style.setProperty('--text-muted', '#64748b');
      document.documentElement.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
    } else {
      document.documentElement.style.setProperty('--text-main', '#ffffff');
      document.documentElement.style.setProperty('--text-muted', '#a0aec0');
      document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
    }
  }, [primaryColor, sidebarType]);

  // Apply Sidebar Width
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isSidebarMini ? '56px' : '280px');
  }, [isSidebarMini]);

  const value = {
    primaryColor,
    setPrimaryColor,
    sidebarType,
    setSidebarType,
    isNavbarFixed,
    setIsNavbarFixed,
    isSidebarMini,
    setIsSidebarMini,
    isConfiguratorOpen,
    setIsConfiguratorOpen
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
