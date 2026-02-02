import mongoose from 'mongoose'

const StoryCharacterSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
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
  hairStyle: {
    type: String,
    default: 'Short',
  },
  skinColor: {
    type: String,
    default: '#FDBCB4',
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
  image: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.StoryCharacter || mongoose.model('StoryCharacter', StoryCharacterSchema)
