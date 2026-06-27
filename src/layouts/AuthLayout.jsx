import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#051c1e', overflow: 'hidden' }}>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
