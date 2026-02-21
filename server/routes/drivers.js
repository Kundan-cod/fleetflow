import { Router } from 'express';
import Driver from '../models/Driver.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/drivers
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const drivers = await Driver.find(filter).sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/drivers/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/drivers
router.post('/', protect, async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/drivers/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (driver.status === 'on_trip') {
      return res.status(400).json({ message: 'Cannot delete driver on an active trip' });
    }
    await driver.deleteOne();
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
