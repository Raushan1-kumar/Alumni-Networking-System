const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getPostsByUser,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect); // all routes need login

router.get("/", getAllPosts);                                    // GET    /api/posts?tag=career
router.post("/", createPost);                                   // POST   /api/posts
router.get("/user/:userId", getPostsByUser);                    // GET    /api/posts/user/:userId
router.get("/:id", getPostById);                                // GET    /api/posts/:id
router.put("/:id", updatePost);                                 // PUT    /api/posts/:id
router.delete("/:id", deletePost);                              // DELETE /api/posts/:id
router.put("/:id/like", toggleLike);                            // PUT    /api/posts/:id/like
router.post("/:id/comments", addComment);                       // POST   /api/posts/:id/comments
router.delete("/:id/comments/:commentId", deleteComment);       // DELETE /api/posts/:id/comments/:commentId

module.exports = router;