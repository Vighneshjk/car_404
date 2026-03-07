import { PlaneTakeoff, Navigation, Timer, ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AirportInfo = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProtectedAction = (path = '/airports') => {
        if (user) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    const airports = [
        { name: "Kempegowda Int'l (BLR)", dist: "2.5 km", time: "8 min", code: "BLR" },
        { name: "Rajiv Gandhi Int'l (HYD)", dist: "15.0 km", time: "25 min", code: "HYD" },
        { name: "Chennai Int'l (MAA)", dist: "5.0 km", time: "12 min", code: "MAA" }
    ];

    return (
        <section className="section-padding max-width">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-2xl"
            >


                <div className="relative h-[400px] lg:h-auto overflow-hidden">
                    <motion.img
                        initial={{ scale: 1.1 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        src="/airport_map_minimalist.png"
                        alt="Airport Location Map"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-deep/80 via-transparent to-transparent hidden lg:block" />
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-10 left-10 glass p-6 rounded-2xl border-primary/30 max-w-xs scale-90 md:scale-100 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3 mb-2 text-primary">
                            <Navigation size={20} />
                            <span className="font-bold tracking-tight text-white">Prime Location</span>
                        </div>
                        <p className="text-xs text-text-secondary font-medium">Located on Plot 404, Main Airport Link Road. Avoid terminal traffic, park with us.</p>
                    </motion.div>
                </div>


                <div className="p-10 md:p-16">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-primary font-bold tracking-widest text-sm mb-4 uppercase">CLOSE TO THE ACTION</p>
                        <h2 className="text-4xl md:text-5xl font-bold outfit tracking-tighter mb-8 leading-tight">
                            ALL ROADS LEAD <br />
                            <span className="text-secondary">TO THE TERMINAL.</span>
                        </h2>
                        <p className="text-text-secondary text-lg mb-12 leading-relaxed">
                            Our facility is strategically located at the intersection of efficiency and luxury.
                            We serve all major nearby airports with shuttle options and key-drop security.
                        </p>

                        <div className="space-y-6">
                            {airports.map((airport, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center justify-between p-5 glass rounded-2xl group hover:border-primary/50 cursor-pointer transition-all hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all">
                                            <PlaneTakeoff size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{airport.name}</p>
                                            <p className="text-xs text-text-muted font-bold tracking-widest uppercase">AIRPORT CODE: {airport.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="flex items-center gap-1 text-secondary font-bold">
                                                <Navigation size={14} /> {airport.dist}
                                            </div>
                                            <div className="flex items-center gap-1 text-text-muted text-xs font-bold">
                                                <Timer size={14} /> {airport.time}
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-white/20 group-hover:text-primary transition-colors" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            onClick={() => handleProtectedAction('/airports')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 mt-10 text-primary font-bold hover:underline transition-all"
                        >
                            Get Directions on Google Maps <ExternalLink size={16} />
                        </motion.button>
                    </motion.div>
                </div>

            </motion.div>
        </section>
    );
};

export default AirportInfo;
