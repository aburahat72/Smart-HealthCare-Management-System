/**
 * In-App Notification Utility
 * ---------------------------
 * Creates notifications stored in MongoDB (polled every 30s by frontend).
 * For multi-channel delivery (email, SMS, WhatsApp, push), use notificationChannels.js
 */
import User from '../models/User.js';

export const createNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const prefs = user.notificationPreferences || {};
    if (type === 'appointment' && prefs.appointmentAlerts === false) return null;
    if (type === 'system' && prefs.systemAlerts === false) return null;

    return await Notification.create({ userId, title, message, type, link });
  } catch (error) {
    console.error('Notification error:', error.message);
    return null;
  }
};

export const notifyAdmins = async ({ title, message, type = 'system', link = '' }) => {
  const admins = await User.find({ role: 'admin' });
  await Promise.all(admins.map((admin) => createNotification({ userId: admin._id, title, message, type, link })));
};
