const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getStats, getAllUsers, updateUserStatus, deleteUser,
  getAllBrands, getAllCreators, getAllCampaigns,
  exportCreators, exportBrands, exportLogins, exportCampaigns,
} = require("../controllers/adminController");

router.use(protect, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/brands", getAllBrands);
router.get("/creators", getAllCreators);
router.get("/campaigns", getAllCampaigns);

router.get("/export/creators", exportCreators);
router.get("/export/brands", exportBrands);
router.get("/export/logins", exportLogins);
router.get("/export/campaigns", exportCampaigns);

module.exports = router;
