/**
 * Email Service
 * -------------
 * Handles transactional emails: verification, password reset, appointment confirmations.
 * When EMAIL_ENABLED=false (default), emails are logged to console instead.
 *
 * To enable:
 *   1. Set EMAIL_ENABLED=true in .env
 *   2. Add SMTP or SendGrid keys
 *   3. Uncomment the transport setup below
 */

import features from '../config/features.js';

/**
 * Send an email — COMMENTED until API keys are configured.
 * Uncomment nodemailer or SendGrid block when ready.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!features.email.enabled) {
    console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
    if (text) console.log(`[EMAIL DEV] Body: ${text.slice(0, 200)}...`);
    return { sent: false, dev: true };
  }

  // --- NODEMAILER SMTP (uncomment when ready) ---
  // import nodemailer from 'nodemailer';
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: Number(process.env.SMTP_PORT) || 587,
  //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // });
  // await transporter.sendMail({ from: features.email.from, to, subject, html, text });

  // --- SENDGRID (alternative, uncomment when ready) ---
  // import sgMail from '@sendgrid/mail';
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: features.email.from, subject, html, text });

  console.log(`[EMAIL] Sent to ${to}: ${subject}`);
  return { sent: true };
};

export const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Smart Healthcare',
    text: `Hi ${user.name}, verify your email: ${verifyUrl}`,
    html: `<p>Hi ${user.name},</p><p><a href="${verifyUrl}">Click here to verify your email</a></p>`,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Password Reset - Smart Healthcare',
    text: `Hi ${user.name}, reset your password: ${resetUrl}`,
    html: `<p>Hi ${user.name},</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>Link expires in 1 hour.</p>`,
  });
};

export const sendAppointmentConfirmationEmail = async (user, appointment) => {
  return sendEmail({
    to: user.email,
    subject: `Appointment Confirmed - ${appointment.referenceId}`,
    text: `Your appointment ${appointment.referenceId} is confirmed for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}.`,
    html: `<p>Appointment <strong>${appointment.referenceId}</strong> confirmed.</p>`,
  });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendAppointmentConfirmationEmail };
