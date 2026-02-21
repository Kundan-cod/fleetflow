import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Fuel, Trash2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import PageTransition from '../components/PageTransition';
import Modal from '../components/Modal';

export default function Expenses() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', tripId: '', liters: '', cost: '', odometer: '', date: '' });

  const fetchData = async () => {
    try {
      const [fRes, vRes, tRes] = await Promise.all([
        api.get('/fuel'),
        api.get('/vehicles'),
        api.get('/trips', { params: { status: 'completed' } }),
      ]);
      setLogs(fRes.data);
      setVehicles(vRes.data);
      setTrips(tRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const totalFuelCost = logs.reduce((s, l) => s + l.cost, 0);
  const totalLiters = logs.reduce((s, l) => s + l.liters, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fuel', {
        vehicleId: form.vehicleId,
        tripId: form.tripId || undefined,
        liters: Number(form.liters),
        cost: Number(form.cost),
        odometer: Number(form.odometer) || 0,
        date: form.date || undefined,
      });
      toast.success('Fuel log added');
      setModalOpen(false);
      setForm({ vehicleId: '', tripId: '', liters: '', cost: '', odometer: '', date: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding fuel log');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this fuel log?')) return;
    try {
      await api.delete(`/fuel/${id}`);
      toast.success('Fuel log deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting');
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Fuel & Expenses</h1>
            <p className="text-sm text-slate-400 mt-1">{logs.length} fuel logs recorded</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-glow flex items-center gap-2">
            <Plus className="w-4 h-4" /> Log Fuel
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/15"><Fuel className="w-5 h-5 text-blue-400" /></div>
              <div>
                <p className="text-xs text-slate-400">Total Fuel Cost</p>
                <p className="text-xl font-bold text-white">₹{totalFuelCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15"><Fuel className="w-5 h-5 text-amber-400" /></div>
              <div>
                <p className="text-xs text-slate-400">Total Liters</p>
                <p className="text-xl font-bold text-white">{totalLiters.toLocaleString()} L</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
              <div>
                <p className="text-xs text-slate-400">Avg Cost/Liter</p>
                <p className="text-xl font-bold text-white">₹{totalLiters > 0 ? (totalFuelCost / totalLiters).toFixed(2) : '0'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Trip</th>
                  <th>Liters</th>
                  <th>Cost</th>
                  <th>Odometer</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={7}><div className="h-5 bg-navy-700/50 rounded animate-pulse" /></td></tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">No fuel logs yet</td></tr>
                ) : (
                  logs.map((l, i) => (
                    <motion.tr key={l._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-blue-400" />
                          <span className="font-medium text-white">{l.vehicleId?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="text-xs">{l.tripId ? `${l.tripId.origin} → ${l.tripId.destination}` : '—'}</td>
                      <td>{l.liters} L</td>
                      <td className="font-mono text-sm">₹{l.cost.toLocaleString()}</td>
                      <td>{l.odometer?.toLocaleString() || '—'} km</td>
                      <td className="text-xs">{new Date(l.date).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDelete(l._id)} className="p-2 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Fuel Entry">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Vehicle</label>
                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="select-glass" required>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} ({v.plate})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Trip (optional)</label>
                <select value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })} className="select-glass">
                  <option value="">No trip</option>
                  {trips.map(t => <option key={t._id} value={t._id}>{t.origin} → {t.destination}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Liters</label>
                <input type="number" step="0.1" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} className="input-glass" placeholder="120" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Cost (₹)</label>
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input-glass" placeholder="10800" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Odometer</label>
                <input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} className="input-glass" placeholder="45000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-glass" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-glow">Add Entry</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
}
