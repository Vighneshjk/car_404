import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, ShieldCheck, Waves, Zap } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const Services = () => {
    const [services, setServices] = useState({ wash: [], ceramic: [] });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const [washRes, ceramicRes, catRes] = await Promise.all([
                    api.get('/services/car-wash/'),
                    api.get('/services/ceramic-coating/'),
                    api.get('/services/categories/')
                ]);
                setServices({ 
                    wash: washRes.data.results || washRes.data, 
                    ceramic: ceramicRes.data.results || ceramicRes.data 
                });
                setCategories(catRes.data.results || catRes.data);
            } catch (err) {
                console.error('Error fetching services:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const filteredServices = [
        ...(Array.isArray(services?.wash) ? services.wash.map(s => ({ ...s, type: 'wash' })) : []),
        ...(Array.isArray(services?.ceramic) ? services.ceramic.map(s => ({ ...s, type: 'ceramic' })) : [])
    ].filter(s => {
        const matchesFilter = filter === 'all' || s.type === filter;
        const matchesSearch = s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s?.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-deep">
            <Navbar />


            <header className="pt-40 pb-20 px-5 bg-darker border-b border-glass relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-width text-center">
                    <p className="text-primary font-bold tracking-widest text-sm mb-4 uppercase">THE MENU</p>
                    <h1 className="text-4xl md:text-7xl font-bold outfit tracking-tighter mb-8">
                        SHOWROOM <span className="text-secondary italic">PERFECTION</span>,<br />
                        AS STANDARD.
                    </h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                        Explore our complete catalog of precision detailing, advanced nano-coatings, and secure parking solutions. Every tier is designed for uncompromising quality.
                    </p>
                </div>
            </header>


            <section className="sticky top-[80px] z-40 glass py-6 border-b border-glass px-5">
                <div className="max-width flex flex-wrap items-center justify-between gap-6">
                    <div className="flex bg-white/5 p-1 rounded-xl glass border border-glass">
                        {['all', 'wash', 'ceramic'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold tracking-wide uppercase ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group hidden sm:block">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                className="bg-white/5 border border-glass py-2 pl-12 pr-6 rounded-xl focus:outline-none focus:border-primary text-sm font-medium w-64"
                                placeholder="Search treatments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-glass p-2 px-4 flex items-center gap-2 text-sm font-bold uppercase hover:bg-white/10">
                            <Filter size={18} /> More Filters
                        </button>
                    </div>
                </div>
            </section>


            <section className="section-padding max-width px-5">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 glass rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices.map((service) => (
                            <div
                                key={`${service.type}-${service.id}`}
                                className="glass p-1 rounded-3xl group overflow-hidden"
                            >
                                <div className="p-8 h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl bg-white/5 text-${service.type === 'ceramic' ? 'primary' : 'secondary'}`}>
                                            {service.type === 'ceramic' ? <ShieldCheck size={32} /> : <Waves size={32} />}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-text-muted font-bold tracking-widest uppercase mb-1">Starts From</p>
                                            <p className="text-2xl font-bold outfit text-white">₹{service.base_price || (service.pricing_list ? service.pricing_list[0].price : 'TBA')}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                                        <p className="text-text-secondary text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-glass flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-secondary" />
                                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{service.type === 'ceramic' ? `${service.duration_years}Y Durability` : 'Express Wash'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                            DETAILS <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default Services;
