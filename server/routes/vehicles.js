import { Router } from 'express';
import Vehicle from '../models/Vehicle.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/vehicles
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/vehicles/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/vehicles
router.post('/', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License plate already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License plate already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status === 'on_trip') {
      return res.status(400).json({ message: 'Cannot delete vehicle on an active trip' });
    }
    await vehicle.deleteOne();
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
