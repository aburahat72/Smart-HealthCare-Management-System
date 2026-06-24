import express from 'express';
import SystemSettings from '../models/SystemSettings.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    res.json({
      allowPatientRegistration: settings.allowPatientRegistration,
      allowDoctorRegistration: settings.allowDoctorRegistration,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    const { allowPatientRegistration, allowDoctorRegistration } = req.body;

    if (allowPatientRegistration !== undefined) {
      settings.allowPatientRegistration = allowPatientRegistration;
    }
    if (allowDoctorRegistration !== undefined) {
      settings.allowDoctorRegistration = allowDoctorRegistration;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
