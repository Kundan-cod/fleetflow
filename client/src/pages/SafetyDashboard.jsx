import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, AlertTriangle, FileText, HardHat, Siren, Activity, Eye } from 'lucide-react';
import api from '../api';
import PageTransition from '../components/PageTransition';
import KPICard from '../components/KPICard';
import StatusPill from '../components/StatusPill';
import { useSocket } from '../context/SocketContext';

export default function SafetyDashboard() {
    const socket = useSocket();
    const [safetyStats, setSafetyStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get('/analytics/dashboard'); // Reusing existing or would need safety specific endpoint
            setSafetyStats(res.data);
        } catch (err) {
            console.error('Safety dashboard fetch error:', err);
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

    if (loading) return <div className="animate-pulse space-y-8"><div className="h-32 bg-navy-800 rounded-2xl" /><div className="h-96 bg-navy-800 rounded-2xl" /></div>;

    return (
        <PageTransition>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="text-accent" /> Safety & Compliance Command
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Monitor fleet incidents and safety protocols</p>
                    </div>
                    <button className="btn-glow flex items-center gap-2 bg-danger hover:bg-danger-dark">
                        <Siren className="w-4 h-4" /> Report Incident
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KPICard title="Safety Score" value={98.4} suffix="%" icon={CheckCircle} color="success" />
                    <KPICard title="Active Alerts" value={2} icon={AlertTriangle} color="warning" />
                    <KPICard title="Incidents (MTD)" value={0} icon={ShieldAlert} color="accent" />
                    <KPICard title="Inspections Due" value={5} icon={FileText} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-accent" /> Recent Inspections
                        </h3>
                        <div className="space-y-4">
                            {[
                                { fleetId: 'FL-1001', type: 'Annual', date: '2026-02-20', status: 'passed' },
                                { fleetId: 'FL-1005', type: 'Pre-Trip', date: '2026-02-21', status: 'warning' },
                                { fleetId: 'FL-1008', type: 'Post-Trip', date: '2026-02-21', status: 'passed' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                                            <HardHat className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.fleetId} - {item.type}</p>
                                            <p className="text-xs text-slate-500">{item.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusPill status={item.status} />
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-warning/10 to-transparent border-warning/20">
                        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning" /> Safety Alerts & Violations
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                                <p className="text-xs font-bold text-warning uppercase">Speeding Violation</p>
                                <p className="text-sm text-white mt-1">Vehicle FL-1003 exceeded 100km/h on NH-8</p>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-[10px] text-slate-500">2 hours ago</span>
                                    <button className="text-[10px] text-warning hover:underline">Review Footage</button>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
                                <p className="text-xs font-bold text-danger uppercase">License Expiry</p>
                                <p className="text-sm text-white mt-1">Driver "Rajesh Kumar" license expiring in 48h</p>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-[10px] text-slate-500">System Flag</span>
                                    <button className="text-[10px] text-danger hover:underline">Suspend Duty</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
