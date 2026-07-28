const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getProfile, updateProfile,
  createPost, getMyPosts, updatePost, deletePost,
  getMyCampaigns, getStats,
} = require("../controllers/creatorController");

router.use(protect, requireRole("creator"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Creator Content Posts
router.post("/posts", createPost);
router.get("/posts", getMyPosts);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);

// Assigned Campaigns (Privacy-first, shared/assigned by Admin only)
router.get("/campaigns", getMyCampaigns);
router.get("/stats", getStats);

module.exports = router;
