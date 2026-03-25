import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter, ShieldCheck, Car, User, MapPin, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState({ wash: [], ceramic: [] });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceFormData, setServiceFormData] = useState({
        name: '',
        description: '',
        is_active: true,
        image: null
    });

    useEffect(() => {
        if (activeTab === 'bookings') {
            fetchBookings();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'timeslots') {
            fetchTimeSlots();
        } else {
            fetchServices();
        }
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings/');
            setBookings(res.data.results || res.data);
        } catch (err) {
            console.error('Error fetching admin bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/users-list/');
            setUsers(res.data.results || res.data);
        } catch (err) {
            console.error('Error fetching admin users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeSlots = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings/time-slots/manage/');
            setTimeSlots(res.data.results || res.data);
        } catch (err) {
            console.error('Error fetching time slots:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const [washRes, ceramicRes] = await Promise.all([
                api.get('/services/car-wash/'),
                api.get('/services/ceramic-coating/')
            ]);
            setServices({
                wash: washRes.data.results || washRes.data,
                ceramic: ceramicRes.data.results || ceramicRes.data
            });
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', serviceFormData.name);
        formData.append('description', serviceFormData.description);
        formData.append('is_active', serviceFormData.is_active);
        if (serviceFormData.image instanceof File) {
            formData.append('image', serviceFormData.image);
        }

        try {
            const endpoint = editingService.type === 'wash' 
                ? `/services/admin/car-wash/${editingService.id}/` 
                : `/services/admin/ceramic-coating/${editingService.id}/`;
            
            await api.patch(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowServiceModal(false);
            fetchServices();
        } catch (err) {
            alert('Failed to update service.');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await api.patch(`/bookings/${id}/update-status/`, { status: newStatus });

            const updatedBookings = bookings.map(b => b.id === id ? { ...b, status: newStatus, status_display: newStatus.toUpperCase() } : b);
            setBookings(updatedBookings);

            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking(updatedBookings.find(b => b.id === id));
            }
        } catch (err) {
            alert('Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFilter = filter === 'all' || b.status === filter;
        const bs = JSON.stringify(b).toLowerCase();
        const matchesSearch = bs.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filteredUsers = users.filter(u => {
        const us = JSON.stringify(u).toLowerCase();
        return us.includes(searchTerm.toLowerCase());
    });

    const filteredTimeSlots = timeSlots.filter(ts => {
        const tss = JSON.stringify(ts).toLowerCase();
        return tss.includes(searchTerm.toLowerCase());
    });

    const statusColors = {
        'pending': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        'confirmed': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        'cancelled': 'text-red-500 bg-red-500/10 border-red-500/20',
        'completed': 'text-green-500 bg-green-500/10 border-green-500/20',
    };

    return (
        <main className="min-h-screen bg-deep flex flex-col pt-24">
            <Navbar />

            <div className="max-width px-5 py-12 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4">
                            <ShieldCheck size={18} /> Administrative Access
                        </div>
                        <h1 className="text-5xl font-bold outfit tracking-tighter">Command <span className="text-secondary text-primary">Center.</span></h1>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
                        <div className="flex bg-white/5 rounded-xl p-1 border border-glass">
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
                            >
                                Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'services' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
                            >
                                Services
                            </button>
                            <button
                                onClick={() => setActiveTab('timeslots')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'timeslots' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}
                            >
                                Time Slots
                            </button>
                        </div>
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder={activeTab === 'bookings' ? "Search Bookings..." : activeTab === 'users' ? "Search User Directory..." : activeTab === 'timeslots' ? "Search Time Slots..." : "Search..."}
                                className="w-full bg-white/5 border border-glass pl-6 pr-4 py-3 rounded-xl focus:border-primary outline-none transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {activeTab === 'bookings' && (
                            <select
                                className="bg-white/5 border border-glass px-6 py-3 rounded-xl outline-none font-bold text-sm uppercase tracking-widest cursor-pointer hover:bg-white/10"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">Global View</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'bookings' ? (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                            {filteredBookings.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="glass p-20 text-center rounded-[2.5rem]"
                                >
                                    <p className="text-text-secondary text-lg font-medium">No matching bookings found in the fleet logs.</p>
                                </motion.div>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={booking.id}
                                        className="glass-heavy p-8 rounded-[2rem] border border-glass hover:border-primary/30 transition-all group"
                                    >
                                        <div className="flex flex-col xl:flex-row gap-10 items-start xl:items-center">

                                            <div className="flex-1 min-w-[300px]">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className={`px-4 py-1.5 rounded-lg border text-[10px] font-bold tracking-[0.2em] uppercase ${statusColors[booking?.status]}`}>
                                                        {booking?.status_display}
                                                    </span>
                                                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">REF: {booking.booking_id}</span>
                                                </div>
                                                <h3 className="text-3xl font-bold outfit tracking-tighter mb-2 uppercase">{booking?.vehicle_details?.plate_number}</h3>
                                                <div className="flex items-center gap-6 text-sm text-text-secondary font-medium">
                                                    <span className="flex items-center gap-2 max-w-[150px] truncate"><User size={14} className="text-primary" /> {booking?.customer_details?.full_name}</span>
                                                    <span className="flex items-center gap-2"><Car size={14} className="text-secondary" /> {booking?.vehicle_details?.make} {booking?.vehicle_details?.model}</span>
                                                </div>
                                            </div>


                                            <div className="flex flex-wrap gap-8 xl:border-l xl:border-glass xl:pl-10">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Time Slot</p>
                                                    <p className="font-bold flex items-center gap-2"><Clock size={16} className="text-accent-cyan" /> {booking?.time_slot_details?.date}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Pricing</p>
                                                    <p className="font-bold text-xl text-white">₹{booking?.total_price}</p>
                                                </div>
                                            </div>


                                            <div className="flex items-center gap-4 ml-auto w-full xl:w-auto mt-6 xl:mt-0 xl:border-l xl:border-glass xl:pl-10">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="btn-glass py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                                                >
                                                    View Intel
                                                </button>

                                                {booking.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            disabled={updatingId === booking.id}
                                                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                            className="btn-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                        <button
                                                            disabled={updatingId === booking.id}
                                                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                            className="bg-red-500/10 text-red-400 border border-red-500/20 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 disabled:opacity-50 transition-all font-bold"
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button
                                                        disabled={updatingId === booking.id}
                                                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 py-3 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                                    >
                                                        Mark Done
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                ) : activeTab === 'users' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredUsers.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="col-span-full glass p-20 text-center rounded-[2.5rem]"
                                >
                                    <p className="text-text-secondary text-lg font-medium">No registered users found in the database.</p>
                                </motion.div>
                            ) : (
                                filteredUsers.map((u) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={u.id}
                                        className="glass-heavy p-8 rounded-[2rem] border border-glass hover:border-primary/30 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary font-bold outfit text-xl">
                                                    {u.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold outfit tracking-tight leading-none mb-1">{u.full_name}</h3>
                                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Customer Pilot</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Email</p>
                                                    <p className="text-sm font-medium">{u.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Phone</p>
                                                    <p className="text-sm font-medium">{u.phone || 'Not Provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-glass flex justify-between items-center text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                            <span>Joined: {new Date(u.date_joined).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 text-green-500"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                ) : activeTab === 'timeslots' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredTimeSlots.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="col-span-full glass p-20 text-center rounded-[2.5rem]"
                                >
                                    <p className="text-text-secondary text-lg font-medium">No time slots found in the system.</p>
                                </motion.div>
                            ) : (
                                filteredTimeSlots.map((ts) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={ts.id}
                                        className="glass-heavy p-8 rounded-[2rem] border border-glass hover:border-primary/30 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary font-bold outfit text-xl">
                                                    <Clock size={24} />
                                                </div>
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${ts.is_available ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                    {ts.is_available ? 'Available' : 'Full / Inactive'}
                                                </span>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Date</p>
                                                    <p className="text-lg font-bold">{ts.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Time Window</p>
                                                    <p className="text-lg font-bold">{ts.start_time_display} - {ts.end_time_display}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/5 p-3 rounded-xl">
                                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Capacity</p>
                                                        <p className="text-sm font-bold">{ts.capacity} Bookings</p>
                                                    </div>
                                                    <div className="bg-white/5 p-3 rounded-xl">
                                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Available</p>
                                                        <p className="text-sm font-bold text-primary">{ts.available_slots} Left</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold outfit mb-6 flex items-center gap-2"><Car className="text-primary" /> Car Wash Packages</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {services.wash.map(s => (
                                    <div key={s.id} className="glass-heavy p-6 rounded-3xl border border-glass flex gap-6">
                                        <div className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden border border-glass shrink-0">
                                            {s.image ? (
                                                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted"><ImageIcon size={32} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold outfit mb-1">{s.name}</h4>
                                            <p className="text-xs text-text-muted line-clamp-2 mb-4">{s.description}</p>
                                            <button 
                                                onClick={() => {
                                                    setEditingService({ ...s, type: 'wash' });
                                                    setServiceFormData({ name: s.name, description: s.description, is_active: s.is_active, image: null });
                                                    setShowServiceModal(true);
                                                }}
                                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
                                            >
                                                <Edit2 size={12} /> Edit Package
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold outfit mb-6 flex items-center gap-2"><ShieldCheck className="text-secondary" /> Ceramic Coatings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {services.ceramic.map(s => (
                                    <div key={s.id} className="glass-heavy p-6 rounded-3xl border border-glass flex gap-6">
                                        <div className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden border border-glass shrink-0">
                                            {s.image ? (
                                                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted"><ImageIcon size={32} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold outfit mb-1">{s.name}</h4>
                                            <p className="text-xs text-text-muted line-clamp-2 mb-4">{s.description}</p>
                                            <button 
                                                onClick={() => {
                                                    setEditingService({ ...s, type: 'ceramic' });
                                                    setServiceFormData({ name: s.name, description: s.description, is_active: s.is_active, image: null });
                                                    setShowServiceModal(true);
                                                }}
                                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
                                            >
                                                <Edit2 size={12} /> Edit Specs
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedBooking(null)}
                            className="absolute inset-0 bg-deep/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-deep border border-glass w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10"
                        >
                            <button onClick={() => setSelectedBooking(null)} className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors">
                                <XCircle size={32} />
                            </button>

                            <div className="p-10 md:p-14">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className={`px-4 py-1.5 rounded-lg border text-[10px] font-bold tracking-[0.2em] uppercase ${statusColors[selectedBooking?.status]}`}>
                                                {selectedBooking?.status_display}
                                            </span>
                                            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">ID: {selectedBooking?.booking_id}</span>
                                        </div>
                                        <h2 className="text-5xl font-bold outfit tracking-tighter uppercase">{selectedBooking?.vehicle_details?.plate_number}</h2>
                                        <p className="text-text-muted font-bold tracking-[0.2em] uppercase text-xs mt-4">Mission Intel Report.</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-glass text-right min-w-[200px]">
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-2">Total Service Revenue</p>
                                        <p className="text-4xl font-bold text-white outfit">₹{selectedBooking?.total_price}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    <div className="glass p-8 rounded-3xl space-y-6">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={20} />
                                            </div>
                                            <h4 className="font-bold outfit text-xl text-white">Pilot Profile.</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Legal Name</p>
                                                <p className="font-bold text-lg">{selectedBooking?.customer_details?.full_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Communication Channel</p>
                                                <p className="font-bold text-lg">{selectedBooking?.customer_details?.email}</p>
                                                <p className="text-text-secondary font-medium">{selectedBooking?.customer_details?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="glass p-8 rounded-3xl space-y-6">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                                <Car size={20} />
                                            </div>
                                            <h4 className="font-bold outfit text-xl text-white">Vehicle Specs.</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Manufacturer</p>
                                                <p className="font-bold uppercase">{selectedBooking?.vehicle_details?.make}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Model variant</p>
                                                <p className="font-bold uppercase">{selectedBooking?.vehicle_details?.model}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Energy Type</p>
                                                <p className="font-bold uppercase">{selectedBooking?.vehicle_details?.fuel_type || 'Petrol'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Exterior Hue</p>
                                                <p className="font-bold uppercase">{selectedBooking?.vehicle_details?.color || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 glass p-8 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                                            <MapPin size={20} />
                                        </div>
                                        <h4 className="font-bold outfit text-xl text-white">Deployment Schedule.</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-12">
                                        <div>
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Arrival Date</p>
                                            <p className="font-bold text-lg">{selectedBooking?.time_slot_details?.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Entry Window</p>
                                            <p className="font-bold text-lg">{selectedBooking?.time_slot_details?.start_time} - {selectedBooking?.time_slot_details?.end_time}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-wrap gap-4">
                                    {selectedBooking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                                                className="flex-1 btn-primary py-4 text-sm font-bold uppercase tracking-widest"
                                            >
                                                Confirm Mission
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                                                className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-4 text-sm font-bold uppercase tracking-widest hover:bg-red-500/20"
                                            >
                                                Reject Entry
                                            </button>
                                        </>
                                    )}
                                    {selectedBooking.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                                            className="w-full bg-green-500 py-4 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-green-600 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                                        >
                                            Finalize Treatment & Deploy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showServiceModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowServiceModal(false)}
                            className="absolute inset-0 bg-deep/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-deep border border-glass w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-10"
                        >
                            <h2 className="text-3xl font-bold outfit tracking-tight mb-8 uppercase">Modify Service <span className="text-primary italic">Specs.</span></h2>
                            <form onSubmit={handleServiceSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Service Name</label>
                                    <input 
                                        type="text" 
                                        value={serviceFormData.name}
                                        onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})}
                                        className="w-full bg-white/5 border border-glass p-4 rounded-xl focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Intel Description</label>
                                    <textarea 
                                        rows="4"
                                        value={serviceFormData.description}
                                        onChange={e => setServiceFormData({...serviceFormData, description: e.target.value})}
                                        className="w-full bg-white/5 border border-glass p-4 rounded-xl focus:border-primary outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Service Visualization (Picture)</label>
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            onChange={e => setServiceFormData({...serviceFormData, image: e.target.files[0]})}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full bg-white/5 border border-glass border-dashed p-8 rounded-xl flex flex-col items-center justify-center gap-3 group-hover:bg-white/10 transition-all overflow-hidden">
                                            <ImageIcon className="text-text-muted" />
                                            <span className="text-xs font-bold text-text-muted uppercase tracking-widest text-center truncate w-full px-4">
                                                {serviceFormData.image ? serviceFormData.image.name : 'Upload New Image'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-primary py-4 font-bold uppercase tracking-widest rounded-2xl">
                                    Apply Configuration
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main >
    );
};

export default AdminDashboard;
