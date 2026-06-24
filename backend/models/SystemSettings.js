import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'system', unique: true },
    allowPatientRegistration: { type: Boolean, default: true },
    allowDoctorRegistration: { type: Boolean, default: true },
    /** Hero slider auto-advance interval in seconds */
    heroSlideInterval: { type: Number, default: 5 },
  },
  { timestamps: true }
);

systemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'system' });
  if (!settings) {
    settings = await this.create({ key: 'system' });
  }
  return settings;
};

export default mongoose.model('SystemSettings', systemSettingsSchema);
