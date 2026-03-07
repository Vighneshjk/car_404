import { ShieldCheck, Waves, CornerUpRight, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ServicesShowcase = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleProtectedAction = (path = '/services') => {
        if (user) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    const services = [
        {
            title: "Ultimate Ceramic Shield",
            desc: "9H Hardness nano-coating that lasts 3-5 years. Superior gloss and hydrophobic self-cleaning properties.",
            tag: "PROTECTION",
            icon: <ShieldCheck size={40} className="text-primary" />,
            features: ["UV Protection", "High Gloss", "Self-Cleaning"],
            color: "primary"
        },
        {
            title: "Speed Detail Wash",
            desc: "Complete exterior and interior restoration in under 60 minutes. Deep decontamination and wax polish.",
            tag: "EFFICIENCY",
            icon: <Waves size={40} className="text-secondary" />,
            features: ["Foam Wash", "Engine Detail", "Wax Sealant"],
            color: "secondary"
        },
        {
            title: "Airport Safe Parking",
            desc: "Secure indoor and outdoor parking zones close to all major terminals. 24/7 CCTV and entry/exit logging.",
            tag: "CONVENIENCE",
            icon: <MapPin size={40} className="text-accent-cyan" />,
            features: ["24/7 Security", "Shuttle Service", "Covered Bays"],
            color: "accent-cyan"
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="section-padding max-width">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="max-width md:max-w-2xl"
                >
                    <p className="text-primary font-bold tracking-widest text-sm mb-4 uppercase">
                        PREMIUM SOLUTIONS
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold outfit tracking-tighter">
                        UNCOMPROMISING <br />
                        <span className="text-secondary">AUTO CARE.</span>
                    </h2>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="max-width md:max-w-xs"
                >
                    <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                        Precision engineering meets world-class care at our airport-adjacent facility.
                        We take your vehicle's perfection as a 404 error—it shouldn't exist.
                    </p>
                    <button
                        onClick={() => handleProtectedAction('/services')}
                        className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
                    >
                        Explore Full Price List <CornerUpRight size={18} />
                    </button>
                </motion.div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        className="glass p-10 rounded-2xl relative group overflow-hidden transition-all duration-300"
                    >

                        <motion.div
                            className={`absolute -top-10 -right-10 w-40 h-40 opacity-10 rounded-full bg-${service.color}`}
                            whileHover={{ scale: 1.5, opacity: 0.2 }}
                        />

                        <div className="relative z-10">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="p-4 rounded-xl bg-white/5 inline-flex mb-8 transition-all"
                            >
                                {service.icon}
                            </motion.div>

                            <p className="text-text-muted text-xs font-bold tracking-widest mb-4 uppercase">
                                {service.tag}
                            </p>

                            <h3 className="text-2xl font-bold mb-6 group-hover:text-primary transition-colors">
                                {service.title}
                            </h3>

                            <p className="text-text-secondary text-sm mb-10 leading-relaxed font-medium">
                                {service.desc}
                            </p>

                            <div className="flex flex-wrap gap-3 mb-12">
                                {service.features.map(f => (
                                    <span key={f} className="text-xs font-bold px-3 py-1 glass rounded-lg text-white/80">
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <motion.button
                                onClick={() => handleProtectedAction('/services')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full btn-glass flex justify-between items-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-all"
                            >
                                View Details <ChevronRight size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default ServicesShowcase;
