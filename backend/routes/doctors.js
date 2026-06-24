import express from 'express';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, specialization, page = 1, limit = 8 } = req.query;
    const query = { isActive: true };

    if (specialization && specialization !== 'all') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(query).populate('userId', 'name email profileImage phone');

    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.userId?.name?.toLowerCase().includes(searchLower) ||
          d.specialization?.toLowerCase().includes(searchLower)
      );
    }

    const total = doctors.length;
    const start = (page - 1) * limit;
    const paginated = doctors.slice(start, start + Number(limit));

    res.json({
      doctors: paginated,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate('userId', 'name email profileImage')
      .sort({ rating: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/specializations', async (req, res) => {
  try {
    const specs = await Doctor.distinct('specialization');
    res.json(specs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, specialization } = req.query;
    const query = {};

    if (specialization && specialization !== 'all') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(query).populate('userId', 'name email profileImage phone');

    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.userId?.name?.toLowerCase().includes(searchLower) ||
          d.specialization?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ doctors, total: doctors.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email profileImage phone address');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name, email, password, specialization, experience, consultationFee, image, bio,
      availableDays, availableTimes, tokenLimit, bookingCapacity, isActive,
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({
      name, email, password: password || 'doctor123', role: 'doctor',
      profileImage: image || '',
    });
    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      experience: experience || 0,
      consultationFee: consultationFee || 50,
      image: image || '',
      bio: bio || '',
      availableDays: availableDays || [],
      availableTimes: availableTimes || [],
      tokenLimit: tokenLimit || 20,
      bookingCapacity: bookingCapacity || 20,
      isActive: isActive !== false,
    });

    const populated = await Doctor.findById(doctor._id).populate('userId', 'name email profileImage');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (req.user.role === 'doctor' && doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      specialization, experience, consultationFee, image, bio, isActive,
      availableDays, availableTimes, tokenLimit, bookingCapacity,
    } = req.body;
    if (specialization) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (image) {
      doctor.image = image;
      await User.findByIdAndUpdate(doctor.userId, { profileImage: image });
    }
    if (bio !== undefined) doctor.bio = bio;
    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (availableTimes !== undefined) doctor.availableTimes = availableTimes;
    if (tokenLimit !== undefined) doctor.tokenLimit = Number(tokenLimit) || 0;
    if (bookingCapacity !== undefined) doctor.bookingCapacity = Number(bookingCapacity) || 0;
    if (isActive !== undefined && req.user.role === 'admin') doctor.isActive = isActive;

    if (req.body.name) {
      await User.findByIdAndUpdate(doctor.userId, { name: req.body.name });
    }

    await doctor.save();
    const populated = await Doctor.findById(doctor._id).populate('userId', 'name email profileImage');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(doctor._id);
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
