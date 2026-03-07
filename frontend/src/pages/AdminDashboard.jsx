import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter, ShieldCheck, Car, User, MapPin } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (activeTab === 'bookings') {
            fetchBookings();
        } else {
            fetchUsers();
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

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await api.patch(`/bookings/${id}/update-status/`, { status: newStatus });
            // Refresh local state
            const updatedBookings = bookings.map(b => b.id === id ? { ...b, status: newStatus, status_display: newStatus.toUpperCase() } : b);
            setBookings(updatedBookings);
            // Also update the selected booking if the modal is open for this ID
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
                        </div>
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder={activeTab === 'bookings' ? "Search Bookings..." : "Search User Directory..."}
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
                                            {/* Primary Info */}
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

                                            {/* Logistics */}
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

                                            {/* Actions */}
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
                ) : (
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
                )}
            </div>

            {/* DETAIL MODAL */}
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
                                    {/* User Details */}
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

                                    {/* Vehicle Specs */}
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
            </AnimatePresence>
        </main >
    );
};

export default AdminDashboard;
