import mongoose from 'mongoose'
import { MUSIC_MOODS } from '../lib/musicMoods'

// Background-music library managed in Admin → Music. Tracks are matched to
// stories automatically (see lib/backgroundMusic.ts).
const BackgroundMusicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  moods: [{
    type: String,
    enum: [...MUSIC_MOODS],
  }],
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.BackgroundMusic || mongoose.model('BackgroundMusic', BackgroundMusicSchema)
