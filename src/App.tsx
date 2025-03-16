import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FoodListings from './pages/FoodListings';
import FoodDetail from './pages/FoodDetail';
import CreateFood from './pages/Createfood';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserVerification from './pages/admin/UserVerification';
import FoodManagement from './pages/admin/FoodManagement';
import Reports from './pages/admin/Reports';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/food-listings" element={
                  <ProtectedRoute>
                    <FoodListings />
                  </ProtectedRoute>
                } />
                <Route path="/food/create" element={
                  <ProtectedRoute>
                    <CreateFood />
                  </ProtectedRoute>
                } />
                <Route path="/food/:id" element={
                  <ProtectedRoute>
                    <FoodDetail />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/verify-users" element={
                  <ProtectedRoute adminOnly={true}>
                    <UserVerification />
                  </ProtectedRoute>
                } />
                <Route path="/admin/food-management" element={
                  <ProtectedRoute adminOnly={true}>
                    <FoodManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute adminOnly={true}>
                    <Reports />
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;