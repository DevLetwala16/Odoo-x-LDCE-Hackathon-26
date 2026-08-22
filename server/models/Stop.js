import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
    },
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required'],
    },
    order: {
      type: Number,
      required: true,
    },
    sectionBudget: {
      type: Number,
      default: 0,
    },
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Validate departureDate > arrivalDate
stopSchema.pre('validate', function (next) {
  if (this.departureDate && this.arrivalDate && this.departureDate < this.arrivalDate) {
    this.invalidate('departureDate', 'Departure date must be after arrival date');
  }
  next();
});

const Stop = mongoose.model('Stop', stopSchema);
export default Stop;
