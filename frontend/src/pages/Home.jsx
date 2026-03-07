import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicesShowcase from '../components/ServicesShowcase';
import TrackingShowcase from '../components/TrackingShowcase';
import AirportInfo from '../components/AirportInfo';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <main className="relative bg-bg-deep">
            <Navbar />

            <div className="relative">
                <Hero />

                <div className="relative z-10 bg-bg-deep">
                    <ServicesShowcase />
                    <TrackingShowcase />
                    <AirportInfo />
                </div>

                <Footer />
            </div>
        </main>
    );
};

export default Home;
