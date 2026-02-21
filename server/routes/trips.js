import { Router } from 'express';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/trips
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const trips = await Trip.find(filter)
      .populate('vehicleId', 'name plate type capacity')
      .populate('driverId', 'name phone licenseType')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/trips — Dispatch with full validation
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, driverId, cargoWeight, origin, destination, cargoDescription, distance, notes } = req.body;

    // Fetch vehicle and driver
    const vehicle = await Vehicle.findById(vehicleId);
    const driver = await Driver.findById(driverId);

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    // Validation engine
    const errors = [];

    if (vehicle.status !== 'available') {
      errors.push(`Vehicle "${vehicle.name}" is not available (current: ${vehicle.status})`);
    }
    if (driver.status !== 'on_duty') {
      errors.push(`Driver "${driver.name}" is not on duty (current: ${driver.status})`);
    }
    if (new Date() > driver.expiryDate) {
      errors.push(`Driver "${driver.name}" has an expired license`);
    }
    if (cargoWeight > vehicle.capacity) {
      errors.push(`Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`);
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Dispatch validation failed', errors });
    }

    // Create trip
    const trip = await Trip.create({
      vehicleId,
      driverId,
      cargoWeight,
      cargoDescription,
      origin,
      destination,
      distance,
      notes,
      status: 'dispatched',
      startOdometer: vehicle.odometer,
      dispatchedAt: new Date(),
    });

    // Update vehicle and driver status
    vehicle.status = 'on_trip';
    driver.status = 'on_trip';
    driver.totalTrips += 1;
    await vehicle.save();
    await driver.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'name plate type capacity')
      .populate('driverId', 'name phone licenseType');

    req.io.emit('trip_update', { type: 'new_trip', trip: populatedTrip });
    req.io.emit('notification', {
      message: `New trip dispatched: ${origin} → ${destination}`,
      type: 'trip',
      time: new Date()
    });

    res.status(201).json(populatedTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/trips/:id/complete
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const { endOdometer } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'dispatched' && trip.status !== 'in_transit') {
      return res.status(400).json({ message: 'Trip cannot be completed from current status' });
    }

    trip.status = 'completed';
    trip.endOdometer = endOdometer || trip.startOdometer;
    trip.completedAt = new Date();
    trip.distance = trip.endOdometer - trip.startOdometer;
    await trip.save();

    // Reset vehicle and driver
    const vehicle = await Vehicle.findById(trip.vehicleId);
    const driver = await Driver.findById(trip.driverId);
    if (vehicle) {
      vehicle.status = 'available';
      vehicle.odometer = trip.endOdometer;
      await vehicle.save();
    }
    if (driver) {
      driver.status = 'on_duty';
      await driver.save();
    }

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'name plate type capacity')
      .populate('driverId', 'name phone licenseType');

    req.io.emit('trip_update', { type: 'trip_completed', trip: populatedTrip });
    req.io.emit('notification', {
      message: `Trip completed: ${trip.origin} → ${trip.destination}`,
      type: 'success',
      time: new Date()
    });

    res.json(populatedTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/trips/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status === 'completed' || trip.status === 'cancelled') {
      return res.status(400).json({ message: 'Trip already finalized' });
    }

    trip.status = 'cancelled';
    await trip.save();

    // Reset vehicle and driver
    const vehicle = await Vehicle.findById(trip.vehicleId);
    const driver = await Driver.findById(trip.driverId);
    if (vehicle && vehicle.status === 'on_trip') {
      vehicle.status = 'available';
      await vehicle.save();
    }
    if (driver && driver.status === 'on_trip') {
      driver.status = 'on_duty';
      await driver.save();
    }

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'name plate type capacity')
      .populate('driverId', 'name phone licenseType');

    req.io.emit('trip_update', { type: 'trip_cancelled', trip: populatedTrip });
    req.io.emit('notification', {
      message: `Trip cancelled: ${trip.origin} → ${trip.destination}`,
      type: 'danger',
      time: new Date()
    });

    res.json(populatedTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status === 'dispatched' || trip.status === 'in_transit') {
      return res.status(400).json({ message: 'Cancel the trip before deleting' });
    }
    await trip.deleteOne();
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
