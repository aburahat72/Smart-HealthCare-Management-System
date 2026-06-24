import express from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/notify.js';
import { notifyAppointmentBooked } from '../utils/notificationChannels.js';
import { sendAppointmentConfirmationEmail } from '../utils/email.js';
import features from '../config/features.js';

const router = express.Router();

const activeBookingStatuses = ['pending', 'accepted', 'upcoming'];

const getDayName = (date) =>
  new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

const assignToken = async (doctorId, date, appointmentId = null) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const query = {
    doctorId,
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ['cancelled', 'rejected'] },
  };
  if (appointmentId) query._id = { $ne: appointmentId };

  const count = await Appointment.countDocuments(query);
  return count + 1;
};

router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, date, time, symptoms, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctor.isActive) return res.status(400).json({ message: 'Doctor is not available for booking' });

    if (doctor.availableDays?.length && !doctor.availableDays.includes(getDayName(date))) {
      return res.status(400).json({ message: 'Doctor is not available on the selected day' });
    }
    if (doctor.availableTimes?.length && !doctor.availableTimes.includes(time)) {
      return res.status(400).json({ message: 'Doctor is not available at the selected time' });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const bookedCount = await Appointment.countDocuments({
      doctorId,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $in: activeBookingStatuses },
    });
    const capacity = Math.min(doctor.bookingCapacity || 20, doctor.tokenLimit || doctor.bookingCapacity || 20);
    if (bookedCount >= capacity) {
      return res.status(400).json({ message: 'Booking capacity reached for this doctor on the selected date' });
    }

    const paymentStatus = features.payment.enabled ? 'pending' : 'not_required';
    const tokenNumber = await assignToken(doctorId, date);

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      symptoms: symptoms || '',
      reason: reason || '',
      tokenNumber,
      status: 'pending',
      consultationFee: doctor.consultationFee,
      paymentStatus,
    });

    // Create pending payment record
    const payment = await Payment.create({
      appointmentId: appointment._id,
      patientId: req.user._id,
      amount: doctor.consultationFee,
      currency: features.payment.currency,
      status: paymentStatus === 'not_required' ? 'pending' : 'pending',
      provider: 'manual',
    });
    appointment.paymentId = payment._id;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email profileImage phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email profileImage' } });

    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      await createNotification({
        userId: doctorUser._id,
        title: 'New Appointment Request',
        message: `${req.user.name} requested an appointment on ${new Date(date).toLocaleDateString()} at ${time}`,
        type: 'appointment',
        link: '/doctor/appointments',
      });
    }

    // Multi-channel booking confirmation
    await notifyAppointmentBooked(req.user, appointment);
    await sendAppointmentConfirmationEmail(req.user, appointment);

    res.status(201).json({ ...populated.toObject(), paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { status, search, doctorId, patientId, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.json({ appointments: [], total: 0 });
      query.doctorId = doctor._id;
    }

    if (status && status !== 'all') {
      if (status === 'upcoming') {
        query.status = { $in: ['pending', 'accepted', 'upcoming'] };
      } else {
        query.status = status;
      }
    }

    if (doctorId && req.user.role === 'admin') query.doctorId = doctorId;
    if (patientId && req.user.role === 'admin') query.patientId = patientId;

    let appointments = await Appointment.find(query)
      .populate('patientId', 'name email profileImage phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email profileImage' } })
      .sort({ date: -1, createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.patientId?.name?.toLowerCase().includes(s) ||
          a.doctorId?.userId?.name?.toLowerCase().includes(s) ||
          a.symptoms?.toLowerCase().includes(s)
      );
    }

    const total = appointments.length;
    const start = (page - 1) * limit;
    const paginated = appointments.slice(start, start + Number(limit));

    res.json({ appointments: paginated, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect, async (req, res) => {
  try {
    let query = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
      const all = await Appointment.find(query);
      res.json({
        total: all.length,
        upcoming: all.filter((a) => ['pending', 'accepted', 'upcoming'].includes(a.status)).length,
        completed: all.filter((a) => a.status === 'completed').length,
        cancelled: all.filter((a) => ['cancelled', 'rejected'].includes(a.status)).length,
      });
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.json({ today: 0, upcoming: 0, completed: 0, totalPatients: 0 });
      query.doctorId = doctor._id;
      const all = await Appointment.find(query);
      const todayAppts = all.filter((a) => {
        const d = new Date(a.date);
        return d >= today && d < tomorrow && !['cancelled', 'rejected'].includes(a.status);
      });
      const patientIds = [...new Set(all.map((a) => a.patientId.toString()))];
      res.json({
        today: todayAppts.length,
        upcoming: all.filter((a) => ['pending', 'accepted', 'upcoming'].includes(a.status)).length,
        completed: all.filter((a) => a.status === 'completed').length,
        totalPatients: patientIds.length,
      });
    } else if (req.user.role === 'admin') {
      const [totalDoctors, totalPatients, allAppts] = await Promise.all([
        Doctor.countDocuments(),
        User.countDocuments({ role: 'patient' }),
        Appointment.find(),
      ]);
      const todayAppts = allAppts.filter((a) => {
        const d = new Date(a.date);
        return d >= today && d < tomorrow;
      });
      res.json({
        totalDoctors,
        totalPatients,
        totalAppointments: allAppts.length,
        todayAppointments: todayAppts.length,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email profileImage phone address gender dateOfBirth')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email profileImage' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const { status, date, time, doctorId, tokenNumber, note } = req.body;
    const oldStatus = appointment.status;

    if (req.user.role === 'patient') {
      if (appointment.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (status === 'cancelled') {
        appointment.status = 'cancelled';
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (status === 'completed') {
        if (appointment.status !== 'upcoming') {
          return res.status(400).json({ message: 'Only upcoming appointments can be marked completed by doctor' });
        }
        appointment.status = 'completed';
      }
    } else if (req.user.role === 'admin') {
      if (status) appointment.status = status;
      if (doctorId) appointment.doctorId = doctorId;
      if (date) appointment.date = date;
      if (time) appointment.time = time;
      if (tokenNumber !== undefined) appointment.tokenNumber = Number(tokenNumber) || 0;
    }

    if (req.user.role === 'admin' && (date || doctorId || time || tokenNumber !== undefined)) {
      appointment.tokenNumber = tokenNumber !== undefined
        ? Number(tokenNumber) || 0
        : await assignToken(appointment.doctorId, appointment.date, appointment._id);
    }

    await appointment.save();

    if (status && status !== oldStatus) {
      appointment.statusHistory.push({
        status: appointment.status,
        note: note || `Status changed from ${oldStatus} to ${appointment.status}`,
        changedAt: new Date(),
      });
      await appointment.save();
      const doctor = await Doctor.findById(appointment.doctorId);
      const patient = await User.findById(appointment.patientId);
      const doctorUser = doctor ? await User.findById(doctor.userId) : null;

      const statusMessages = {
        accepted: 'Your appointment has been accepted',
        upcoming: 'Your appointment has been confirmed',
        rejected: 'Your appointment request was rejected',
        completed: 'Your appointment has been marked as completed',
        cancelled: 'An appointment has been cancelled',
      };
      const msg = statusMessages[status] || `Appointment status updated to ${status}`;

      if (req.user.role === 'patient' && doctorUser) {
        await createNotification({
          userId: doctorUser._id,
          title: 'Appointment Cancelled',
          message: `${patient?.name} cancelled their appointment`,
          type: 'appointment',
          link: '/doctor/appointments',
        });
      } else if (patient) {
        const link = patient.role === 'patient' ? '/patient/appointments' : '/doctor/appointments';
        await createNotification({
          userId: patient._id,
          title: 'Appointment Update',
          message: msg,
          type: 'appointment',
          link,
        });
      }
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email profileImage')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email profileImage' } });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tokens/reset', protect, authorize('admin'), async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    if (!doctorId || !date) return res.status(400).json({ message: 'Doctor and date are required' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $nin: ['cancelled', 'rejected'] },
    }).sort({ date: 1, time: 1, createdAt: 1 });

    await Promise.all(appointments.map((appointment, index) => {
      appointment.tokenNumber = index + 1;
      appointment.statusHistory.push({
        status: appointment.status,
        note: 'Token reset by admin',
        changedAt: new Date(),
      });
      return appointment.save();
    }));

    res.json({ message: 'Tokens reset', updated: appointments.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
