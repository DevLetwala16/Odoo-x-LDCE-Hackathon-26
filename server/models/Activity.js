import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'sightseeing',
        'food',
        'adventure',
        'culture',
        'shopping',
        'nightlife',
        'relaxation',
        'transport',
        'other',
      ],
      required: [true, 'Category is required'],
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 60, // in minutes
    },
    imageUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    isGlobal: {
      type: Boolean,
      default: true, // true = seed data, false = user-created
    },
  },
  { timestamps: true }
);

// Text index for search
activitySchema.index({ name: 'text', description: 'text' });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
