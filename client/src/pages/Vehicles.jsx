import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import PageTransition from '../components/PageTransition';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';

const emptyVehicle = { name: '', plate: '', type: 'truck', capacity: '', odometer: 0, fuelType: 'diesel', status: 'available' };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyVehicle);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles', { params: { search: search || undefined } });
      setVehicles(data);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyVehicle); setModalOpen(true); };
  const openEdit = (v) => { setEditing(v); setForm({ name: v.name, plate: v.plate, type: v.type, capacity: v.capacity, odometer: v.odometer, fuelType: v.fuelType, status: v.status }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/vehicles/${editing._id}`, { ...form, capacity: Number(form.capacity) });
        toast.success('Vehicle updated');
      } else {
        await api.post('/vehicles', { ...form, capacity: Number(form.capacity) });
        toast.success('Vehicle added');
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting vehicle');
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Vehicle Registry</h1>
            <p className="text-sm text-slate-400 mt-1">{vehicles.length} vehicles in fleet</p>
          </div>
          <button onClick={openAdd} className="btn-glow flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass pl-10"
          />
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Plate</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Odometer</th>
                  <th>Fuel</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={8}><div className="h-5 bg-navy-700/50 rounded animate-pulse" /></td></tr>
                  ))
                ) : vehicles.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-500">No vehicles found</td></tr>
                ) : (
                  vehicles.map((v, i) => (
                    <motion.tr
                      key={v._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-accent" />
                          </div>
                          <span className="font-medium text-white">{v.name}</span>
                        </div>
                      </td>
                      <td><span className="font-mono text-xs bg-navy-700/50 px-2 py-1 rounded">{v.plate}</span></td>
                      <td className="capitalize">{v.type}</td>
                      <td>{v.capacity.toLocaleString()} kg</td>
                      <td>{v.odometer.toLocaleString()} km</td>
                      <td className="capitalize">{v.fuelType}</td>
                      <td><StatusPill status={v.status} /></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-accent transition-all">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v._id)} className="p-2 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger transition-all">
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

        {/* Add/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass" placeholder="Titan Hauler" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">License Plate</label>
                <input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className="input-glass" placeholder="FL-1001" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-glass">
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="trailer">Trailer</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Capacity (kg)</label>
                <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input-glass" placeholder="12000" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Fuel Type</label>
                <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className="select-glass">
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-glass">
                  <option value="available">Available</option>
                  <option value="in_shop">In Shop</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-glow">{editing ? 'Update' : 'Add'} Vehicle</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
}
