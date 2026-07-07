const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getProfile, updateProfile, createRequirement, getMyRequirements, getStats,
} = require("../controllers/brandController");

router.use(protect, requireRole("brand"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/requirements", createRequirement);
router.get("/requirements", getMyRequirements);
router.get("/stats", getStats);

module.exports = router;
