import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Wrench, Gauge, Package, Users, MapPin, Fuel, DollarSign } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';
import PageTransition from '../components/PageTransition';
import KPICard from '../components/KPICard';
import StatusPill from '../components/StatusPill';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs border border-white/10">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes, activityRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/charts'),
          api.get('/analytics/activity'),
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-navy-800/40 animate-pulse" />
        ))}
        <div className="col-span-2 h-72 rounded-2xl bg-navy-800/40 animate-pulse" />
        <div className="col-span-2 h-72 rounded-2xl bg-navy-800/40 animate-pulse" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time fleet operations overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Active Fleet" value={stats?.fleet?.activeFleet || 0} icon={Truck} color="accent" delay={0} />
          <KPICard title="In Maintenance" value={stats?.fleet?.inMaintenance || 0} icon={Wrench} color="warning" delay={0.1} />
          <KPICard title="Utilization" value={stats?.fleet?.utilization || 0} suffix="%" icon={Gauge} color="success" delay={0.2} />
          <KPICard title="Active Trips" value={stats?.trips?.activeTrips || 0} icon={Package} color="purple" delay={0.3} />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total Drivers" value={stats?.drivers?.totalDrivers || 0} icon={Users} color="accent" delay={0.4} />
          <KPICard title="Completed Trips" value={stats?.trips?.completedTrips || 0} icon={MapPin} color="success" delay={0.5} />
          <KPICard title="Fuel Efficiency" value={parseFloat(stats?.fuel?.fuelEfficiency) || 0} suffix="km/L" icon={Fuel} color="warning" delay={0.6} />
          <KPICard title="Total Expenses" value={stats?.costs?.totalCost || 0} suffix="₹" icon={DollarSign} color="danger" delay={0.7} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel Efficiency Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Fuel Efficiency Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={charts?.fuelData || []}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="url(#fuelGrad)" strokeWidth={2} name="km/L" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Expense Breakdown Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Monthly Expenses</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts?.expenseData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="fuel" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Fuel" />
                <Bar dataKey="maintenance" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            ) : (
              activity.slice(0, 8).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.type === 'trip' ? 'bg-blue-400' : 'bg-amber-400'
                  }`} />
                  <p className="text-sm text-slate-300 flex-1 truncate">{item.message}</p>
                  <StatusPill status={item.status} />
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(item.time).toLocaleDateString()}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
