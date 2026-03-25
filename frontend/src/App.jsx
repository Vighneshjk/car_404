import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Airports from './pages/Airports';
import { motion, AnimatePresence } from 'framer-motion';


const CustomerRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen bg-deep flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    if (!user) return <Navigate to="/login" />;

    if (user.role === 'admin' || user.role === 'staff') return <Navigate to="/admin" />;
    return children;
};


const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen bg-deep flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    if (user && (user.role === 'admin' || user.role === 'staff')) return children;
    return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
                <Route path="/services" element={
                    <CustomerRoute>
                        <PageWrapper><Services /></PageWrapper>
                    </CustomerRoute>
                } />
                <Route path="/airports" element={
                    <CustomerRoute>
                        <PageWrapper><Airports /></PageWrapper>
                    </CustomerRoute>
                } />


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
        <NotificationProvider>
            <AuthProvider>
                <Router>
                    <AnimatedRoutes />
                </Router>
            </AuthProvider>
        </NotificationProvider>
    );
}

export default App;
