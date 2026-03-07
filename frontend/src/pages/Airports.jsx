import React, { useState, useEffect } from 'react';
import { PlaneTakeoff, Navigation, Timer, ExternalLink, MapPin } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const Airports = () => {
    const [airports, setAirports] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [airRes, locRes] = await Promise.all([
                    api.get('/airports/'),
                    api.get('/airports/location/')
                ]);
                setAirports(airRes.data);
                setLocations(locRes.data);
            } catch (err) {
                console.error('Error fetching airports:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-deep">
            <Navbar />

            <section className="pt-40 pb-20 px-5 bg-darker border-b border-glass relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-width text-center">
                    <p className="text-secondary font-bold tracking-widest text-sm mb-4 uppercase">
                        THE CONNECTION
                    </p>
                    <h1 className="text-5xl md:text-7xl font-bold outfit tracking-tighter mb-8">
                        NEAR TO THE <span className="text-primary italic">SKY</span>,<br />
                        NEXT TO YOUR <span className="text-secondary">CAR.</span>
                    </h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                        Strategically positioned on the airport link road. We serve major international
                        terminals with zero detours and maximum security.
                    </p>
                </div>
            </section>

            <section className="section-padding max-width px-5 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/* Locations Grid */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold outfit tracking-tight mb-10">Serving All Terminals.</h2>
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-32 glass rounded-2xl" />)
                    ) : (
                        airports.map((airport, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-6 glass rounded-2xl group hover:border-primary/50 cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white">
                                        <PlaneTakeoff size={28} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xl mb-1">{airport.name}</p>
                                        <p className="text-xs text-text-muted font-bold tracking-widest uppercase">AIRPORT CODE: {airport.code}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-secondary font-bold text-lg">
                                        <Navigation size={18} /> {airport.dist}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted text-xs font-bold justify-end">
                                        <Timer size={14} /> {airport.time}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Map Visual / Facility */}
                <div>
                    <div className="glass-heavy p-2 rounded-3xl relative overflow-hidden group">
                        <img
                            src="/airport_map_minimalist.png"
                            alt="Map Location"
                            className="w-full h-full object-cover rounded-2xl opacity-80"
                        />
                        <div className="absolute inset-x-5 bottom-5">
                            {locations && (
                                <div className="glass p-6 rounded-2xl backdrop-blur-xl border-primary/30 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold">Facility Location</p>
                                            <p className="text-xs text-text-muted font-medium">{locations.address || 'Plot 404, Main Airport Link Road'}</p>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary text-sm font-medium mb-6">{locations.description || 'Avoiding the terminal traffic? Our secure indoor and outdoor bays are waiting for you.'}</p>
                                    <button className="w-full btn-glass py-3 font-bold flex items-center justify-center gap-2">
                                        Get Google Direct <ExternalLink size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </section>
        </main>
    );
};

export default Airports;
