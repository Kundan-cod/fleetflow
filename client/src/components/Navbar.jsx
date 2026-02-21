import { Search, Bell, X, Trash2, Clock, Menu, ChevronLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ toggleSidebar, isCollapsed }) {
  const { user } = useAuth();
  const { notifications, unreadCount, clearUnread, clearAll } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) clearUnread();
  };

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-8 bg-navy-900/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-6">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          )}
        </button>

        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search fleet, drivers, trips..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-navy-800/60 border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-accent/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleToggle}
            className={`relative p-2 rounded-xl transition-all duration-300 group ${showNotifications ? 'bg-accent/15 text-accent' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-navy-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-navy-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <button
                    onClick={clearAll}
                    className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-danger transition-all"
                    title="Clear All"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-10 h-10 text-slate-700 mx-auto mb-2 opacity-20" />
                      <p className="text-xs text-slate-500">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors flex gap-3"
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-400' : n.type === 'danger' ? 'bg-red-400' : 'bg-blue-400'
                          }`} />
                        <div>
                          <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <button className="w-full py-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:bg-accent/5 rounded-lg transition-all">
                      View All Activity
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-glow">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
