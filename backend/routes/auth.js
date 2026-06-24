/**
 * Authentication Routes
 * ---------------------
 * Handles registration, login, profile, password management,
 * email verification, and OTP flows.
 *
 * OTP & Email features are optional — controlled by config/features.js
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import SystemSettings from '../models/SystemSettings.js';
import { protect } from '../middleware/auth.js';
import { notifyAdmins } from '../utils/notify.js';
import { createOtp, verifyOtp } from '../utils/otp.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import features from '../config/features.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/** POST /api/auth/register — Create new user account */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialization, experience, consultationFee, otp, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // OTP verification when enabled
    if (features.otp.enabled) {
      if (!otp) {
        await createOtp(email, 'registration', phone);
        return res.status(200).json({ requiresOtp: true, message: 'OTP sent. Please verify to complete registration.' });
      }
      const valid = await verifyOtp(email, otp, 'registration');
      if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists with this email' });

    const userRole = role || 'patient';
    const settings = await SystemSettings.getSettings();

    if (userRole === 'patient' && !settings.allowPatientRegistration) {
      return res.status(403).json({ message: 'Patient registration is currently disabled by admin' });
    }
    if (userRole === 'doctor' && !settings.allowDoctorRegistration) {
      return res.status(403).json({ message: 'Doctor registration is currently disabled by admin' });
    }
    if (userRole === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via registration' });
    }

    const user = await User.create({
      name, email, password, role: userRole, phone: phone || '',
      isEmailVerified: !features.email.enabled,
    });

    if (userRole === 'doctor' && specialization) {
      await Doctor.create({
        userId: user._id, specialization,
        experience: experience || 0,
        consultationFee: consultationFee || 50,
      });
    }

    // Send verification email when email service is enabled
    if (features.email.enabled) {
      const verifyToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
      user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.isEmailVerified = false;
      await user.save();
      await sendVerificationEmail(user, verifyToken);
    }

    await notifyAdmins({
      title: 'New Registration',
      message: `${name} registered as ${userRole}`,
      type: 'system',
      link: userRole === 'patient' ? '/admin/patients' : '/admin/doctors',
    });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id),
      emailVerificationRequired: features.email.enabled,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/auth/login — Authenticate user */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, otp } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid credentials for ${role} role` });
    }

    // OTP verification for login when enabled
    if (features.otp.enabled) {
      if (!otp) {
        await createOtp(email, 'login', user.phone);
        return res.status(200).json({ requiresOtp: true, message: 'OTP sent to your registered contact.' });
      }
      const valid = await verifyOtp(email, otp, 'login');
      if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      profileImage: user.profileImage, isEmailVerified: user.isEmailVerified,
      doctorProfile, token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/auth/forgot-password — Request password reset link/OTP */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide email' });

    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    if (features.otp.enabled) {
      await createOtp(email, 'password_reset', user.phone);
      return res.json({ message: 'OTP sent to your registered contact.', requiresOtp: true });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    // In dev mode (email disabled), include token for testing
    const response = { message: 'If an account exists with this email, a reset link has been sent.' };
    if (!features.email.enabled) {
      response.devResetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/auth/reset-password — Reset password with token or OTP */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, otp, email, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user;

    if (features.otp.enabled && otp && email) {
      const valid = await verifyOtp(email, otp, 'password_reset');
      if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP' });
      user = await User.findOne({ email });
    } else if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: new Date() },
      });
    } else {
      return res.status(400).json({ message: 'Please provide reset token or OTP' });
    }

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = newPassword;
    user.resetPasswordToken = '';
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** GET /api/auth/verify-email/:token — Verify email address */
router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

    user.isEmailVerified = true;
    user.emailVerificationToken = '';
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/auth/resend-verification — Resend email verification */
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isEmailVerified) return res.json({ message: 'Email already verified' });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
    user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user, verifyToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/auth/send-otp — Send OTP for any purpose */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose, phone } = req.body;
    if (!email || !purpose) return res.status(400).json({ message: 'Email and purpose required' });

    if (!features.otp.enabled) {
      return res.json({ message: 'OTP verification is not enabled', skipped: true });
    }

    await createOtp(email, purpose, phone);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/auth/verify-otp — Verify OTP */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!features.otp.enabled) return res.json({ verified: true, skipped: true });

    const valid = await verifyOtp(email, otp, purpose);
    if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP' });
    res.json({ verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** GET /api/auth/features — Public feature flags for frontend */
router.get('/features', (req, res) => {
  res.json({
    otpEnabled: features.otp.enabled,
    emailEnabled: features.email.enabled,
    paymentEnabled: features.payment.enabled,
    aiEnabled: features.ai.enabled,
  });
});

router.get('/profile', protect, async (req, res) => {
  try {
    let doctorProfile = null;
    if (req.user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: req.user._id });
    }
    res.json({ ...req.user.toObject(), doctorProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, address, dateOfBirth, gender, profileImage, notificationPreferences } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (profileImage) user.profileImage = profileImage;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences?.toObject?.() || user.notificationPreferences || {},
        ...notificationPreferences,
      };
    }

    await user.save();

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        const { specialization, experience, consultationFee, bio, image } = req.body;
        if (specialization) doctor.specialization = specialization;
        if (experience !== undefined) doctor.experience = experience;
        if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
        if (bio !== undefined) doctor.bio = bio;
        if (image) doctor.image = image;
        await doctor.save();
      }
    }

    const updated = await User.findById(user._id).select('-password');
    let doctorProfile = null;
    if (updated.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: updated._id });
    }

    res.json({ ...updated.toObject(), doctorProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
