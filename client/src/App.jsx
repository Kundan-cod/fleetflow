import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';
import SafetyDashboard from './pages/SafetyDashboard';
import FinancialDashboard from './pages/FinancialDashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import MaintenancePage from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'manager') return <ManagerDashboard />;
  if (user?.role === 'safety_officer') return <SafetyDashboard />;
  if (user?.role === 'financial_analyst') return <FinancialDashboard />;
  return <DispatcherDashboard />;
};

export default function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading FleetFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardRouter />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
