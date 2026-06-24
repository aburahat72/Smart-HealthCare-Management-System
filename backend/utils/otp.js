/**
 * OTP Service
 * -----------
 * Generates and verifies OTPs for registration, login, and password reset.
 * When OTP_ENABLED=false (default), all functions no-op and return success.
 *
 * To enable:
 *   1. Set OTP_ENABLED=true in .env
 *   2. Add SMS provider keys (Twilio or MSG91)
 *   3. Uncomment the sendOtpSms() block below
 */

import crypto from 'crypto';
import OtpToken from '../models/OtpToken.js';
import features from '../config/features.js';

/** Generate a numeric OTP of configured length */
export const generateOtp = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < features.otp.length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
};

/**
 * Send OTP via SMS — COMMENTED until API keys are configured.
 * Uncomment and install twilio: npm install twilio
 */
const sendOtpSms = async (phone, otp, purpose) => {
  // --- TWILIO SMS INTEGRATION (uncomment when ready) ---
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: `Your Smart Healthcare OTP for ${purpose}: ${otp}. Valid for ${features.otp.expiryMinutes} minutes.`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phone,
  // });
  // return true;

  // --- MSG91 INTEGRATION (alternative, uncomment when ready) ---
  // const response = await fetch('https://api.msg91.com/api/v5/otp', {
  //   method: 'POST',
  //   headers: { 'authkey': process.env.MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ template_id: process.env.MSG91_TEMPLATE_ID, mobile: phone, otp }),
  // });

  console.log(`[OTP DEV] ${purpose} OTP for ${phone || 'email-only'}: ${otp}`);
  return true;
};

/** Create and optionally send an OTP */
export const createOtp = async (email, purpose, phone = '') => {
  if (!features.otp.enabled) return { skipped: true };

  await OtpToken.deleteMany({ email, purpose, verified: false });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + features.otp.expiryMinutes * 60 * 1000);

  await OtpToken.create({ email, otp, purpose, expiresAt });

  if (phone) await sendOtpSms(phone, otp, purpose);

  return { sent: true, expiresAt };
};

/** Verify an OTP — returns true if valid or OTP is disabled */
export const verifyOtp = async (email, otp, purpose) => {
  if (!features.otp.enabled) return true;

  const token = await OtpToken.findOne({
    email: email.toLowerCase(),
    otp,
    purpose,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!token) return false;

  token.verified = true;
  await token.save();
  return true;
};

export default { generateOtp, createOtp, verifyOtp };
