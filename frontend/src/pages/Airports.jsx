import React, { useState, useEffect } from 'react';
import { PlaneTakeoff, Navigation, Timer, ExternalLink, MapPin } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Airports = () => {

    const airports = [
        { name: 'Kempegowda Int.', code: 'BLR', dist: '1.2 km', time: '5 mins', terminal: 'T1 & T2', spots: 45 },
        { name: 'Heathrow Airport', code: 'LHR', dist: '3.4 km', time: '12 mins', terminal: 'Terminal 5', spots: 82 },
        { name: 'Changi Airport', code: 'SIN', dist: '0.8 km', time: '4 mins', terminal: 'Jewel Wing', spots: 30 },
        { name: 'JFK International', code: 'JFK', dist: '2.1 km', time: '8 mins', terminal: 'T4 Elite', spots: 64 },
        { name: 'Dubai International', code: 'DXB', dist: '1.5 km', time: '6 mins', terminal: 'Concourse D', spots: 120 }
    ];

    const [selectedAirport, setSelectedAirport] = useState(airports[0]);
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-deep flex flex-col">
            <Navbar />

            <section className="pt-40 pb-20 px-5 bg-darker border-b border-glass relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-width text-center">
                    <p className="text-secondary font-bold tracking-widest text-sm mb-4 uppercase animate-pulse">
                        GLOBAL NETWORK
                    </p>
                    <h1 className="text-5xl md:text-7xl font-bold outfit tracking-tighter mb-8 leading-[1.1]">
                        WORLDWIDE <span className="text-primary italic">HUBS</span>,<br />
                        LOCAL <span className="text-secondary">PRECISION.</span>
                    </h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                        Strategically positioned near major international terminals. We provide secure
                        bays with ultra-fast connectivity and 24/7 drone surveillance.
                    </p>
                </div>
            </section>

            <section className="section-padding max-width px-5 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">


                <div className="space-y-6">
                    <h2 className="text-3xl font-bold outfit tracking-tight mb-10 flex items-center gap-4">
                        <MapPin className="text-primary" /> Active Hubs.
                    </h2>

                    <div className="space-y-4">
                        {airports.map((airport, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedAirport(airport)}
                                className={`w-full flex items-center justify-between p-6 glass rounded-2xl group transition-all duration-300 ${selectedAirport.code === airport.code ? 'border-primary ring-1 ring-primary/30 bg-primary/5' : 'hover:border-white/20'}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${selectedAirport.code === airport.code ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-text-secondary group-hover:bg-white/10'}`}>
                                        <PlaneTakeoff size={28} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-xl mb-1">{airport.name}</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-[0.2em] uppercase">GATEWAY: {airport.code} • {airport.terminal}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-2 font-bold text-lg ${selectedAirport.code === airport.code ? 'text-primary' : 'text-secondary'}`}>
                                        <Navigation size={18} /> {airport.dist}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold justify-end tracking-widest">
                                        AVAILABLE SPOTS: <span className="text-white">{airport.spots}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>


                <div className="sticky top-32">
                    <div className="glass-heavy p-2 rounded-[2.5rem] relative overflow-hidden group shadow-2xl border-white/5">
                        <div className="aspect-video w-full rounded-[2rem] bg-bg-deep relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473177104440-9286c4793f41?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-50 grayscale group-hover:scale-110 transition-all duration-[3000ms]" />
                            <div className="relative z-10 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-bounce backdrop-blur-3xl">
                                    <MapPin size={32} />
                                </div>
                                <p className="font-bold outfit text-3xl tracking-tighter uppercase text-white shadow-text">{selectedAirport.code} HUB RADAR</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass p-5 rounded-2xl border-glass">
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-2">Facility Capacity</p>
                                    <p className="text-2xl font-bold outfit">{selectedAirport.spots} <span className="text-sm font-normal text-text-secondary italic">Secure Bays</span></p>
                                </div>
                                <div className="glass p-5 rounded-2xl border-glass">
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-2">Avg. Transit</p>
                                    <p className="text-2xl font-bold outfit">{selectedAirport.time}</p>
                                </div>
                            </div>

                            <div className="glass p-6 rounded-2xl border-primary/20 bg-primary/5">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <Timer size={18} className="text-primary" /> Active Spot Intel
                                </h4>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    Located precisely at {selectedAirport.terminal} Link Road. Our facility features {selectedAirport.spots} intelligent spots with high-speed charging and precision drying drones.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => navigate('/bookings')}
                                    className="w-full btn-primary py-4 font-bold flex items-center justify-center gap-2 shadow-xl"
                                >
                                    Book Parking Slot
                                </button>
                                <button className="w-full btn-glass py-4 font-bold flex items-center justify-center gap-2">
                                    Navigate to {selectedAirport.code} Facility <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </main>
    );
};

export default Airports;
