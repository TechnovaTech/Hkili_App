import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  signupBonusCoins: {
    type: Number,
    default: 0
  },
  storyCost: {
    type: Number,
    default: 10
  },
  languages: {
    EN: { type: Boolean, default: true },
    FR: { type: Boolean, default: true },
    AR: { type: Boolean, default: true }
  },
  maxStoryLength: {
    type: Number,
    default: 1000
  },
  storyModes: {
    adventure: { type: Boolean, default: true },
    educational: { type: Boolean, default: true },
    bedtime: { type: Boolean, default: true },
    interactive: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Prevent overwrite of existing model
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

export default Setting;
