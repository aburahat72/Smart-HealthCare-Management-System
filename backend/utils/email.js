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
import nodemailer from 'nodemailer';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatAppointmentDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: features.payment.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getDoctorDetails = (appointment) => {
  const doctor = appointment?.doctorId || {};
  const doctorUser = doctor.userId || {};

  return {
    name: doctorUser.name || doctor.name || 'Your doctor',
    specialization: doctor.specialization || 'Consultation',
  };
};

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
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({ from: features.email.from, to, subject, html, text });

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
  const doctor = getDoctorDetails(appointment);
  const appointmentDate = formatAppointmentDate(appointment.date);
  const appointmentRef = appointment.referenceId || appointment._id;
  const patientName = user.name || 'Patient';
  const location = appointment.location || 'City Hospital';
  const tokenNumber = appointment.tokenNumber ? `Token #${appointment.tokenNumber}` : 'Assigned at reception';
  const fee = formatCurrency(appointment.consultationFee);
  const dashboardUrl = `${process.env.CLIENT_URL || ''}/patient/appointments`;

  return sendEmail({
    to: user.email,
    subject: `Appointment Booking Confirmed - ${appointmentRef}`,
    text: [
      `Hi ${patientName},`,
      '',
      `Your appointment booking has been confirmed.`,
      `Appointment ID: ${appointmentRef}`,
      `Doctor: Dr. ${doctor.name} (${doctor.specialization})`,
      `Date: ${appointmentDate}`,
      `Time: ${appointment.time}`,
      `Token: ${tokenNumber}`,
      `Location: ${location}`,
      `Consultation Fee: ${fee}`,
      '',
      'Please arrive 10 minutes early and bring any relevant medical records.',
      'Thank you for choosing Smart Healthcare.',
    ].join('\n'),
    html: `
      <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr>
                  <td style="background:#0f766e;padding:28px 32px;color:#ffffff;">
                    <div style="font-size:14px;letter-spacing:.04em;text-transform:uppercase;opacity:.9;">Smart Healthcare</div>
                    <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;font-weight:700;">Your appointment is booked</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 32px;">
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(patientName)},</p>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Thank you for booking with Smart Healthcare. Your appointment has been successfully recorded. Please find your appointment details below.</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Appointment ID</td>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(appointmentRef)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Doctor</td>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:right;">Dr. ${escapeHtml(doctor.name)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Department</td>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(doctor.specialization)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Date</td>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(appointmentDate)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Time</td>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(appointment.time)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Token</td>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(tokenNumber)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:14px;">Location</td>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(location)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;color:#6b7280;font-size:14px;">Consultation Fee</td>
                        <td style="padding:14px 18px;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(fee)}</td>
                      </tr>
                    </table>

                    <div style="margin:24px 0;padding:16px 18px;background:#ecfeff;border-left:4px solid #0f766e;border-radius:8px;font-size:14px;line-height:1.6;color:#164e63;">
                      Please arrive 10 minutes before your scheduled time and bring any relevant medical records or previous prescriptions.
                    </div>

                    ${dashboardUrl.startsWith('http') ? `
                      <p style="margin:28px 0;">
                        <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:700;">View My Appointments</a>
                      </p>
                    ` : ''}

                    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">If you need to reschedule or cancel, please visit your appointments page or contact the hospital support desk.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.6;">
                    This is an automated confirmation from Smart Healthcare. Please keep this email for your records.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendAppointmentConfirmationEmail };
