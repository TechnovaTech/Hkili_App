import mongoose from 'mongoose'

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  storyCharacterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoryCharacter',
    required: false,
  },
  characters: [{
    name: String,
    description: String,
  }],
  genre: {
    type: String,
    default: 'general',
  },
  language: {
    type: String,
    enum: ['EN', 'FR', 'AR'],
    default: 'EN',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Story || mongoose.model('Story', StorySchema)