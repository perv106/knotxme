const mongoose = require("mongoose");

// LOGIN TABLE — credentials only. Never store profile info here.
const loginSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // bcrypt hash
  role: { type: String, enum: ["creator", "brand", "admin"], required: true },
  accountStatus: {
    type: String,
    enum: ["Active", "Blocked", "Suspended", "Pending"],
    default: "Active",
  },
  createdDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },

  // Password reset support
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("Login", loginSchema);
