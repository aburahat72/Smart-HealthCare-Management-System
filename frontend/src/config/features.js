/**
 * Frontend Feature Configuration
 * ------------------------------
 * Mirrors backend config/features.js flags.
 * Loaded from GET /api/auth/features on app startup.
 *
 * To enable features: set env vars on backend (.env) and restart server.
 * See backend/.env.example for all available keys.
 */

const features = {
  /** OTP verification for registration, login, password reset */
  otpEnabled: false,
  /** Email verification and transactional emails */
  emailEnabled: false,
  /** Razorpay / Stripe payment gateway */
  paymentEnabled: false,
  /** OpenAI / Gemini AI assistant */
  aiEnabled: false,
};

/** Fetch feature flags from backend and merge into local config */
export const loadFeatures = async (api) => {
  try {
    const { data } = await api.get('/auth/features');
    Object.assign(features, data);
  } catch {
    // Defaults keep app fully functional without external services
  }
  return features;
};

export default features;
