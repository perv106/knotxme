const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getStudents,
  markAttendance,
  getAttendanceHistory,
  exportReport,
  getSmartInsights,
} = require("../controllers/facultyController");

router.use(protect);
router.use(requireRole("faculty"));

router.get("/students", getStudents);
router.post("/attendance", markAttendance);
router.get("/attendance-dates", getAttendanceHistory);
router.get("/report", exportReport);
router.get("/insights", getSmartInsights);

module.exports = router;
