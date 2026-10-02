import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  // Shown in the app when the story language is French / Arabic.
  // Left empty, they are auto-translated from `name`.
  nameFr: {
    type: String,
    default: '',
  },
  nameAr: {
    type: String,
    default: '',
  },
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

export default mongoose.models.Category || mongoose.model('Category', CategorySchema)
