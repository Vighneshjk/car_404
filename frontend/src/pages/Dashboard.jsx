import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Car, Clock, ShieldCheck, MapPin, Settings, Plus, Play, CheckCircle2, Activity, Zap, History, Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [activeJobs, setActiveJobs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [vehicleForm, setVehicleForm] = useState({
        registration_number: '',
        make: '',
        model: '',
        category: '',
        year: new Date().getFullYear(),
        color: '',
        fuel_type: 'petrol',
        owner_name: user?.full_name || ''
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, jobsRes, bookingsRes, vehiclesRes, catRes] = await Promise.all([
                    api.get('/monitoring/dashboard-stats/'),
                    api.get('/monitoring/customer-jobs/'),
                    api.get('/bookings/my-bookings/'),
                    api.get('/vehicles/'),
                    api.get('/services/vehicle-categories/')
                ]);
                setStats(statsRes.data);

                // Safely handle paginated or non-paginated arrays
                const jobsData = jobsRes.data.results || jobsRes.data;
                const bData = bookingsRes.data.results || bookingsRes.data;
                const vData = vehiclesRes.data.results || vehiclesRes.data;
                const cData = catRes.data.results || catRes.data;

                setActiveJobs(Array.isArray(jobsData) ? jobsData : []);
                setBookings(Array.isArray(bData) ? bData : []);
                setVehicles(Array.isArray(vData) ? vData : []);
                setCategories(Array.isArray(cData) ? cData : []);

                if (Array.isArray(cData) && cData.length > 0) {
                    setVehicleForm(prev => ({ ...prev, category: cData[0].id }));
                }
            } catch (err) {
                console.error('Error fetching dashboard content:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            const res = await api.post('/vehicles/', {
                registration_number: vehicleForm.registration_number,
                make: vehicleForm.make,
                model: vehicleForm.model,
                category: vehicleForm.category,
                year: vehicleForm.year,
                color: vehicleForm.color,
                fuel_type: vehicleForm.fuel_type
            });
            setVehicles(prev => [res.data, ...prev]);
            setShowVehicleModal(false);
            setVehicleForm({
                registration_number: '',
                make: '',
                model: '',
                category: categories[0]?.id || '',
                year: new Date().getFullYear(),
                color: '',
                fuel_type: 'petrol',
                owner_name: user?.full_name || ''
            });
        } catch (err) {
            alert('Failed to register vehicle. Please check if registration number is unique.');
        } finally {
            setRegistering(false);
        }
    };

    const sidebarItems = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'tracking', name: 'Live Tracking', icon: Activity, badge: activeJobs.length },
        { id: 'vehicles', name: 'My Garage', icon: Car },
        { id: 'history', name: 'Past Visits', icon: History },
        { id: 'settings', name: 'Account', icon: Settings },
    ];

    if (loading) return (
        <div className="h-screen bg-deep flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="min-h-screen bg-deep flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col pt-24 px-5">
                <div className="max-width flex flex-col lg:flex-row gap-10 py-12">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 flex flex-col gap-3">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center justify-between p-4 rounded-xl font-bold tracking-tight ${activeTab === item.id ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon size={20} /> {item.name}
                                </div>
                                {item.badge > 0 && (
                                    <span className="bg-white/10 text-primary px-2 py-0.5 rounded-lg text-xs font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1">

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-bold outfit tracking-tighter mb-2">Hello, <span className="text-primary">{user?.full_name || 'Driver'}.</span></h1>
                                        <p className="text-text-secondary font-medium tracking-wide">Your car is in good hands. Ready for the showroom finish?</p>
                                    </div>
                                    <Link to="/bookings" className="btn-primary py-4 px-8 flex items-center gap-2 text-lg">
                                        New Booking <Plus size={20} />
                                    </Link>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Active Jobs', val: activeJobs.length, icon: Play, color: 'primary' },
                                        { label: 'Total Visits', val: stats?.total_jobs || 0, icon: History, color: 'secondary' },
                                        { label: 'Vehicles', val: vehicles.length, icon: Car, color: 'accent-cyan' },
                                        { label: 'Rewards', val: 'Elite', icon: ShieldCheck, color: 'accent-purple' },
                                    ].map((s, idx) => (
                                        <div key={idx} className="glass p-6 rounded-2xl relative group overflow-hidden">
                                            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-${s.color}/10 group-hover:bg-${s.color}/20`} />
                                            <p className="text-xs text-text-muted font-bold tracking-widest uppercase mb-4">{s.label}</p>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-${s.color}/10 flex items-center justify-center text-${s.color}`}>
                                                    <s.icon size={24} />
                                                </div>
                                                <p className="text-3xl font-bold outfit">{s.val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Active Job Highlight */}
                                {activeJobs.length > 0 ? (
                                    <div className="glass-heavy p-8 rounded-3xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-full bg-primary/20 pointer-events-none blur-[60px]" />
                                        <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
                                            <div className="max-w-md">
                                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                                                    <Activity size={16} /> LIVE TRACKING ACTIVE
                                                </div>
                                                <h3 className="text-3xl font-bold outfit tracking-tighter mb-4 uppercase">{activeJobs[0].vehicle_details.plate_number} — {activeJobs[0].vehicle_details.model}</h3>
                                                <p className="text-text-secondary font-medium mb-8 leading-relaxed">
                                                    Stage: <span className="text-white font-bold">{activeJobs[0].status_display}</span>.
                                                    Team Alpha is currently applying the 9H nano-coating. Return for pickup at {activeJobs[0].estimated_completion || 'TBA'}.
                                                </p>
                                                <button onClick={() => setActiveTab('tracking')} className="btn-primary py-3 px-8 text-sm">Open Live Feed</button>
                                            </div>
                                            <div className="flex-1 max-w-sm flex flex-col justify-center gap-6 border-l border-glass pl-10 hidden md:flex">
                                                <div className="flex items-center gap-4">
                                                    <Clock className="text-secondary" />
                                                    <div>
                                                        <p className="text-xs text-text-muted font-bold tracking-widest uppercase">Arrival</p>
                                                        <p className="font-bold text-lg">{new Date(activeJobs[0].created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <MapPin className="text-accent-cyan" />
                                                    <div>
                                                        <p className="text-xs text-text-muted font-bold tracking-widest uppercase">Parking Bay</p>
                                                        <p className="font-bold text-lg">Bay No. {activeJobs[0].id + 10} (Outdoor)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass p-16 rounded-3xl text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-text-muted mb-8">
                                            <Activity size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 tracking-tighter">No Active Jobs Currently.</h3>
                                        <p className="text-text-secondary max-w-sm mx-auto mb-10 font-medium">When you drop your vehicle, it will appear here with live stage logs and live photos.</p>
                                        <Link to="/bookings" className="btn-glass px-10 py-3 uppercase tracking-widest font-bold text-xs">Book a Treatment</Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TRACKING */}
                        {activeTab === 'tracking' && (
                            <div className="space-y-10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-bold outfit">Active Trace.</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 bg-primary rounded-full" />
                                        <span className="text-xs font-bold tracking-widest uppercase text-primary">Live Connection</span>
                                    </div>
                                </div>
                                {activeJobs.map(job => (
                                    <div key={job.id} className="glass-heavy p-10 rounded-3xl relative overflow-hidden">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                            <div className="relative pl-10">
                                                <div className="absolute left-4 top-2 bottom-5 w-0.5 bg-white/10" />
                                                {[
                                                    { id: 'waiting', label: 'Vehicle Dropped', sub: 'In Queue for Treatment' },
                                                    { id: 'preparation', label: 'Preparation', sub: 'Surface Decontamination' },
                                                    { id: 'washing', label: 'Precision Washing', sub: 'Snow Foam & Hand Wash' },
                                                    { id: 'coating', label: 'Coating Stage', sub: 'Ceramic Layer Application' },
                                                    { id: 'drying', label: 'Flash Drying', sub: 'IR Curing Process' },
                                                    { id: 'detailing', label: 'Interior Works', sub: 'Vaccum & Dressing' },
                                                    { id: 'quality_check', label: 'Final Inspection', sub: 'Quality Assurance' },
                                                    { id: 'completed', label: 'Ready for Delivery', sub: 'Showroom Finish Achieved' }
                                                ].map((s, i) => (
                                                    <div key={i} className={`flex items-start gap-5 mb-10 relative z-10 transition-all duration-500 ${i < job.status ? 'text-white' : i === job.status ? 'text-primary' : 'text-white/20'}`}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-bg-deep transition-all duration-500 ${i <= job.status ? 'border-primary shadow-[0_0_15px_rgba(255,61,0,0.3)]' : 'border-white/10'}`}>
                                                            {i < job.status ? <CheckCircle2 size={18} className="text-primary" /> : <div className={`w-3 h-3 rounded-full ${i === job.status ? 'bg-primary animate-pulse' : 'bg-transparent'}`} />}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold tracking-tight outfit transition-all ${i === job.status ? 'text-2xl mb-1 text-white' : 'text-sm'}`}>{s.label}</p>
                                                            {i === job.status && <p className="text-[10px] text-primary font-bold tracking-widest uppercase">{s.sub} — In Progress</p>}
                                                            {i < job.status && <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1">COMPLETED</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-col gap-8">
                                                <div className="glass p-6 rounded-2xl relative group h-[250px] flex items-center justify-center overflow-hidden border-primary/30">
                                                    <Zap size={80} className="text-white/5 absolute" />
                                                    <div className="relative z-10 text-center text-text-muted font-bold italic">
                                                        <Bell className="mx-auto mb-4 text-primary" />
                                                        LIVE PHOTO LOGS UNAVAILABLE.<br />
                                                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Camera Stream Processing...</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="glass p-5 rounded-xl">
                                                        <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Technician</p>
                                                        <p className="font-bold underline">Mr. Rajesh K.</p>
                                                    </div>
                                                    <div className="glass p-5 rounded-xl">
                                                        <p className="text-[10px] text-text-muted font-bold uppercase mb-2">ETA</p>
                                                        <p className="font-bold">45 Mins</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* VEHICLES */}
                        {activeTab === 'vehicles' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-3xl font-bold outfit">My Garage.</h2>
                                    <button
                                        onClick={() => setShowVehicleModal(true)}
                                        className="btn-primary py-2 px-6 flex items-center gap-2 font-bold text-sm uppercase"
                                    >
                                        <Plus size={18} /> Add Machine
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {vehicles.map(v => (
                                        <div key={v.id} className="glass p-8 rounded-2xl relative group hover:border-secondary/50">
                                            <div className="flex justify-between items-end mb-8">
                                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                                    <Car size={28} />
                                                </div>
                                                <span className="text-[10px] font-bold tracking-[0.2em] bg-white/5 py-1 px-3 rounded-lg text-text-muted">ACTIVE GARAGE</span>
                                            </div>
                                            <h3 className="text-3xl font-bold outfit tracking-tighter mb-2 uppercase">{v.plate_number}</h3>
                                            <p className="text-text-secondary font-bold text-sm">{v.make} {v.model}</p>
                                            <div className="mt-10 pt-6 border-t border-glass flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-secondary" />
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <button className="text-white hover:text-primary"><Settings size={20} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* REGISTER VEHICLE MODAL */}
            {showVehicleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVehicleModal(false)} />
                    <div className="relative glass-heavy w-full max-w-2xl rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-3xl font-bold outfit tracking-tighter">REGISTER MACHINE.</h2>
                                <p className="text-text-secondary font-medium">Add a new vehicle to your garage for treated care.</p>
                            </div>
                            <button onClick={() => setShowVehicleModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-primary/20 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Owner Name</label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full bg-white/5 border border-glass p-4 rounded-xl text-white/50 font-bold"
                                    value={vehicleForm.owner_name}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Number Plate</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. KA01AB1234"
                                    className="w-full bg-white/5 border border-glass p-4 rounded-xl text-white font-bold uppercase focus:border-primary focus:outline-none"
                                    value={vehicleForm.registration_number}
                                    onChange={(e) => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Manufacturer (Make)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Tesla, BMW"
                                    className="w-full bg-white/5 border border-glass p-4 rounded-xl text-white font-bold focus:border-primary focus:outline-none"
                                    value={vehicleForm.make}
                                    onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Model Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Model S, X5"
                                    className="w-full bg-white/5 border border-glass p-4 rounded-xl text-white font-bold focus:border-primary focus:outline-none"
                                    value={vehicleForm.model}
                                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Category</label>
                                <select
                                    className="w-full bg-bg-deep border border-glass p-4 rounded-xl text-white font-bold focus:border-primary focus:outline-none appearance-none"
                                    value={vehicleForm.category}
                                    onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Fuel Type</label>
                                <select
                                    className="w-full bg-bg-deep border border-glass p-4 rounded-xl text-white font-bold focus:border-primary focus:outline-none appearance-none"
                                    value={vehicleForm.fuel_type}
                                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })}
                                >
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="cng">CNG</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Year</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-white/5 border border-glass p-4 rounded-xl text-white font-bold focus:border-primary focus:outline-none"
                                    value={vehicleForm.year}
                                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Color</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alpine White"
                                    className="w-full bg-white/5 border border-glass p-4 rounded-xl text-white font-bold focus:border-primary focus:outline-none"
                                    value={vehicleForm.color}
                                    onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 pt-6">
                                <button
                                    type="submit"
                                    disabled={registering}
                                    className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {registering ? 'Processing...' : 'CONFIRM REGISTRATION'} <Car size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};
export default Dashboard;
