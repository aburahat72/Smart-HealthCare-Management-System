import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    profileImage: { type: String, default: '' },
    notificationPreferences: {
      appointmentAlerts: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: true },
    },
    // Email verification — auto-verified when EMAIL_ENABLED=false
    isEmailVerified: { type: Boolean, default: true },
    emailVerificationToken: { type: String, default: '' },
    emailVerificationExpire: { type: Date },
    // Password reset tokens
    resetPasswordToken: { type: String, default: '' },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
