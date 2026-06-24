import mongoose from 'mongoose';

/**
 * Payment Transaction Schema
 * Linked to appointments. Supports Razorpay/Stripe when PAYMENT_ENABLED=true.
 *
 * Status flow: pending -> completed | failed | refunded | cancelled
 */
const paymentSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    provider: { type: String, enum: ['razorpay', 'stripe', 'manual'], default: 'manual' },
    transactionId: { type: String, default: '' },
    providerOrderId: { type: String, default: '' },
    providerPaymentId: { type: String, default: '' },
    refundId: { type: String, default: '' }, // Future: refund tracking placeholder
    statusHistory: [{
      status: String,
      note: { type: String, default: '' },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      changedAt: { type: Date, default: Date.now },
    }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
