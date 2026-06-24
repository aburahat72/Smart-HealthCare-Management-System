/**
 * WhatsApp Notification Service — PLACEHOLDER
 * Enable with WHATSAPP_ENABLED=true and Twilio WhatsApp keys in .env
 */

import features from '../config/features.js';

export const sendWhatsApp = async (phone, message) => {
  if (!features.whatsapp.enabled) {
    console.log(`[WHATSAPP DEV] To: ${phone} | ${message}`);
    return { sent: false, dev: true };
  }

  // --- TWILIO WHATSAPP (uncomment when ready) ---
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: message,
  //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  //   to: `whatsapp:${phone}`,
  // });

  return { sent: true };
};

export default { sendWhatsApp };
