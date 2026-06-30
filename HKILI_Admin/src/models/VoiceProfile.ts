import mongoose from 'mongoose'

// A cloned voice that belongs to a user. The actual voice lives in the
// third-party provider (ElevenLabs / Fish / Replicate); we only store a
// reference (providerVoiceId) plus metadata so the app can list and reuse it.
const VoiceProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true, // e.g. 'elevenlabs'
  },
  providerVoiceId: {
    type: String,
    required: true, // the id returned by the provider after cloning
  },
  sampleUrl: {
    type: String,
    required: false, // Cloudinary URL of the recorded voice sample
  },
  language: {
    type: String,
    enum: ['EN', 'FR', 'AR'],
    default: 'EN',
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'ready',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.VoiceProfile ||
  mongoose.model('VoiceProfile', VoiceProfileSchema)
