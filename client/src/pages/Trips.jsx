import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, CheckCircle, XCircle, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import PageTransition from '../components/PageTransition';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { useSocket } from '../context/SocketContext';

export default function Trips() {
  const socket = useSocket();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '', cargoDescription: '', notes: '' });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get('/trips'),
        api.get('/vehicles'),
        api.get('/drivers'),
      ]);
      setTrips(tripsRes.data || []);
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (err) {
      console.error('Fetch trips error:', err);
      if (!silent) toast.error('Failed to load data');
    }
    finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('trip_update', () => fetchData(true));
      return () => socket.off('trip_update');
    }
  }, [socket]);

  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const availableDrivers = drivers.filter(d => d.status === 'on_duty' && !d.isLicenseExpired);

  const handleDispatch = async (e) => {
    e.preventDefault();
    setErrors([]);
    try {
      await api.post('/trips', { ...form, cargoWeight: Number(form.cargoWeight) });
      toast.success('Trip dispatched!');
      setDispatchOpen(false);
      setForm({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '', cargoDescription: '', notes: '' });
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        toast.error(data?.message || 'Dispatch failed');
      }
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/trips/${completingTrip._id}/complete`, { endOdometer: Number(endOdometer) });
      toast.success('Trip completed!');
      setCompleteOpen(false);
      setCompletingTrip(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error completing trip');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this trip?')) return;
    try {
      await api.put(`/trips/${id}/cancel`);
      toast.success('Trip cancelled');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling trip');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip record?')) return;
    try {
      await api.delete(`/trips/${id}`);
      toast.success('Trip deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting trip');
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Trip Dispatcher</h1>
            <p className="text-sm text-slate-400 mt-1">{trips.length} trips total — {trips.filter(t => t.status === 'dispatched').length} active</p>
          </div>
          <button onClick={() => { setErrors([]); setDispatchOpen(true); }} className="btn-glow flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Dispatch
          </button>
        </div>

        {/* Trip Cards */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-navy-800/40 animate-pulse" />
            ))
          ) : trips.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No trips yet. Dispatch your first trip!</p>
            </div>
          ) : (
            trips.map((trip, i) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card-hover p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Route */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{trip.origin}</p>
                        <p className="text-xs text-slate-500">Origin</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-semibold text-white">{trip.destination}</p>
                        <p className="text-xs text-slate-500">Destination</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 pl-4 border-l border-white/10 text-xs text-slate-400">
                      <span>{trip.vehicleId?.name || '—'} ({trip.vehicleId?.plate})</span>
                      <span>{trip.driverId?.name || '—'}</span>
                      <span>{trip.cargoWeight?.toLocaleString()} kg</span>
                      {trip.distance > 0 && <span>{trip.distance} km</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusPill status={trip.status} />
                    {(trip.status === 'dispatched' || trip.status === 'in_transit') && (
                      <>
                        <button
                          onClick={() => { setCompletingTrip(trip); setEndOdometer(trip.startOdometer); setCompleteOpen(true); }}
                          className="p-2 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all"
                          title="Complete"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancel(trip._id)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger transition-all"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {(trip.status === 'completed' || trip.status === 'cancelled') && (
                      <button
                        onClick={() => handleDelete(trip._id)}
                        className="p-2 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Dispatch Modal */}
        <Modal isOpen={dispatchOpen} onClose={() => setDispatchOpen(false)} title="Dispatch New Trip" size="lg">
          <form onSubmit={handleDispatch} className="space-y-4">
            {errors.length > 0 && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 space-y-1">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-danger">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Vehicle</label>
                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="select-glass" required>
                  <option value="">Select vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.plate}) — {v.capacity.toLocaleString()}kg</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Driver</label>
                <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className="select-glass" required>
                  <option value="">Select driver...</option>
                  {availableDrivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} (Class {d.licenseType})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Cargo Weight (kg)</label>
                <input type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} className="input-glass" placeholder="5000" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Cargo Description</label>
                <input value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} className="input-glass" placeholder="Electronics, steel, etc." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Origin</label>
                <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="input-glass" placeholder="Mumbai" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Destination</label>
                <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="input-glass" placeholder="Delhi" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-glass h-20 resize-none" placeholder="Additional notes..." />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setDispatchOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-glow">Dispatch Trip</button>
            </div>
          </form>
        </Modal>

        {/* Complete Modal */}
        <Modal isOpen={completeOpen} onClose={() => setCompleteOpen(false)} title="Complete Trip" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Complete trip from <strong className="text-white">{completingTrip?.origin}</strong> to <strong className="text-white">{completingTrip?.destination}</strong>
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">End Odometer (km)</label>
              <input type="number" value={endOdometer} onChange={(e) => setEndOdometer(e.target.value)} className="input-glass" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button onClick={() => setCompleteOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleComplete} className="btn-glow">Mark Complete</button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}
