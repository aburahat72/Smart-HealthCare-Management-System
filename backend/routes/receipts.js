/**
 * Receipt Routes
 * --------------
 * PDF receipt generation and download for appointments.
 * Available to patients (own appointments) and admins (all).
 */

import express from 'express';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { generateReceiptPdf } from '../utils/pdfReceipt.js';

const router = express.Router();

/** GET /api/receipts/:appointmentId — Download PDF receipt */
router.get('/:appointmentId', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patientId', 'name email phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Authorization: patients can only download own receipts
    if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let payment = null;
    if (appointment.paymentId) {
      payment = await Payment.findById(appointment.paymentId);
    }

    const pdfBuffer = await generateReceiptPdf({
      appointment,
      patient: appointment.patientId,
      doctor: appointment.doctorId,
      payment,
    });

    const filename = `receipt-${appointment.referenceId || appointment._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/receipts/:appointmentId/regenerate — Admin: re-generate receipt */
router.post('/:appointmentId/regenerate', protect, authorize('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patientId', 'name email phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    let payment = appointment.paymentId ? await Payment.findById(appointment.paymentId) : null;

    const pdfBuffer = await generateReceiptPdf({
      appointment, patient: appointment.patientId, doctor: appointment.doctorId, payment,
    });

    const filename = `receipt-${appointment.referenceId || appointment._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
