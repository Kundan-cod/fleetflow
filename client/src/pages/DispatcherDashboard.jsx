import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Users, Clock, Plus, Zap, Activity, TrendingUp, BarChart3, Network, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api';
import PageTransition from '../components/PageTransition';
import KPICard from '../components/KPICard';
import StatusPill from '../components/StatusPill';
import { useSocket } from '../context/SocketContext';

const HEATMAP_DATA = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
        day,
        hour,
        value: Math.floor(Math.random() * 100)
    }))
).flat();

const MKT_GROWTH_DATA = [
    { name: 'Jan', orders: 400 }, { name: 'Feb', orders: 600 },
    { name: 'Mar', orders: 850 }, { name: 'Apr', orders: 1200 },
    { name: 'May', orders: 1800 }, { name: 'Jun', orders: 2400 },
];

const DISPATCH_DIST = [
    { region: 'West', count: 45 }, { region: 'North', count: 32 },
    { region: 'East', count: 28 }, { region: 'South', count: 54 },
    { region: 'Central', count: 19 },
];

export default function DispatcherDashboard() {
    const socket = useSocket();
    const [stats, setStats] = useState(null);
    const [activeTrips, setActiveTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [statsRes, tripsRes] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/trips', { params: { status: 'dispatched' } }),
            ]);
            setStats(statsRes.data);
            setActiveTrips(tripsRes.data);
        } catch (err) {
            console.error('Dispatcher dashboard fetch error:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (socket) {
            socket.on('trip_update', () => fetchData(true));
            return () => socket.off('trip_update');
        }
    }, [socket]);

    if (loading) return (
        <div className="grid grid-cols-3 gap-6 animate-pulse">
            <div className="h-32 bg-navy-800 rounded-2xl" />
            <div className="h-32 bg-navy-800 rounded-2xl" />
            <div className="h-32 bg-navy-800 rounded-2xl" />
            <div className="col-span-2 h-96 bg-navy-800 rounded-2xl" />
            <div className="h-96 bg-navy-800 rounded-2xl" />
        </div>
    );

    return (
        <PageTransition>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            Dispatcher Intelligence <StatusPill status="active" />
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Operational control and logistics analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary flex items-center gap-2 text-xs">
                            <Activity className="w-4 h-4" /> System Health
                        </button>
                        <button onClick={() => navigate('/trips')} className="btn-glow flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Dispatch
                        </button>
                    </div>
                </div>

                {/* Top KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KPICard title="Running Trips" value={stats?.trips?.activeTrips || 0} icon={Zap} color="accent" />
                    <KPICard title="Idle Fleet" value={(stats?.fleet?.activeFleet - stats?.fleet?.onTrip) || 0} icon={Truck} color="success" />
                    <KPICard title="Drivers Active" value={stats?.drivers?.driversOnDuty || 0} icon={Users} color="purple" />
                    <KPICard title="On-Time Rate" value={98} suffix="%" icon={TrendingUp} color="warning" />
                </div>

                {/* Middle Section: Heatmap & Bar Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Dispatch Heatmap */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-accent" /> Hourly Dispatch Density
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase">
                                <span>Low</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-sm bg-accent/10" />
                                    <div className="w-2 h-2 rounded-sm bg-accent/40" />
                                    <div className="w-2 h-2 rounded-sm bg-accent/70" />
                                    <div className="w-2 h-2 rounded-sm bg-accent" />
                                </div>
                                <span>Peak</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-[20px_repeat(24,1fr)] gap-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, di) => (
                                <>
                                    <span className="text-[10px] text-slate-600 flex items-center uppercase">{day}</span>
                                    {Array.from({ length: 24 }).map((_, hi) => {
                                        const val = Math.random() * 100;
                                        return (
                                            <div
                                                key={`${di}-${hi}`}
                                                className="aspect-square rounded-[2px] cursor-pointer hover:ring-1 hover:ring-white/40 transition-all shadow-sm"
                                                style={{ background: val > 80 ? '#3b82f6' : val > 50 ? 'rgba(59,130,246,0.5)' : val > 20 ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)' }}
                                                title={`${hi}:00 - Intensity: ${Math.round(val)}%`}
                                            />
                                        );
                                    })}
                                </>
                            ))}
                        </div>
                    </div>

                    {/* Regional Distribution BarChart */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-400" /> Regional Output
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DISPATCH_DIST}>
                                    <XAxis dataKey="region" hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        content={({ payload }) => payload?.[0] ? (
                                            <div className="glass-card p-2 text-[10px] shadow-2xl">
                                                <p className="text-white font-bold">{payload[0].payload.region}</p>
                                                <p className="text-accent">{payload[0].value} trips</p>
                                            </div>
                                        ) : null}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {DISPATCH_DIST.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex justify-around">
                            {DISPATCH_DIST.map((d, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase">{d.region}</p>
                                    <p className="text-xs font-bold text-white">{d.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lower Section: Diagrams & Growth */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dispatch Logic Diagram */}
                    <div className="glass-card p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl pointer-events-none" />
                        <h3 className="text-sm font-semibold text-white mb-8 flex items-center gap-2">
                            <Network className="w-4 h-4 text-emerald-400" /> Fleet Execution Flow
                        </h3>
                        <div className="flex items-center justify-between px-4 relative">
                            {/* Arrows */}
                            <div className="absolute left-1/4 right-1/4 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0" />

                            {[
                                { label: 'Order', icon: PieChart, color: 'bg-blue-500' },
                                { label: 'Assign', icon: Users, color: 'bg-indigo-500' },
                                { label: 'Transit', icon: Truck, color: 'bg-emerald-500' },
                                { label: 'Done', icon: Zap, color: 'bg-accent' },
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.2, type: 'spring' }}
                                    className="flex flex-col items-center gap-3 relative z-10"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${step.color} shadow-lg flex items-center justify-center text-white ring-4 ring-navy-900`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{step.label}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 italic">
                            "AI-optimized routing active. Dispatch-to-Assignment latency reduced by 14% this week."
                        </div>
                    </div>

                    {/* Marketing/Growth AreaChart */}
                    <div className="glass-card p-6 border-l-4 border-l-accent">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-accent" /> Dispatch Expansion (Growth)
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">+24% YoY</span>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MKT_GROWTH_DATA}>
                                    <defs>
                                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        content={({ payload }) => payload?.[0] ? (
                                            <div className="glass-card p-2 text-[10px] shadow-2xl">
                                                <p className="text-white font-bold">{payload[0].payload.name}</p>
                                                <p className="text-accent">{payload[0].value.toLocaleString()} trips</p>
                                            </div>
                                        ) : null}
                                    />
                                    <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="url(#growthGrad)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Final Row: Active Trips Grid */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Truck className="w-4 h-4 text-accent" /> Live Fleet Tracking
                        </h3>
                        <button onClick={() => navigate('/trips')} className="text-xs text-slate-500 hover:text-accent transition-colors">View All Monitoring</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {activeTrips.length === 0 ? (
                            <div className="col-span-full py-20 text-center opacity-20">
                                <Network className="w-20 h-20 mx-auto mb-4" />
                                <p className="text-lg font-bold">No active dispatches sensed in range</p>
                            </div>
                        ) : (
                            activeTrips.slice(0, 6).map((trip, i) => (
                                <motion.div
                                    key={trip._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-accent/40 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 -mr-10 -mt-10 rounded-full blur-2xl group-hover:bg-accent/15 transition-all" />
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">{trip.origin} → {trip.destination}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{trip.vehicleId?.name} • {trip.driverId?.name}</p>
                                            </div>
                                        </div>
                                        <StatusPill status={trip.status} />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
