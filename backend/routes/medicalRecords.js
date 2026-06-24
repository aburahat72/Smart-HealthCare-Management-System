import express from 'express';
import MedicalRecord from '../models/MedicalRecord.js';
import { protect, authorize } from '../middleware/auth.js';
import Doctor from '../models/Doctor.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const { patientId } = req.query;
      if (!patientId) return res.status(400).json({ message: 'Patient ID required' });
      query.patientId = patientId;
    } else if (req.user.role === 'admin') {
      if (req.query.patientId) query.patientId = req.query.patientId;
    }

    const records = await MedicalRecord.find(query)
      .populate('patientId', 'name email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { patientId, title, description, fileUrl, fileName, recordType } = req.body;
    let doctorId = null;

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      doctorId = doctor?._id;
    }

    const record = await MedicalRecord.create({
      patientId,
      doctorId,
      title,
      description,
      fileUrl,
      fileName,
      recordType,
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
