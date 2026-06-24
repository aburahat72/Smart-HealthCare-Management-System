import mongoose from 'mongoose';

/**
 * Hero Slider Slide Schema
 * Managed by admin — displayed on the public landing page hero section.
 * Each slide: image + short title + short description only.
 */
const heroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

heroSlideSchema.index({ order: 1 });

export default mongoose.model('HeroSlide', heroSlideSchema);
