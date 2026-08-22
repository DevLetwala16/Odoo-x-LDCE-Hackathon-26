import mongoose from 'mongoose';

const loginDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
  },
  {
    timestamps: true,
    collection: 'Login_data' // Explicit collection name for login records
  }
);

const LoginData = mongoose.model('LoginData', loginDataSchema, 'Login_data');
export default LoginData;
