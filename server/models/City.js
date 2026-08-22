import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
    region: {
      type: String,
      default: '',
    },
    costIndex: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search
citySchema.index({ name: 'text', country: 'text', region: 'text' });

const City = mongoose.model('City', citySchema);
export default City;
