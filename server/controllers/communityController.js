import CommunityPost from '../models/CommunityPost.js';

// @desc    Get community posts
// @route   GET /api/community
// @access  Private
export const getPosts = async (req, res, next) => {
  try {
    const { q, tags, sortBy = 'recent', page = 1, limit = 10 } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }
    if (tags) {
      filter.tags = { $in: tags.split(',').map((t) => t.trim().toLowerCase()) };
    }

    const sortOptions = {};
    if (sortBy === 'popular') sortOptions.likes = -1;
    else sortOptions.createdAt = -1;

    const parsedLimit = Math.min(parseInt(limit) || 10, 100);
    const skip = (parseInt(page) - 1) * parsedLimit;

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parsedLimit)
        .populate('user', 'firstName lastName avatar')
        .populate('comments.user', 'firstName lastName avatar')
        .populate('trip', 'name')
        .populate('activity', 'name'),
      CommunityPost.countDocuments(filter),
    ]);

    res.json({ success: true, data: { posts, total } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single post
// @route   GET /api/community/:id
// @access  Private
export const getPostById = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('user', 'firstName lastName avatar')
      .populate('trip', 'name startDate endDate')
      .populate('activity', 'name category');

    if (!post) {
      const err = new Error('Post not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: { post } });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a post
// @route   POST /api/community
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const title = req.body.title || (req.body.content ? req.body.content.slice(0, 60) : 'Travel Field Note');
    const post = await CommunityPost.create({
      ...req.body,
      title,
      user: req.user._id,
    });

    const populated = await post.populate('user', 'firstName lastName avatar');
    res.status(201).json({ success: true, data: { post: populated } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a post
// @route   PUT /api/community/:id
// @access  Private
export const updatePost = async (req, res, next) => {
  try {
    let post = await CommunityPost.findById(req.params.id);
    if (!post) {
      const err = new Error('Post not found');
      err.statusCode = 404;
      return next(err);
    }

    if (post.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized');
      err.statusCode = 403;
      return next(err);
    }

    post = await CommunityPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'firstName lastName avatar');

    res.json({ success: true, data: { post } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a post
// @route   DELETE /api/community/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      const err = new Error('Post not found');
      err.statusCode = 404;
      return next(err);
    }

    if (post.user.toString() !== req.user._id.toString()) {
      const err = new Error('Not authorized');
      err.statusCode = 403;
      return next(err);
    }

    await CommunityPost.findByIdAndDelete(post._id);
    res.json({ success: true, data: { message: 'Post deleted' } });
  } catch (err) {
    next(err);
  }
};

// @desc    Like/unlike a post
// @route   POST /api/community/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      const err = new Error('Post not found');
      err.statusCode = 404;
      return next(err);
    }

    const userId = req.user._id;
    const alreadyLiked = post.likedBy.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId.toString());
      post.likes = Math.max(0, (post.likes || 1) - 1);
    } else {
      post.likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
    }

    await post.save();

    const populated = await CommunityPost.findById(post._id)
      .populate('user', 'firstName lastName avatar')
      .populate('comments.user', 'firstName lastName avatar');

    res.json({ 
      success: true, 
      data: { 
        post: populated,
        likes: populated.likes,
        isLiked: !alreadyLiked
      } 
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment / reply to post
// @route   POST /api/community/:id/comment
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      const err = new Error('Post not found');
      err.statusCode = 404;
      return next(err);
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();

    const populated = await CommunityPost.findById(post._id)
      .populate('user', 'firstName lastName avatar')
      .populate('comments.user', 'firstName lastName avatar');

    res.status(201).json({ success: true, data: { post: populated } });
  } catch (err) {
    next(err);
  }
};
