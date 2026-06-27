import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

import Login from '../pages/Login';
import Menu from '../pages/Menu';
import Home from '../pages/Home';
import ItemManagement from '../pages/ItemManagement';
import UserManagement from '../pages/UserManagement';
import HotelManagement from '../pages/HotelManagement';
import PendingOrders from '../pages/PendingOrders';
import CompletedOrders from '../pages/CompletedOrders';
import AllOrders from '../pages/AllOrders';
import CancelledOrders from '../pages/CancelledOrders';
import TakeawayOrders from '../pages/TakeawayOrders';
import DayWiseBills from '../pages/DayWiseBills';
import MonthWiseBills from '../pages/MonthWiseBills';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Menu />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/report" element={<Home />} />
          
          {/* Redirects/Aliases for requested private routes */}
          <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
          <Route path="/orders" element={<Navigate to="/order-management/all" replace />} />
          <Route path="/items" element={<Navigate to="/item-management" replace />} />
          <Route path="/bill-management" element={<Navigate to="/bill-management/daywisebills" replace />} />
          
          <Route path="/item-management" element={<ItemManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/hotel-management" element={<HotelManagement />} />
          <Route path="/order-management/pending" element={<PendingOrders />} />
          <Route path="/order-management/all" element={<AllOrders />} />
          <Route path="/order-management/completed" element={<CompletedOrders />} />
          <Route path="/order-management/cancelled" element={<CancelledOrders />} />
          <Route path="/order-management/takeaway" element={<TakeawayOrders />} />
          <Route path="/bill-management/daywisebills" element={<DayWiseBills />} />
          <Route path="/bill-management/monthwisebills" element={<MonthWiseBills />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;
