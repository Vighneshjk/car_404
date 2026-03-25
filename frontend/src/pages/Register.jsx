import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Car, AlertCircle, Phone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        if (password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return false;
        }
        if (password !== passwordConfirm) {
            setError('Passwords do not match.');
            return false;
        }
        if (phone.length < 10 || phone.length > 15 || !/^\d+$/.test(phone)) {
            setError('Phone number must be between 10 and 15 digits.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');


        let finalEmail = email;

        if (!validateForm()) return;

        setLoading(true);
        try {
            await api.post('/auth/register/', {
                email: finalEmail,
                password,
                password_confirm: passwordConfirm,
                full_name: name,
                phone: phone
            });
            navigate('/login');
        } catch (err) {
            const serverError = err.response?.data;
            if (serverError) {
                if (serverError.email) {
                    setError('This email address is already in use.');
                } else if (serverError.phone) {
                    setError('This phone number is already registered.');
                } else {
                    const message = Object.values(serverError).flat().join(' ');
                    setError(message);
                }
            } else {
                setError(err.message || 'Registration failed. Please try again.');
                console.error("DEBUG REGISTER ERR:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-deep flex flex-col">
            <Navbar />

            <section className="flex-1 flex items-center justify-center px-5 py-5 pt-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="glass p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col items-center mb-8 text-center">
                            <motion.div
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                transition={{ type: 'spring', bounce: 0.5 }}
                                className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg mb-4"
                            >
                                <Car size={32} color="white" />
                            </motion.div>
                            <h1 className="text-2xl md:text-3xl font-bold outfit tracking-tighter mb-1">Join the Club.</h1>
                            <p className="text-text-secondary text-sm font-medium">Create your account for premium car care.</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-primary/20 border border-primary/50 p-3 rounded-xl flex items-start gap-3 mb-6 text-primary font-bold text-sm text-left"
                            >
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold tracking-widest text-text-muted uppercase mb-1 ml-1">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-glass p-3 px-4 rounded-xl focus:outline-none focus:border-secondary text-white text-sm font-medium transition-smooth"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError('');
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest text-text-muted uppercase mb-1 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/5 border border-glass p-3 px-4 rounded-xl focus:outline-none focus:border-secondary text-white text-sm font-medium transition-smooth"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest text-text-muted uppercase mb-1 ml-1">Phone</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        maxLength={15}
                                        className="w-full bg-white/5 border border-glass p-3 px-4 rounded-xl focus:outline-none focus:border-secondary text-white text-sm font-medium transition-smooth"
                                        placeholder="Phone Number"
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(e.target.value.replace(/\D/g, ''));
                                            setError('');
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest text-text-muted uppercase mb-1 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full bg-white/5 border border-glass p-3 px-4 rounded-xl focus:outline-none focus:border-secondary text-white text-sm font-medium transition-smooth pr-12"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all backdrop-blur-sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </motion.button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest text-text-muted uppercase mb-1 ml-1">Confirm</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="w-full bg-white/5 border border-glass p-3 px-4 rounded-xl focus:outline-none focus:border-secondary text-white text-sm font-medium transition-smooth pr-12"
                                        placeholder="••••••••"
                                        value={passwordConfirm}
                                        onChange={(e) => {
                                            setPasswordConfirm(e.target.value);
                                            setError('');
                                        }}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all backdrop-blur-sm"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </motion.button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                                style={{ background: 'linear-gradient(135deg, var(--secondary), #00E5FF)' }}
                            >
                                {loading ? 'Registering...' : 'Create Account'} <ArrowRight size={20} />
                            </motion.button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-glass text-center">
                            <p className="text-text-secondary text-sm font-medium">
                                Already have an account? <Link to="/login" className="text-secondary font-bold hover:underline transition-all">Log in</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

        </main>
    );
};

export default Register;
