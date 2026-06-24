/**
 * Hero Slider Routes
 * ------------------
 * Public endpoint for landing page slider.
 * Admin CRUD for managing slides and auto-slide timing.
 */

import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import SystemSettings from '../models/SystemSettings.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/** GET /api/hero — Public: active slides + slide interval */
router.get('/', async (req, res) => {
  try {
    const [slides, settings] = await Promise.all([
      HeroSlide.find({ isActive: true }).sort({ order: 1 }),
      SystemSettings.getSettings(),
    ]);
    res.json({ slides, slideInterval: settings.heroSlideInterval || 5 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** GET /api/hero/admin — Admin: all slides including inactive */
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const [slides, settings] = await Promise.all([
      HeroSlide.find().sort({ order: 1 }),
      SystemSettings.getSettings(),
    ]);
    res.json({ slides, slideInterval: settings.heroSlideInterval || 5 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** POST /api/hero — Admin: create slide */
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, description, image, order, isActive } = req.body;
    if (!title || !description || !image) {
      return res.status(400).json({ message: 'Title, description, and image are required' });
    }
    const slide = await HeroSlide.create({
      title, description, image,
      order: order ?? 0,
      isActive: isActive !== false,
    });
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** PUT /api/hero/settings — Admin: update slide interval */
router.put('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    if (req.body.heroSlideInterval !== undefined) {
      settings.heroSlideInterval = Math.max(2, Number(req.body.heroSlideInterval));
    }
    await settings.save();
    res.json({ slideInterval: settings.heroSlideInterval });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** PUT /api/hero/reorder — Admin: reorder slides */
router.put('/reorder', protect, authorize('admin'), async (req, res) => {
  try {
    const { slideIds } = req.body;
    if (!Array.isArray(slideIds)) return res.status(400).json({ message: 'slideIds array required' });

    await Promise.all(slideIds.map((id, index) =>
      HeroSlide.findByIdAndUpdate(id, { order: index })
    ));

    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** PUT /api/hero/:id — Admin: update slide */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** DELETE /api/hero/:id — Admin: delete slide */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Slide deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
