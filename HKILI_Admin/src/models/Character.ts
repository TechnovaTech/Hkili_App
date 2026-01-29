import mongoose from 'mongoose'

const CharacterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'n/a'],
    default: 'n/a',
  },
  hairColor: {
    type: String,
    default: '#8B4513',
  },
  eyeColor: {
    type: String,
    default: '#8B4513',
  },
  interests: [{
    type: String,
    required: false,
  }],
  customInterests: [{
    type: String,
    required: false,
  }],
  description: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Character || mongoose.model('Character', CharacterSchema)