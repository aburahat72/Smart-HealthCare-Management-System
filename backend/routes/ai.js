/**
 * AI Routes
 * ---------
 * Chat assistant with fallback responses and symptom analysis.
 * External AI (OpenAI/Gemini) integration is disabled by default.
 */

import express from 'express';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { protect, authorize } from '../middleware/auth.js';
import { processChatMessage, analyzeSymptoms } from '../utils/aiService.js';

const router = express.Router();

/** POST /api/ai/chat — General AI assistant chat */
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Please enter a message' });

    const { response, source } = await processChatMessage(message, history);
    res.json({ response, source });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/ai/symptoms — Symptom analysis with doctor recommendations */
router.post('/symptoms', protect, async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ message: 'Please describe your symptoms' });

    const analysis = analyzeSymptoms(symptoms);

    const doctors = await Doctor.find({
      specialization: { $regex: analysis.primaryDepartment.split(' ')[0], $options: 'i' },
      isActive: true,
    })
      .populate('userId', 'name profileImage')
      .limit(3);

    const recommendedDoctors = doctors.length > 0
      ? doctors
      : await Doctor.find({ isActive: true }).populate('userId', 'name profileImage').limit(3);

    res.json({
      symptoms,
      primaryDepartment: analysis.primaryDepartment,
      otherDepartments: ['General Physician', 'Internal Medicine'],
      recommendedDoctors,
      message: analysis.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/reports', protect, authorize('admin'), async (req, res) => {
  try {
    const [doctors, patients, appointments] = await Promise.all([
      Doctor.find().populate('userId', 'name'),
      User.find({ role: 'patient' }),
      Appointment.find(),
    ]);

    const statusBreakdown = appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const specializationBreakdown = doctors.reduce((acc, d) => {
      acc[d.specialization] = (acc[d.specialization] || 0) + 1;
      return acc;
    }, {});

    const monthlyAppointments = {};
    appointments.forEach((a) => {
      const month = new Date(a.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyAppointments[month] = (monthlyAppointments[month] || 0) + 1;
    });

    res.json({
      appointmentStats: { total: appointments.length, byStatus: statusBreakdown, monthly: monthlyAppointments },
      doctorStats: { total: doctors.length, bySpecialization: specializationBreakdown },
      patientStats: { total: patients.length },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
