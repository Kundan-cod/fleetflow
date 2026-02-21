import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Truck, Users, MapPin, Wrench,
  Receipt, BarChart3, LogOut, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Truck, label: 'Vehicles' },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { to: '/trips', icon: MapPin, label: 'Trips' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar({ collapsed }) {
  const { logout, user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (user?.role === 'dispatcher') {
      return ['Dashboard', 'Vehicles', 'Drivers', 'Trips', 'Maintenance'].includes(item.label);
    }
    if (user?.role === 'safety_officer') {
      return ['Dashboard', 'Vehicles', 'Drivers', 'Maintenance'].includes(item.label);
    }
    if (user?.role === 'financial_analyst') {
      return ['Dashboard', 'Expenses', 'Analytics'].includes(item.label);
    }
    return true; // manager sees all
  });

  return (
    <aside className={`relative h-screen bg-navy-800/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className={`p-6 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center shadow-glow flex-shrink-0"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
        >
          <Zap className="w-5 h-5 text-white" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-lg font-bold text-white tracking-tight">FleetFlow</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Fleet Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                ? 'text-white bg-accent/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-glow"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 transition-colors flex-shrink-0 ${isActive ? 'text-accent' : 'group-hover:text-accent'}`} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-accent/5 pointer-events-none" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-3 px-3 mb-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </motion.div>
          )}
        </div>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-danger hover:bg-danger/10 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </aside>
  );
}
