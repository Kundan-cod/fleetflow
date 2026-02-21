import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Also show a toast
            toast(notif.message, {
                icon: notif.type === 'success' ? '✅' : notif.type === 'danger' ? '❌' : '🔔',
                style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid rgba(59,130,246,0.3)',
                }
            });
        };

        socket.on('notification', handleNotification);
        return () => socket.off('notification', handleNotification);
    }, [socket]);

    const clearUnread = () => setUnreadCount(0);
    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, clearUnread, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};
