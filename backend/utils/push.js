/**
 * Push Notification Service — PLACEHOLDER
 * Enable with PUSH_ENABLED=true and FCM/VAPID keys in .env
 */

import features from '../config/features.js';

export const sendPushNotification = async (userId, { title, body, data = {} }) => {
  if (!features.push.enabled) {
    console.log(`[PUSH DEV] User: ${userId} | ${title}: ${body}`);
    return { sent: false, dev: true };
  }

  // --- FIREBASE FCM (uncomment when ready) ---
  // import admin from 'firebase-admin';
  // await admin.messaging().send({ token: userDeviceToken, notification: { title, body }, data });

  // --- WEB PUSH VAPID (alternative) ---
  // import webpush from 'web-push';
  // webpush.setVapidDetails('mailto:admin@healthcare.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  // await webpush.sendNotification(subscription, JSON.stringify({ title, body, data }));

  return { sent: true };
};

export default { sendPushNotification };
