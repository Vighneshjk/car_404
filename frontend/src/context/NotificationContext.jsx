import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeNotification(id), 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const handleExternalNotification = useCallback((event) => {
        const { message, type } = event.detail;
        addNotification(message, type);
    }, [addNotification]);

    React.useEffect(() => {
        window.addEventListener('app-notify', handleExternalNotification);
        return () => window.removeEventListener('app-notify', handleExternalNotification);
    }, [handleExternalNotification]);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[500] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                min-w-[320px] max-w-md p-5 rounded-2xl shadow-2xl backdrop-blur-xl border
                                flex items-center gap-4 relative overflow-hidden
                                ${n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                  n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                  'bg-primary/10 border-primary/20 text-primary'}
                            `}>
                                <div className={`absolute top-0 left-0 w-1 h-full ${
                                    n.type === 'error' ? 'bg-red-500' :
                                    n.type === 'success' ? 'bg-green-500' :
                                    'bg-primary'
                                }`} />
                                
                                <div className="p-2 rounded-lg bg-black/20">
                                    {n.type === 'error' ? <AlertCircle size={20} /> :
                                     n.type === 'success' ? <CheckCircle2 size={20} /> :
                                     <Info size={20} />}
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-1">
                                        {n.type === 'error' ? 'System Warning' : 
                                         n.type === 'success' ? 'Mission Success' : 
                                         'Protocol Information'}
                                    </p>
                                    <p className="font-bold text-sm tracking-tight leading-snug">{n.message}</p>
                                </div>
                                
                                <button
                                    onClick={() => removeNotification(n.id)}
                                    className="p-1 hover:bg-black/10 rounded-full transition-colors opacity-50 hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
