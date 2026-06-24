import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Appointment Schema
 * Extended with reference ID, payment status, and status history for tracking.
 */
const appointmentSchema = new mongoose.Schema(
  {
    referenceId: { type: String, unique: true, sparse: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    tokenNumber: { type: Number, default: 0 },
    symptoms: { type: String, default: '' },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'upcoming', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    statusHistory: [{
      status: String,
      note: { type: String, default: '' },
      changedAt: { type: Date, default: Date.now },
    }],
    location: { type: String, default: 'City Hospital, New York' },
    consultationFee: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

/** Generate unique appointment reference ID: APT-YYYYMMDD-XXXX */
appointmentSchema.pre('save', async function (next) {
  if (!this.referenceId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    this.referenceId = `APT-${dateStr}-${random}`;
  }
  if (this.isNew) {
    this.statusHistory = [{ status: this.status, note: 'Appointment booked', changedAt: new Date() }];
  }
  next();
});

appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });

export default mongoose.model('Appointment', appointmentSchema);
