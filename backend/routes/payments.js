/**
 * Payment Routes
 * --------------
 * Complete payment module with Razorpay/Stripe placeholders.
 * When PAYMENT_ENABLED=false (default), payments are recorded as pending/manual.
 *
 * To enable Razorpay: PAYMENT_ENABLED=true, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 * To enable Stripe:   PAYMENT_ENABLED=true, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
 */

import express from 'express';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import { protect, authorize } from '../middleware/auth.js';
import { notifyPaymentStatus } from '../utils/notificationChannels.js';
import features from '../config/features.js';

const router = express.Router();

/** POST /api/payments/create-order - Create payment order for appointment */
router.post('/create-order', protect, authorize('patient'), async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let payment = await Payment.findOne({ appointmentId });
    if (!payment) {
      payment = await Payment.create({
        appointmentId,
        patientId: req.user._id,
        amount: appointment.consultationFee,
        currency: features.payment.currency,
        status: 'pending',
        provider: features.payment.enabled ? features.payment.provider : 'manual',
      });
      appointment.paymentId = payment._id;
      appointment.paymentStatus = 'pending';
      await appointment.save();
    }

    if (!features.payment.enabled) {
      return res.json({
        payment,
        paymentEnabled: false,
        message: 'Payment gateway is not configured. Appointment booked with payment pending.',
      });
    }

    // --- RAZORPAY ORDER (uncomment when ready) ---
    // if (features.payment.provider === 'razorpay') {
    //   import Razorpay from 'razorpay';
    //   const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    //   const order = await razorpay.orders.create({
    //     amount: payment.amount * 100, currency: payment.currency, receipt: appointment.referenceId,
    //   });
    //   payment.providerOrderId = order.id;
    //   await payment.save();
    //   return res.json({ payment, orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID });
    // }

    // --- STRIPE PAYMENT INTENT (uncomment when ready) ---
    // if (features.payment.provider === 'stripe') {
    //   import Stripe from 'stripe';
    //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //   const intent = await stripe.paymentIntents.create({
    //     amount: payment.amount * 100, currency: payment.currency.toLowerCase(),
    //     metadata: { appointmentId: appointment._id.toString() },
    //   });
    //   payment.providerOrderId = intent.id;
    //   await payment.save();
    //   return res.json({ payment, clientSecret: intent.client_secret, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
    // }

    res.json({ payment, paymentEnabled: true, message: 'Payment provider not configured' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/payments/verify - Verify payment after gateway callback */
router.post('/verify', protect, authorize('patient'), async (req, res) => {
  try {
    const { paymentId, providerPaymentId, providerSignature } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (!features.payment.enabled) {
      return res.json({ payment, verified: false, message: 'Payment verification skipped - gateway disabled' });
    }

    // --- RAZORPAY VERIFICATION (uncomment when ready) ---
    // import crypto from 'crypto';
    // const body = payment.providerOrderId + '|' + providerPaymentId;
    // const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    // if (expectedSig !== providerSignature) return res.status(400).json({ message: 'Invalid payment signature' });

    // --- STRIPE VERIFICATION (uncomment when ready) ---
    // import Stripe from 'stripe';
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const intent = await stripe.paymentIntents.retrieve(providerPaymentId);
    // if (intent.status !== 'succeeded') return res.status(400).json({ message: 'Payment not completed' });

    payment.status = 'completed';
    payment.providerPaymentId = providerPaymentId || '';
    payment.transactionId = `TXN-${Date.now()}`;
    await payment.save();

    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.paymentStatus = 'completed';
      await appointment.save();
      await notifyPaymentStatus(payment.patientId, payment, appointment);
    }

    res.json({ payment, verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** GET /api/payments/history - Patient transaction history */
router.get('/history', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patientId = req.user._id;

    const payments = await Payment.find(query)
      .populate({ path: 'appointmentId', select: 'referenceId date time status consultationFee' })
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** GET /api/payments/:id - Get payment details */
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'appointmentId', select: 'referenceId date time status consultationFee paymentStatus' })
      .populate('patientId', 'name email phone');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (req.user.role === 'patient' && payment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** PUT /api/payments/:id/status - Admin: manual payment control */
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, note, transactionId } = req.body;
    const allowed = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid payment status' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = status;
    payment.provider = payment.provider || 'manual';
    if (transactionId !== undefined) payment.transactionId = transactionId;
    if (status === 'completed' && !payment.transactionId) payment.transactionId = `MANUAL-${Date.now()}`;
    payment.statusHistory.push({
      status,
      note: note || `Payment marked as ${status} by admin`,
      changedBy: req.user._id,
      changedAt: new Date(),
    });
    await payment.save();

    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.paymentStatus = status;
      await appointment.save();
      await notifyPaymentStatus(payment.patientId, payment, appointment);
    }

    const populated = await Payment.findById(payment._id)
      .populate({ path: 'appointmentId', select: 'referenceId date time status consultationFee paymentStatus' })
      .populate('patientId', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/payments/:id/refund - Refund placeholder */
router.post('/:id/refund', protect, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status !== 'completed') return res.status(400).json({ message: 'Only completed payments can be refunded' });

    // --- RAZORPAY REFUND (uncomment when ready) ---
    // import Razorpay from 'razorpay';
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const refund = await razorpay.payments.refund(payment.providerPaymentId, { amount: payment.amount * 100 });
    // payment.refundId = refund.id;

    // --- STRIPE REFUND (uncomment when ready) ---
    // import Stripe from 'stripe';
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const refund = await stripe.refunds.create({ payment_intent: payment.providerPaymentId });
    // payment.refundId = refund.id;

    payment.status = 'refunded';
    await payment.save();

    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.paymentStatus = 'refunded';
      await appointment.save();
    }

    res.json({ payment, message: 'Refund processed (placeholder - configure gateway for live refunds)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
