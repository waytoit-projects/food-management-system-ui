import React from 'react';
import { Outlet } from 'react-router-dom';
import bgImage from '../assets/bg.png';

const AuthLayout = () => {
  return (
    <div 
      className="login-theme"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      {/* Dark overlay for better readability */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 0
        }}
      ></div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
