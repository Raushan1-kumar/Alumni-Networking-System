const Post = require("../models/Post");

// ─────────────────────────────────────────────────────────────
// POST /api/posts
// Private — any alumni can create a post
// ─────────────────────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { content, image, tags } = req.body;

    const post = await Post.create({
      author: req.user._id,
      content,
      image,
      tags,
    });

    // Populate author info before sending response
    await post.populate("author", "name profilePhoto currentRole");

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/posts
// Private — get all posts (feed), newest first
// Supports filter by tag
// ─────────────────────────────────────────────────────────────
const getAllPosts = async (req, res) => {
  try {
    const { tag } = req.query;

    const filter = {};

    if (tag) {
      filter.tags = { $in: [tag] }; // posts that contain this tag
    }

    const posts = await Post.find(filter)
      .populate("author", "name profilePhoto currentRole department")
      .populate("comments.user", "name profilePhoto")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/posts/:id
// Private — get a single post with all comments
// ─────────────────────────────────────────────────────────────
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profilePhoto currentRole")
      .populate("comments.user", "name profilePhoto");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/posts/:id
// Private — only the author can edit their post
// ─────────────────────────────────────────────────────────────
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const { content, image, tags } = req.body;

    if (content) post.content = content;
    if (image) post.image = image;
    if (tags) post.tags = tags;

    await post.save();

    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/posts/:id
// Private — author or admin can delete
// ─────────────────────────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/posts/:id/like
// Private — toggle like on a post (like/unlike same route)
// ─────────────────────────────────────────────────────────────
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike — remove user from likes array
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Like — add user to likes array
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      totalLikes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/posts/:id/comments
// Private — add a comment to a post
// ─────────────────────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: req.user._id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate and return the new comment only
    await post.populate("comments.user", "name profilePhoto");
    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({ message: "Comment added", comment: addedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/posts/:id/comments/:commentId
// Private — comment owner or admin can delete
// ─────────────────────────────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/posts/user/:userId
// Private — get all posts by a specific alumni
// ─────────────────────────────────────────────────────────────
const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "name profilePhoto currentRole")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getPostsByUser,
};