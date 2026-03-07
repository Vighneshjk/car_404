import React, { useState, useEffect } from 'react';
import { Menu, X, Car, User, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Airports', path: '/airports' },
        { name: 'Bookings', path: '/bookings' },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-heavy py-3 shadow-lg' : 'bg-transparent py-5'}`}>
            <div className="max-width flex justify-between items-center px-5">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg"
                    >
                        <Car size={24} color="white" />
                    </motion.div>
                    <span className="text-2xl font-bold tracking-tighter outfit">
                        404<span className="text-secondary">CARE</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.name} to={link.path} className={`text-sm font-medium tracking-wide relative hover:text-primary transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-text-secondary'}`}>
                            {link.name}
                            {location.pathname === link.path && (
                                <motion.div
                                    layoutId="navline"
                                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full"
                                />
                            )}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 ml-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="btn-glass flex items-center gap-2 py-2 px-4 text-sm font-semibold transition-all hover:bg-white/10">
                                    <LayoutDashboard size={16} /> Dashboard
                                </Link>
                                <button onClick={logout} className="text-text-muted hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors">Logout</button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn-glass flex items-center gap-2 py-2 px-4 text-sm font-semibold transition-all hover:bg-white/10">
                                    <User size={16} /> Login
                                </Link>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/dashboard" className="btn-primary py-2 px-4 text-sm font-semibold">
                                        Get Started
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white hover:text-primary p-2 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden glass-heavy absolute top-full left-0 w-full border-t border-glass py-8 px-5 flex flex-col gap-6 shadow-2xl"
                    >
                        {navLinks.map((link) => (
                            <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="text-xl font-semibold hover:text-primary transition-colors">
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-4 mt-4">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="btn-glass text-center py-3">Login</Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center py-3">Register</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
