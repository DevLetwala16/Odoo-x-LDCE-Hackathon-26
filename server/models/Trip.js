import mongoose from 'mongoose';
import crypto from 'crypto';

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed'],
      default: 'planned'
    },
    coverImage: {
      type: String,
      default: ''
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    publicSlug: {
      type: String,
      unique: true,
      sparse: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareSlug: {
      type: String,
      unique: true,
      sparse: true,
    },
    totalBudget: {
      type: Number,
      default: 0,
    },
    stops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
      },
    ],
  },
  { timestamps: true }
);

// Validate endDate > startDate
tripSchema.pre('validate', function (next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Generate a unique share slug
tripSchema.methods.generateShareSlug = function () {
  this.shareSlug = crypto.randomBytes(6).toString('hex');
  this.isPublic = true;
  return this.shareSlug;
};

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
