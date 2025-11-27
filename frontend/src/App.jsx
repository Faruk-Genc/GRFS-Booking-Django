import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import BookingPage from './pages/Booking/bookingPage';
import BookingForm from './pages/Booking/BookingForm';
import AdminDashboard from './pages/dashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookingpage"
          element={
            <PrivateRoute>
              <BookingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/booking-form"
          element={
            <PrivateRoute>
              <BookingForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
