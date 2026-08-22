import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: true,
      index: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['transport', 'accommodation', 'food', 'activity', 'misc'],
      required: [true, 'Expense category is required'],
    },
    label: {
      type: String,
      required: [true, 'Expense label is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
