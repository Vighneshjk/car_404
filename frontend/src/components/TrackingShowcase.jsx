import React from 'react';
import { CheckCircle2, Circle, Clock, Car, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TrackingShowcase = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProtectedAction = (path) => {
        if (user) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    const steps = [
        { name: "Arrival & Inspection", done: true, time: "10:00 AM" },
        { name: "Deep Decontamination", done: true, time: "10:30 AM" },
        { name: "Foam Bath & Rinse", done: true, time: "11:00 AM" },
        { name: "High-Gloss Ceramic Application", done: false, active: true, time: "In Progress" },
        { name: "Final Quality Check (QC)", done: false, time: "ETA 12:30 PM" },
        { name: "Vehicle Ready for Pickup", done: false, time: "ETA 1:00 PM" }
    ];

    return (
        <section className="section-padding bg-darker relative overflow-hidden">
            <div className="max-width grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">


                <div className="relative group">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="glass-heavy p-8 rounded-3xl aspect-square flex flex-col justify-between overflow-hidden relative shadow-2xl"
                    >

                        <Car size={300} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />

                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-secondary font-bold text-xs uppercase tracking-widest mb-1">Live Tracking</div>
                                <h3 className="text-3xl font-bold outfit tracking-tighter">KA-01-AB-1234</h3>
                                <p className="text-text-muted text-sm font-medium">Tesla Model S — Plaid Red</p>
                            </div>
                            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 border-primary/30">
                                <motion.div
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="w-2 h-2 rounded-full bg-primary"
                                />
                                <span className="text-xs font-bold text-primary tracking-wide">STAGE 4: COATING</span>
                            </div>
                        </div>

                        <div className="mt-10 relative space-y-8 pl-8">

                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-white/10" />

                            {steps.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`flex items-start justify-between relative z-10 ${step.active ? 'text-white' : step.done ? 'text-white/60' : 'text-white/30'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-bg-deep border-2 ${step.done ? 'border-primary' : step.active ? 'border-secondary' : 'border-white/10'}`}>
                                            {step.done ? <CheckCircle2 size={12} className="text-primary" /> : step.active ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-secondary" /> : <Circle size={10} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold transition-all ${step.active && 'text-xl md:text-2xl mb-1'}`}>{step.name}</p>
                                            {step.active && <p className="text-xs text-text-muted font-medium">Assigned: Team Alpha (Lead: Rajesh K.)</p>}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold font-mono tracking-tighter">{step.time}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-between items-center pt-8 border-t border-glass">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=Vighnesh&background=0D8ABC&color=fff" alt="User" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted uppercase font-bold tracking-widest">Customer</p>
                                    <p className="font-bold text-sm">Vighnesh </p>
                                </div>
                            </div>
                            <button className="btn-glass py-2 px-6 flex items-center gap-2 text-xs transition-all hover:bg-white/10">
                                <MapPin size={14} /> Bay 3
                            </button>
                        </div>
                    </motion.div>


                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="absolute -top-10 -right-10 glass-heavy p-6 rounded-2xl border-secondary/30 shadow-2xl hidden md:block"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted font-bold">Estimated Time</p>
                                <p className="font-bold text-lg">01:45:00</p>
                            </div>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "65%" }}
                                transition={{ duration: 1.5, delay: 1 }}
                                viewport={{ once: true }}
                                className="h-full bg-secondary"
                            />
                        </div>
                    </motion.div>
                </div>


                <div className="max-width md:max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mb-10"
                    >
                        <p className="text-secondary font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
                            <span className="w-12 h-1 bg-secondary rounded-full" /> LIVE MONITORING
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold outfit tracking-tighter mb-8 leading-tight">
                            NEVER GUESS WHERE <br />
                            <span className="text-primary italic">YOUR CAR IS.</span>
                        </h2>
                        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                            Our proprietary monitoring system provides every customer with a unique tracking link.
                            Watch our technicians move from inspection to ceramic coating in real-time.
                            Transparency isn't just a word; it's our standard.
                        </p>

                        <div className="space-y-6 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="font-semibold text-lg">Push notifications for every stage update.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="font-semibold text-lg">Photo logs of the work in progress.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="font-semibold text-lg">Direct communication with lead technician.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleProtectedAction('/dashboard')}
                            className="btn-primary px-10 py-5 text-lg"
                        >
                            Track Your Active Booking
                        </button>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default TrackingShowcase;
