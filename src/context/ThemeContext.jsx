import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#0075ff'); // Default Vision Blue
  const [sidebarType, setSidebarType] = useState('transparent'); // transparent or white
  const [isNavbarFixed, setIsNavbarFixed] = useState(true);
  const [isSidebarMini, setIsSidebarMini] = useState(false);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

  // Apply primary color to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    
    // Set hover color (slightly darker)
    const hoverColor = primaryColor === '#0075ff' ? '#0066e0' : primaryColor; 
    document.documentElement.style.setProperty('--primary-hover', hoverColor);

    // Set shadow color (transparent version of primary)
    // For simplicity, we can just use the hex with 0.5 opacity in CSS if we use hex colors
    // or set a dedicated variable.
    document.documentElement.style.setProperty('--primary-shadow', `${primaryColor}80`); // 80 is ~0.5 opacity in hex
  }, [primaryColor]);

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
