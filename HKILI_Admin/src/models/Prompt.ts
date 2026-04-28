import mongoose from 'mongoose';

const PromptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  template: { type: String, required: true },
  systemMessage: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Prompt || mongoose.model('Prompt', PromptSchema);
