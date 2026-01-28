import mongoose from 'mongoose'

const CharacterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 18,
  },
  interests: [{
    type: String,
    required: true,
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