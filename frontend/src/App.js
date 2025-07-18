import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import InventoryItem from './pages/InventoryItem';
import AddInventory from './pages/AddInventory';
import EditInventory from './pages/EditInventory';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Inventory Management System</title>
        <meta name="description" content="Comprehensive Inventory Management System with CRUD operations, caching, queuing, search, and filtering" />
      </Helmet>

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/add" element={<AddInventory />} />
          <Route path="inventory/:id" element={<InventoryItem />} />
          <Route path="inventory/:id/edit" element={<EditInventory />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Admin routes */}
          <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App; 