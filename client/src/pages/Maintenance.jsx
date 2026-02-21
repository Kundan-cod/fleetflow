import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wrench, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import PageTransition from '../components/PageTransition';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';

const serviceTypes = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'tire_replacement', label: 'Tire Replacement' },
  { value: 'brake_service', label: 'Brake Service' },
  { value: 'engine_repair', label: 'Engine Repair' },
  { value: 'general_inspection', label: 'General Inspection' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'other', label: 'Other' },
];

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', serviceType: 'oil_change', description: '', cost: '', date: '' });

  const fetchData = async () => {
    try {
      const [mRes, vRes] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
      setRecords(mRes.data);
      setVehicles(vRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', { ...form, cost: Number(form.cost) });
      toast.success('Maintenance record added — vehicle moved to shop');
      setModalOpen(false);
      setForm({ vehicleId: '', serviceType: 'oil_change', description: '', cost: '', date: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding record');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/maintenance/${id}/resolve`);
      toast.success('Maintenance resolved — vehicle available');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resolving');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/maintenance/${id}`);
      toast.success('Record deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting');
    }
  };

  const availableForService = vehicles.filter(v => v.status !== 'on_trip');

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Maintenance Logs</h1>
            <p className="text-sm text-slate-400 mt-1">{records.filter(r => !r.resolved).length} pending services</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-glow flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Description</th>
                  <th>Cost</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={7}><div className="h-5 bg-navy-700/50 rounded animate-pulse" /></td></tr>
                  ))
                ) : records.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">No maintenance records</td></tr>
                ) : (
                  records.map((r, i) => (
                    <motion.tr key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-amber-400" />
                          <span className="font-medium text-white">{r.vehicleId?.name || '—'}</span>
                          <span className="text-xs text-slate-500">({r.vehicleId?.plate})</span>
                        </div>
                      </td>
                      <td className="capitalize">{r.serviceType.replace(/_/g, ' ')}</td>
                      <td className="text-xs max-w-[200px] truncate">{r.description || '—'}</td>
                      <td className="font-mono text-sm">₹{r.cost.toLocaleString()}</td>
                      <td className="text-xs">{new Date(r.date).toLocaleDateString()}</td>
                      <td><StatusPill status={r.resolved ? 'resolved' : 'pending'} /></td>
                      <td>
                        <div className="flex items-center gap-1">
                          {!r.resolved && (
                            <button onClick={() => handleResolve(r._id)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all" title="Resolve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Service Record">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Vehicle</label>
                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="select-glass" required>
                  <option value="">Select vehicle...</option>
                  {availableForService.map(v => <option key={v._id} value={v._id}>{v.name} ({v.plate})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Service Type</label>
                <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="select-glass">
                  {serviceTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Cost (₹)</label>
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input-glass" placeholder="5000" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-glass" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-glass h-20 resize-none" placeholder="Service details..." />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-glow">Add Record</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
}
