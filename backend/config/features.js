import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

/**
 * Central Feature Configuration
 * --------------------------------
 * Toggle third-party integrations by setting env vars and flipping `enabled` flags.
 * The app remains fully functional when all features are disabled (default).
 *
 * To enable a feature:
 *   1. Set the corresponding *_ENABLED=true in .env
 *   2. Add the required API keys to .env (see comments below)
 *   3. Uncomment integration code in the relevant util files
 */

const features = {
  /**
   * OTP Verification (Registration, Login, Password Reset)
   * Env: OTP_ENABLED=true
   * Keys: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
   *   OR: MSG91_AUTH_KEY, MSG91_SENDER_ID
  */
  otp: {
    enabled: process.env.OTP_ENABLED === 'true',
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
    length: 6,
  },

  /**
   * Email (Verification, Password Reset, Notifications)
   * Env: EMAIL_ENABLED=true
   * Keys: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
   *   OR: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL
   */
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    from: process.env.EMAIL_FROM || 'aburahat72@gmail.com',
  },

  /**
   * SMS Notifications
   * Env: SMS_ENABLED=true
   * Keys: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
   */
  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
  },

  /**
   * WhatsApp Notifications
   * Env: WHATSAPP_ENABLED=true
   * Keys: TWILIO_WHATSAPP_NUMBER, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
   */
  whatsapp: {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
  },

  /**
   * Push Notifications
   * Env: PUSH_ENABLED=true
   * Keys: FCM_SERVER_KEY or VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
   */
  push: {
    enabled: process.env.PUSH_ENABLED === 'true',
  },

  /**
   * Payment Gateway
   * Env: PAYMENT_ENABLED=true
   * Keys (Razorpay): RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
   * Keys (Stripe): STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
   */
  payment: {
    enabled: process.env.PAYMENT_ENABLED === 'true',
    provider: process.env.PAYMENT_PROVIDER || 'razorpay', // 'razorpay' | 'stripe'
    currency: process.env.PAYMENT_CURRENCY || 'INR',
  },

  /**
   * AI Assistant
   * Env: AI_ENABLED=true
   * Keys (OpenAI): OPENAI_API_KEY
   * Keys (Gemini): GEMINI_API_KEY
   */
  ai: {
    enabled: process.env.AI_ENABLED === 'true',
    provider: process.env.AI_PROVIDER || 'openai', // 'openai' | 'gemini'
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },

  /** Hospital info used in receipts and notifications */
  hospital: {
    name: process.env.HOSPITAL_NAME || 'Smart Healthcare Clinic',
    address: process.env.HOSPITAL_ADDRESS || 'Hailakandi-City-788151',
    phone: process.env.HOSPITAL_PHONE || '+91-8134033185',
    email: process.env.HOSPITAL_EMAIL || 'aburahat72@gmail.com',
    registrationNumber: process.env.HOSPITAL_REG_NUMBER || 'REG-2024-HC-001',
    gstNumber: process.env.HOSPITAL_GST_NUMBER || '', // Future: GST/Tax placeholder
  },
};
export default features;
