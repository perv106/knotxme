const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getStats, getAllBriefs, updateBriefStatus, getAllCreatorPosts,
  getAllUsers, updateUserStatus, deleteUser,
  getAllBrands, getAllCreators,
  exportCreators, exportBrands, exportLogins, exportBriefs,
} = require("../controllers/adminController");

router.use(protect, requireRole("admin"));

router.get("/stats", getStats);

// Campaign Briefs management
router.get("/briefs", getAllBriefs);
router.put("/briefs/:id", updateBriefStatus);
// Legacy compatibility endpoint
router.get("/campaigns", getAllBriefs);

// Creator Posts management
router.get("/creator-posts", getAllCreatorPosts);

// User & Entity Management
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/brands", getAllBrands);
router.get("/creators", getAllCreators);

// Excel Exports
router.get("/export/creators", exportCreators);
router.get("/export/brands", exportBrands);
router.get("/export/logins", exportLogins);
router.get("/export/briefs", exportBriefs);
router.get("/export/campaigns", exportBriefs);

module.exports = router;
