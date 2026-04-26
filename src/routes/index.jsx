import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login';
import Menu from '../pages/Menu';
import ItemManagement from '../pages/ItemManagement';
import UserManagement from '../pages/UserManagement';
import HotelManagement from '../pages/HotelManagement';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Menu />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/item-management" element={<ItemManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/hotel-management" element={<HotelManagement />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;
