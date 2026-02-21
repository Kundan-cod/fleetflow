import { Router } from 'express';
import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/maintenance
router.get('/', protect, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    const records = await Maintenance.find(filter)
      .populate('vehicleId', 'name plate')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/maintenance — auto sets vehicle to in_shop
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, serviceType, description, cost, date } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status === 'on_trip') {
      return res.status(400).json({ message: 'Cannot service a vehicle on an active trip' });
    }

    // Set vehicle to in_shop
    vehicle.status = 'in_shop';
    await vehicle.save();

    const record = await Maintenance.create({
      vehicleId,
      serviceType,
      description,
      cost,
      date: date || new Date(),
    });

    const populated = await Maintenance.findById(record._id)
      .populate('vehicleId', 'name plate');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/maintenance/:id/resolve — marks done, returns vehicle to available
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    record.resolved = true;
    await record.save();

    // Check if vehicle has other unresolved maintenance
    const unresolvedCount = await Maintenance.countDocuments({
      vehicleId: record.vehicleId,
      resolved: false,
    });

    if (unresolvedCount === 0) {
      await Vehicle.findByIdAndUpdate(record.vehicleId, { status: 'available' });
    }

    const populated = await Maintenance.findById(record._id)
      .populate('vehicleId', 'name plate');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    await record.deleteOne();
    res.json({ message: 'Maintenance record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
