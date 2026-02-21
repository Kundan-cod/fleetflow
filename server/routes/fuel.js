import { Router } from 'express';
import FuelLog from '../models/FuelLog.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/fuel
router.get('/', protect, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    const logs = await FuelLog.find(filter)
      .populate('vehicleId', 'name plate')
      .populate('tripId', 'origin destination distance')
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/fuel
router.post('/', protect, async (req, res) => {
  try {
    const log = await FuelLog.create(req.body);
    const populated = await FuelLog.findById(log._id)
      .populate('vehicleId', 'name plate')
      .populate('tripId', 'origin destination distance');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/fuel/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Fuel log not found' });
    await log.deleteOne();
    res.json({ message: 'Fuel log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
