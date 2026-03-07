import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Airports from './pages/Airports';
import { motion, AnimatePresence } from 'framer-motion';

// Use this for routes that require the user to be logged in
// Use this for routes that require the user to be a CUSTOMER
const CustomerRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen bg-deep flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    // If not logged in, go to login
    if (!user) return <Navigate to="/login" />;
    // If Admin/Staff tries to access customer area, send them back to Admin Panel
    if (user.role === 'admin' || user.role === 'staff') return <Navigate to="/admin" />;
    return children;
};

// Use this for routes that require ADMIN/STAFF access
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen bg-deep flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    // If Admin/Staff, allow. Otherwise, send to dashboard (for customers) or login
    if (user && (user.role === 'admin' || user.role === 'staff')) return children;
    return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
                <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
                <Route path="/airports" element={<PageWrapper><Airports /></PageWrapper>} />

                {/* Protected Routes */}
                <Route path="/bookings" element={
                    <CustomerRoute>
                        <PageWrapper><Bookings /></PageWrapper>
                    </CustomerRoute>
                } />
                <Route path="/dashboard" element={
                    <CustomerRoute>
                        <PageWrapper><Dashboard /></PageWrapper>
                    </CustomerRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute>
                        <PageWrapper><AdminDashboard /></PageWrapper>
                    </AdminRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AnimatePresence>
    );
};

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3 }}
    >
        {children}
    </motion.div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <AnimatedRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
