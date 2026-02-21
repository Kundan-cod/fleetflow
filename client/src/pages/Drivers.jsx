import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, User, AlertTriangle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import PageTransition from '../components/PageTransition';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';

const emptyDriver = { name: '', phone: '', licenseType: 'C', licenseNumber: '', expiryDate: '', status: 'on_duty' };

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDriver);

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get('/drivers', { params: { search: search || undefined } });
      setDrivers(data);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyDriver); setModalOpen(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name: d.name, phone: d.phone, licenseType: d.licenseType,
      licenseNumber: d.licenseNumber, expiryDate: d.expiryDate?.slice(0, 10) || '', status: d.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/drivers/${editing._id}`, form);
        toast.success('Driver updated');
      } else {
        await api.post('/drivers', form);
        toast.success('Driver added');
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving driver');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver deleted');
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting driver');
    }
  };

  const isExpired = (date) => new Date() > new Date(date);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Driver Management</h1>
            <p className="text-sm text-slate-400 mt-1">{drivers.length} registered drivers</p>
          </div>
          <button onClick={openAdd} className="btn-glow flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-glass pl-10" />
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Phone</th>
                  <th>License</th>
                  <th>Expiry</th>
                  <th>Rating</th>
                  <th>Trips</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={8}><div className="h-5 bg-navy-700/50 rounded animate-pulse" /></td></tr>
                  ))
                ) : drivers.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-500">No drivers found</td></tr>
                ) : (
                  drivers.map((d, i) => (
                    <motion.tr
                      key={d._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                            {d.name.charAt(0)}
                          </div>
                          <span className="font-medium text-white">{d.name}</span>
                        </div>
                      </td>
                      <td className="text-xs font-mono">{d.phone || '—'}</td>
                      <td><span className="bg-navy-700/50 px-2 py-0.5 rounded text-xs">Class {d.licenseType}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={isExpired(d.expiryDate) ? 'text-danger' : 'text-slate-300'}>
                            {new Date(d.expiryDate).toLocaleDateString()}
                          </span>
                          {isExpired(d.expiryDate) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/15 text-danger text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" /> Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm">{d.rating}</span>
                        </div>
                      </td>
                      <td>{d.totalTrips}</td>
                      <td><StatusPill status={d.status} /></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-accent transition-all">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(d._id)} className="p-2 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger transition-all">
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

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass" placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-glass" placeholder="+91-9876543210" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">License Class</label>
                <select value={form.licenseType} onChange={(e) => setForm({ ...form, licenseType: e.target.value })} className="select-glass">
                  {['A', 'B', 'C', 'D', 'E'].map(t => <option key={t} value={t}>Class {t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">License Number</label>
                <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="input-glass" placeholder="DL-C-12345" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">License Expiry</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input-glass" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-glass">
                  <option value="on_duty">On Duty</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-glow">{editing ? 'Update' : 'Add'} Driver</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
}
