import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      padding: '1rem 2rem', borderTop: '1px solid var(--border-color)', 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: '0.875rem', color: 'var(--text-muted)'
    }}>
      <div>&copy; {new Date().getFullYear()} Grand Palace Hotel Management System. All rights reserved.</div>
      <div>Version 1.0.0</div>
    </footer>
  );
};

export default Footer;
