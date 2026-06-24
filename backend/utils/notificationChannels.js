/**
 * Multi-Channel Notification Orchestrator
 * -----------------------------------------
 * Dispatches notifications across in-app, email, SMS, WhatsApp, and push channels.
 * External channels are placeholders until API keys are configured.
 * In-app notifications always work via notify.js createNotification().
 */

import { createNotification } from './notify.js';
import { sendEmail } from './email.js';
import { sendSms } from './sms.js';
import { sendWhatsApp } from './whatsapp.js';
import { sendPushNotification } from './push.js';
import User from '../models/User.js';
import features from '../config/features.js';

/**
 * Send notification across all enabled channels.
 * @param {Object} opts - { userId, title, message, type, link, emailTemplate, smsText }
 */
export const notifyUser = async ({ userId, title, message, type = 'system', link = '', channels = {} }) => {
  const user = await User.findById(userId);
  if (!user) return;

  // In-app notification (always active)
  await createNotification({ userId, title, message, type, link });

  const prefs = user.notificationPreferences || {};

  // Email channel placeholder
  if (channels.email !== false && prefs.emailAlerts !== false) {
    await sendEmail({
      to: user.email,
      subject: title,
      text: message,
      html: `<p>${message}</p>`,
    });
  }

  // SMS channel placeholder — future: appointment reminders
  if (channels.sms && user.phone) {
    await sendSms(user.phone, `${title}: ${message}`);
  }

  // WhatsApp channel placeholder
  if (channels.whatsapp && user.phone) {
    await sendWhatsApp(user.phone, `${title}: ${message}`);
  }

  // Push notification placeholder
  if (channels.push) {
    await sendPushNotification(userId, { title, body: message, data: { link } });
  }
};

/** Notify patient about appointment booking confirmation */
export const notifyAppointmentBooked = async (patient, appointment) => {
  const dateStr = new Date(appointment.date).toLocaleDateString();
  const msg = `Appointment ${appointment.referenceId} booked for ${dateStr} at ${appointment.time}. Status: ${appointment.status}.`;

  await notifyUser({
    userId: patient._id,
    title: 'Appointment Booked',
    message: msg,
    type: 'appointment',
    link: '/patient/appointments',
    channels: { email: true, sms: true },
  });

  // Future SMS placeholder for appointment confirmation
  // await sendSms(patient.phone, `Smart Healthcare: Your appointment ${appointment.referenceId} is confirmed for ${dateStr}.`);
};

/** Notify about payment status */
export const notifyPaymentStatus = async (userId, payment, appointment) => {
  const statusMessages = {
    completed: `Payment of ${payment.currency} ${payment.amount} received for appointment ${appointment.referenceId}.`,
    failed: `Payment failed for appointment ${appointment.referenceId}.`,
    refunded: `Payment refunded for appointment ${appointment.referenceId}.`,
    cancelled: `Payment cancelled for appointment ${appointment.referenceId}.`,
    pending: `Payment pending for appointment ${appointment.referenceId}.`,
  };
  const statusMsg = statusMessages[payment.status] || `Payment ${payment.status} for appointment ${appointment.referenceId}.`;

  await notifyUser({
    userId,
    title: `Payment ${payment.status}`,
    message: statusMsg,
    type: 'appointment',
    link: '/patient/appointments',
    channels: { email: true },
  });
};

export default { notifyUser, notifyAppointmentBooked, notifyPaymentStatus };
