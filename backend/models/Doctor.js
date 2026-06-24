import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, default: 0 },
    consultationFee: { type: Number, required: true, default: 0 },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    availableDays: [{ type: String }],
    availableTimes: [{ type: String }],
    tokenLimit: { type: Number, default: 20 },
    bookingCapacity: { type: Number, default: 20 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

export default mongoose.model('Doctor', doctorSchema);
