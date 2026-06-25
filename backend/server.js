import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import medicalRecordRoutes from './routes/medicalRecords.js';
import aiRoutes from './routes/ai.js';
import patientRoutes from './routes/patients.js';
// i have turn off this upload routes because vercel does not allow to upload file to server using admin panel it have tested in locally it works fine
// import uploadRoutes from './routes/upload.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import heroRoutes from './routes/hero.js';
import paymentRoutes from './routes/payments.js';
import receiptRoutes from './routes/receipts.js';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import HeroSlide from './models/HeroSlide.js';
import SystemSettings from './models/SystemSettings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Smart Healthcare API is running' }));

const seedData = async () => {
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    await User.create({
      name: 'Admin User',
      email: 'admin@healthcare.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin seeded: admin@healthcare.com / admin123');
    // console.log('Admin seeded: admin@healthcare.com / admin123');
  }

  const doctorCount = await Doctor.countDocuments();
  if (doctorCount === 0) {
    const doctors = [
      { name: 'Dr. Sarah Johnson', email: 'sarah@healthcare.com', specialization: 'Neurologist', experience: 10, fee: 500 },
    ];

    for (const d of doctors) {
      const user = await User.create({ name: d.name, email: d.email, password: 'doctor123', role: 'doctor' });
      await Doctor.create({
        userId: user._id,
        specialization: d.specialization,
        experience: d.experience,
        consultationFee: d.fee,
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 200) + 50,
      });
    }
    console.log('Sample doctors seeded');
  }

  // Seed default hero slides if none exist
  const slideCount = await HeroSlide.countDocuments();
  if (slideCount === 0) {
    await HeroSlide.insertMany([
      {
        title: 'Your Health, Our Priority',
        description: 'Trusted healthcare services for you and your family.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop&crop=face',
        order: 0,
      },
      {
        title: 'Expert Medical Care',
        description: 'Connect with experienced doctors anytime.',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=700&fit=crop&crop=face',
        order: 1,
      },
      // {
      //   title: 'Easy Appointment Booking',
      //   description: 'Book appointments quickly and securely.',
      //   image: 'https://images.unsplash.com/photo-1622253692010-333f708ca8ad?w=600&h=700&fit=crop&crop=face',
      //   order: 2,
      // },
    ]);
    console.log('Default hero slides seeded');
  }

  await SystemSettings.getSettings();
};

let appReadyPromise = null;

const prepareApp = async () => {
  if (!appReadyPromise) {
    appReadyPromise = connectDB().then(seedData);
  }
  return appReadyPromise;
};

app.use('/api', async (req, res, next) => {
  try {
    await prepareApp();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server initialization failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/patients', patientRoutes);
// app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await prepareApp();

  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing server or set a different PORT.`);
    } else {
      console.error(`Server startup error: ${error.message}`);
    }
    process.exit(1);
  });
};

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  });
}

export default app;
