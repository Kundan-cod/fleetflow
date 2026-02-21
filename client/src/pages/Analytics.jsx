import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, BarChart3, TrendingUp, Fuel, DollarSign } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import api from '../api';
import PageTransition from '../components/PageTransition';
import KPICard from '../components/KPICard';

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

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

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/charts'),
        ]);
        setStats(sRes.data);
        setCharts(cRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const exportCSV = () => {
    if (!charts) return;
    const rows = [['Month', 'Fuel Cost', 'Maintenance Cost', 'Total', 'Liters', 'Efficiency (km/L)', 'Trips', 'Completed']];
    charts.expenseData.forEach((e, i) => {
      const f = charts.fuelData[i];
      const t = charts.tripData[i];
      rows.push([e.month, e.fuel, e.maintenance, e.total, f.liters, f.efficiency, t.total, t.completed]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fleetflow_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fleetStatusData = stats ? [
    { name: 'Available', value: stats.fleet.activeFleet - stats.fleet.onTrip },
    { name: 'On Trip', value: stats.fleet.onTrip },
    { name: 'In Shop', value: stats.fleet.inMaintenance },
    { name: 'Retired', value: stats.fleet.totalVehicles - stats.fleet.activeFleet - stats.fleet.inMaintenance },
  ].filter(d => d.value > 0) : [];

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-navy-800/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
            <p className="text-sm text-slate-400 mt-1">Fleet performance insights</p>
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total Distance" value={stats?.fuel?.totalDistance || 0} suffix="km" icon={TrendingUp} color="accent" delay={0} />
          <KPICard title="Fuel Efficiency" value={parseFloat(stats?.fuel?.fuelEfficiency) || 0} suffix="km/L" icon={Fuel} color="success" delay={0.1} />
          <KPICard title="Total Expenses" value={stats?.costs?.totalCost || 0} suffix="₹" icon={DollarSign} color="danger" delay={0.2} />
          <KPICard title="Completed Trips" value={stats?.trips?.completedTrips || 0} icon={BarChart3} color="purple" delay={0.3} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Volume */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Trip Volume</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts?.tripData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Fuel Efficiency Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Fuel Efficiency Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts?.fuelData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="efficiency" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="km/L" />
                <Line type="monotone" dataKey="liters" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Liters" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={charts?.expenseData || []}>
                <defs>
                  <linearGradient id="fuelArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="maintArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Area type="monotone" dataKey="fuel" stroke="#3b82f6" fill="url(#fuelArea)" strokeWidth={2} name="Fuel" />
                <Area type="monotone" dataKey="maintenance" stroke="#8b5cf6" fill="url(#maintArea)" strokeWidth={2} name="Maintenance" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Fleet Status Pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Fleet Status Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={fleetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fleetStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
