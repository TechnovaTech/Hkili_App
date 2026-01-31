import mongoose from 'mongoose'

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  coins: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema)
