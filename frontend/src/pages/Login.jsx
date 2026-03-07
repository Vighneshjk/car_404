import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Car, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleEmailBlur = () => {
        if (email && !email.includes('@')) {
            setEmail(email + '@gmail.com');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Ensure email has @gmail.com if domain is missing
        let finalEmail = email;
        if (finalEmail && !finalEmail.includes('@')) {
            finalEmail += '@gmail.com';
            setEmail(finalEmail);
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        try {
            await login(finalEmail, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-deep flex flex-col">
            <Navbar />

            <section className="flex-1 flex items-center justify-center px-5 pb-5 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
                >
                    {/* Background Detail */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col items-center mb-8 text-center">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-6"
                            >
                                <Car size={32} color="white" />
                            </motion.div>
                            <h1 className="text-2xl md:text-3xl font-bold outfit tracking-tighter mb-1">Welcome Back.</h1>
                            <p className="text-text-secondary text-sm font-medium">Log in to manage your bookings and track your car.</p>
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold tracking-widest text-text-muted uppercase mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/5 border border-glass p-3 px-4 rounded-xl focus:outline-none focus:border-primary text-white text-sm font-medium transition-smooth"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        onBlur={handleEmailBlur}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold tracking-widest text-text-muted uppercase mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full bg-white/5 border border-glass p-3 px-4 rounded-xl focus:outline-none focus:border-primary text-white text-sm font-medium transition-smooth pr-12"
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
                                <div className="flex justify-end mt-2">
                                    <a href="#" className="text-xs text-text-secondary hover:text-primary font-bold transition-colors">Forgot password?</a>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                            >
                                {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={20} />
                            </motion.button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-glass text-center">
                            <p className="text-text-secondary text-sm font-medium">
                                New here? <Link to="/register" className="text-primary font-bold hover:underline transition-all">Create an account</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

        </main>
    );
};

export default Login;
