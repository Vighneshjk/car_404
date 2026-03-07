import React from 'react';
import { ChevronRight, Play, Star, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center overflow-hidden bg-bg-deep">

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.7) 60%, #050505 100%)'
                    }}
                />
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, ease: 'easeOut' }}
                    src="/hero_car_luxury.png"
                    alt="Premium Car Detailing"
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.8 }}
                />
            </div>

            {/* Content */}
            <div className="max-width relative px-5 w-full" style={{ zIndex: 100 }}>
                <div className="max-w-3xl">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-deep bg-gray-800" />
                            ))}
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm font-bold tracking-tight">4.9/5 Rating</span>
                        </div>
                        <span className="text-text-muted text-sm px-2 border-l border-glass">15k+ Enlisted Repairs</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-bold leading-tight mb-6 outfit tracking-tighter"
                    >
                        PRECISION <span className="text-primary italic">CAR CARE</span> <br />
                        NEAR THE <span className="text-secondary">AIRPORT.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl leading-relaxed"
                    >
                        Premium car washing, ceramic coating, and secure airport parking.
                        Drop your keys, fly away, and return to a showroom-finish vehicle.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        <Link to="/bookings" className="w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary flex items-center gap-2 text-lg px-8 py-4 w-full"
                            >
                                Book Your Slot <ChevronRight size={20} />
                            </motion.button>
                        </Link>
                        <button className="flex items-center gap-3 text-white font-semibold hover:text-primary transition-colors px-4 py-2 group">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                className="w-12 h-12 rounded-full glass border border-glass flex items-center justify-center group-hover:bg-primary/20 transition-all"
                            >
                                <Play size={18} fill="white" className="ml-1" />
                            </motion.div>
                            Watch Process
                        </button>
                    </motion.div>

                    {/* Feature Badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16 pt-10 border-t border-glass max-w-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted uppercase font-bold tracking-widest">Protection</p>
                                <p className="font-semibold">3-5Y Warranty</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted uppercase font-bold tracking-widest">Speed</p>
                                <p className="font-semibold">60min Service</p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

        </section>
    );
};

export default Hero;
