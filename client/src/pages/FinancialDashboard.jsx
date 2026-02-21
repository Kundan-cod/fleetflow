import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Receipt, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import api from '../api';
import PageTransition from '../components/PageTransition';
import KPICard from '../components/KPICard';

const CASH_FLOW_DATA = [
    { month: 'Sep', income: 45000, expenses: 32000 },
    { month: 'Oct', income: 52000, expenses: 35000 },
    { month: 'Nov', income: 48000, expenses: 38000 },
    { month: 'Dec', income: 61000, expenses: 40000 },
    { month: 'Jan', income: 55000, expenses: 42000 },
    { month: 'Feb', income: 68000, expenses: 44000 },
];

export default function FinancialDashboard() {
    const [finStats, setFinStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/analytics/dashboard');
            setFinStats(res.data);
        } catch (err) {
            console.error('Financial dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse space-y-8"><div className="h-32 bg-navy-800 rounded-2xl" /><div className="h-96 bg-navy-800 rounded-2xl" /></div>;

    return (
        <PageTransition>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <DollarSign className="text-success" /> Financial Intelligence
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Revenue analysis, expense tracking and profit margins</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary text-xs flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Export P&L
                        </button>
                        <button className="btn-glow flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Log Expense
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KPICard title="Total Revenue" value={finStats?.revenue?.totalRevenue || 124500} icon={TrendingUp} color="success" prefix="$" />
                    <KPICard title="Total Expenses" value={finStats?.revenue?.totalExpenses || 48200} icon={TrendingDown} color="danger" prefix="$" />
                    <KPICard title="Net Profit" value={76300} icon={DollarSign} color="accent" prefix="$" />
                    <KPICard title="Operating Ratio" value={38.7} suffix="%" icon={BarChart3} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-6">Revenue vs Expenses (6 Months)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={CASH_FLOW_DATA}>
                                    <defs>
                                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#expenseGrad)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white mb-6">Expense Breakdown</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { category: 'Fuel', amount: 15400 },
                                    { category: 'Maint.', amount: 12200 },
                                    { category: 'Wages', amount: 18000 },
                                    { category: 'Misc.', amount: 2600 },
                                ]}>
                                    <XAxis dataKey="category" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#8b5cf6" />
                                        <Cell fill="#f59e0b" />
                                        <Cell fill="#ec4899" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Largest Expense</span>
                                <span className="text-white font-bold">Driver Wages ($18.0k)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Fuel Efficiency Trend</span>
                                <span className="text-success flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +4.2%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

import { FileText, Plus } from 'lucide-react';
