const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getProfile, updateProfile, getOpportunities, acceptCampaign, getMyCampaigns, getStats,
} = require("../controllers/creatorController");

router.use(protect, requireRole("creator"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/opportunities", getOpportunities);
router.post("/opportunities/:id/accept", acceptCampaign);
router.get("/campaigns", getMyCampaigns);
router.get("/stats", getStats);

module.exports = router;
