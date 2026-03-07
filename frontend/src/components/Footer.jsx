import { Car, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-darker pt-24 pb-12 border-t border-glass">
            <div className="max-width px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                {/* Brand */}
                <div className="max-w-xs">
                    <div className="flex items-center gap-2 mb-8 group">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                            <Car size={24} color="white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter outfit">
                            404<span className="text-secondary">CARE</span>
                        </span>
                    </div>
                    <p className="text-text-secondary mb-10 leading-relaxed font-medium">
                        World-class detailing and secure airport parking. Elevating your vehicle ownership experience through precision and transparency.
                    </p>
                    <div className="flex gap-4">
                        {[Instagram, Twitter, Facebook].map((Icon, idx) => (
                            <a key={idx} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 hover:text-primary">
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-bold outfit mb-8">Navigation</h4>
                    <ul className="space-y-4">
                        <li><Link to="/" className="text-text-muted hover:text-white font-medium">Home</Link></li>
                        <li><Link to="/services" className="text-text-muted hover:text-white font-medium">Services</Link></li>
                        <li><Link to="/airports" className="text-text-muted hover:text-white font-medium">Airports</Link></li>
                        <li><Link to="/bookings" className="text-text-muted hover:text-white font-medium">Booking</Link></li>
                        <li><Link to="/dashboard" className="text-text-muted hover:text-white font-medium">Dashboard</Link></li>
                    </ul>
                </div>

                {/* Services */}
                <div>
                    <h4 className="text-lg font-bold outfit mb-8">Service Areas</h4>
                    <ul className="space-y-4 text-text-muted">
                        {['Ceramic Coating', 'Detail Polish', 'Interior Restoration', 'Secure Parking', 'Airport Shuttle'].map(item => (
                            <li key={item} className="font-medium hover:text-primary cursor-pointer">{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-lg font-bold outfit mb-8">Get In Touch</h4>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <MapPin size={24} className="text-primary mt-1" />
                            <p className="text-text-muted font-medium">Plot 404, Airport Main Road, Tech Park Enclave, Bengaluru.</p>
                        </li>
                        <li className="flex items-center gap-4">
                            <Phone size={24} className="text-primary" />
                            <p className="text-text-muted font-medium">+91 98765-XXXXX</p>
                        </li>
                        <li className="flex items-center gap-4">
                            <Mail size={24} className="text-primary" />
                            <p className="text-text-muted font-medium">hello@404carcare.com</p>
                        </li>
                    </ul>
                </div>

            </div>

            <div className="max-width px-5 flex flex-col sm:flex-row justify-between pt-12 border-t border-glass text-text-muted text-sm font-medium">
                <p>© 2026 404 Car Care. All rights reserved.</p>
                <div className="flex gap-10 mt-6 sm:mt-0">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
