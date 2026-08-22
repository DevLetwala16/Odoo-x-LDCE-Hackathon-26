import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      default: null,
    },
    title: {
      type: String,
      trim: true,
      default: function () {
        return this.content ? this.content.slice(0, 50) : 'Travel Note';
      },
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    images: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Text index for search
communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
export default CommunityPost;
