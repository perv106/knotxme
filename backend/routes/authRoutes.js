const express = require("express");
const router = express.Router();
const {
  signup, login, adminLogin, logout, forgotPassword, resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
