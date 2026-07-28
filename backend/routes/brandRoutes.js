const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getProfile, updateProfile, createBrief, getMyBriefs, getStats,
} = require("../controllers/brandController");

router.use(protect, requireRole("brand"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/briefs", createBrief);
router.get("/briefs", getMyBriefs);
// Legacy compatibility aliases
router.post("/requirements", createBrief);
router.get("/requirements", getMyBriefs);

router.get("/stats", getStats);

module.exports = router;
