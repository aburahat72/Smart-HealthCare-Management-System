/**
 * SMS Notification Service — PLACEHOLDER
 * Enable with SMS_ENABLED=true and Twilio/MSG91 keys in .env
 */

import features from '../config/features.js';

export const sendSms = async (phone, message) => {
  if (!features.sms.enabled) {
    console.log(`[SMS DEV] To: ${phone} | ${message}`);
    return { sent: false, dev: true };
  }

  // --- TWILIO SMS (uncomment when ready) ---
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });

  return { sent: true };
};

export default { sendSms };
