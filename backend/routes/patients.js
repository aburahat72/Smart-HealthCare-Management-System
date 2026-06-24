import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = { role: 'patient' };

    let patients = await User.find(query).select('-password').sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      patients = patients.filter(
        (p) => p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s)
      );
    }

    const total = patients.length;
    const start = (page - 1) * limit;
    const paginated = patients.slice(start, start + Number(limit));

    res.json({ patients: paginated, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
