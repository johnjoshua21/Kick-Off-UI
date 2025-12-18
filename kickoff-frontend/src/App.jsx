// src/App.jsx - Updated with Admin Dashboard
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// User Components
// Checking git commit
import UserLayout from './components/UserLayout';
import BrowseTurfs from './pages/user/BrowseTurfs';
import MyBookings from './pages/user/MyBookings';
import UserProfile from './pages/user/UserProfile';

// Owner Components
import OwnerLayout from './components/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyTurfs from './pages/owner/MyTurfs';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerProfile from './pages/owner/OwnerProfile';
import BlockSlots from './pages/owner/BlockedSlots';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-red-600">Unauthorized</h1>
      <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      <button
        onClick={() => window.location.href = '/login'}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go to Login
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - User */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<BrowseTurfs />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="profile" element={<UserProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Protected Routes - Turf Owner */}
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute allowedRoles={['TURF_OWNER']}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="turfs" element={<MyTurfs />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="profile" element={<OwnerProfile />} />
            <Route path="block-slots" element={<BlockSlots />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;