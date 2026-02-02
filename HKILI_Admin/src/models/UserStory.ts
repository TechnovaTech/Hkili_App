import mongoose from 'mongoose';

const UserStorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  }
});

// Compound index to ensure a user can't save the same story multiple times (optional, but good practice)
// Or we might want to allow multiple "generations" if they have different metadata? 
// For now, unique seems appropriate for a "Library" concept.
UserStorySchema.index({ userId: 1, storyId: 1 }, { unique: true });

export default mongoose.models.UserStory || mongoose.model('UserStory', UserStorySchema);
