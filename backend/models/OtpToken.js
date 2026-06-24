import mongoose from 'mongoose';

/**
 * OTP Token Schema
 * Stores one-time passwords for registration, login, and password reset.
 * Auto-expires via TTL index. Used when OTP_ENABLED=true.
 */
const otpTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['registration', 'login', 'password_reset', 'email_verification'],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpToken', otpTokenSchema);
