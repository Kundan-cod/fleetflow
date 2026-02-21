import { Router } from 'express';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Maintenance from '../models/Maintenance.js';
import FuelLog from '../models/FuelLog.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics/dashboard — KPI stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [vehicles, drivers, trips, maintenance, fuelLogs] = await Promise.all([
      Vehicle.find(),
      Driver.find(),
      Trip.find(),
      Maintenance.find(),
      FuelLog.find(),
    ]);

    const totalVehicles = vehicles.length;
    const activeFleet = vehicles.filter(v => v.status === 'available' || v.status === 'on_trip').length;
    const inMaintenance = vehicles.filter(v => v.status === 'in_shop').length;
    const onTrip = vehicles.filter(v => v.status === 'on_trip').length;
    const utilization = totalVehicles > 0 ? Math.round((onTrip / totalVehicles) * 100) : 0;

    const totalDrivers = drivers.length;
    const driversOnDuty = drivers.filter(d => d.status === 'on_duty').length;
    const driversOnTrip = drivers.filter(d => d.status === 'on_trip').length;
    const expiredLicenses = drivers.filter(d => new Date() > d.expiryDate).length;

    const totalTrips = trips.length;
    const activeTrips = trips.filter(t => t.status === 'dispatched' || t.status === 'in_transit').length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;

    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const totalDistance = trips.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.distance, 0);
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : 0;

    res.json({
      fleet: { totalVehicles, activeFleet, inMaintenance, onTrip, utilization },
      drivers: { totalDrivers, driversOnDuty, driversOnTrip, expiredLicenses },
      trips: { totalTrips, activeTrips, completedTrips },
      costs: { totalMaintenanceCost, totalFuelCost, totalCost: totalMaintenanceCost + totalFuelCost },
      fuel: { totalFuelLiters, fuelEfficiency, totalDistance },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/charts — monthly data for charts
router.get('/charts', protect, async (req, res) => {
  try {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      });
    }

    const fuelData = [];
    const tripData = [];
    const expenseData = [];

    for (const month of months) {
      const monthFuel = await FuelLog.find({ date: { $gte: month.start, $lte: month.end } });
      const monthTrips = await Trip.find({ createdAt: { $gte: month.start, $lte: month.end } });
      const monthMaintenance = await Maintenance.find({ date: { $gte: month.start, $lte: month.end } });

      const liters = monthFuel.reduce((s, f) => s + f.liters, 0);
      const fuelCost = monthFuel.reduce((s, f) => s + f.cost, 0);
      const maintenanceCost = monthMaintenance.reduce((s, m) => s + m.cost, 0);
      const distance = monthTrips.filter(t => t.status === 'completed').reduce((s, t) => s + t.distance, 0);

      fuelData.push({ month: month.label, liters, efficiency: liters > 0 ? +(distance / liters).toFixed(2) : 0 });
      tripData.push({ month: month.label, total: monthTrips.length, completed: monthTrips.filter(t => t.status === 'completed').length });
      expenseData.push({ month: month.label, fuel: fuelCost, maintenance: maintenanceCost, total: fuelCost + maintenanceCost });
    }

    res.json({ fuelData, tripData, expenseData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/activity — recent activity feed
router.get('/activity', protect, async (req, res) => {
  try {
    const recentTrips = await Trip.find()
      .populate('vehicleId', 'name plate')
      .populate('driverId', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    const recentMaintenance = await Maintenance.find()
      .populate('vehicleId', 'name plate')
      .sort({ updatedAt: -1 })
      .limit(5);

    const activities = [];

    recentTrips.forEach(t => {
      const vehicleName = t.vehicleId?.name || 'Unknown';
      const driverName = t.driverId?.name || 'Unknown';
      activities.push({
        type: 'trip',
        status: t.status,
        message: `Trip ${t.origin} → ${t.destination} (${vehicleName}, ${driverName})`,
        time: t.updatedAt,
      });
    });

    recentMaintenance.forEach(m => {
      const vehicleName = m.vehicleId?.name || 'Unknown';
      activities.push({
        type: 'maintenance',
        status: m.resolved ? 'resolved' : 'pending',
        message: `${m.serviceType.replace(/_/g, ' ')} for ${vehicleName} — $${m.cost}`,
        time: m.updatedAt,
      });
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(activities.slice(0, 15));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
