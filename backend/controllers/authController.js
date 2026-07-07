const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Login = require("../models/Login");
const BrandProfile = require("../models/BrandProfile");
const CreatorProfile = require("../models/CreatorProfile");
const sendEmail = require("../utils/sendEmail");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function publicUser(loginDoc, name) {
  return {
    id: loginDoc._id,
    email: loginDoc.email,
    role: loginDoc.role,
    name: name || "",
  };
}

// POST /api/auth/signup  { name, email, password, role: "brand" | "creator" }
async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required." });
    }
    if (!["brand", "creator"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'brand' or 'creator'." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existing = await Login.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 12);
    const login = await Login.create({
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
    });

    if (role === "brand") {
      await BrandProfile.create({ loginId: login._id, companyName: name || "" });
    } else {
      await CreatorProfile.create({ loginId: login._id, name: name || "" });
    }

    res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login  { email, password, role }
async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required." });
    }

    const user = await Login.findOne({ email: email.toLowerCase().trim(), role });
    if (!user) {
      return res.status(401).json({ message: "Invalid email, password, or role." });
    }
    if (user.accountStatus === "Blocked" || user.accountStatus === "Suspended") {
      return res.status(403).json({ message: `Your account has been ${user.accountStatus.toLowerCase()}.` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email, password, or role." });
    }

    user.lastLogin = new Date();
    await user.save();

    let name = "";
    if (role === "brand") {
      const profile = await BrandProfile.findOne({ loginId: user._id });
      name = profile ? profile.companyName || profile.brandName : "";
    } else {
      const profile = await CreatorProfile.findOne({ loginId: user._id });
      name = profile ? profile.name : "";
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user, name) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/admin-login  { email, password }
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await Login.findOne({ email: email.toLowerCase().trim(), role: "admin" });
    if (!user) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.json({ token, user: publicUser(user, "Admin") });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  // JWTs are stateless; the client discards the token. This endpoint exists
  // for a consistent API and as a hook for future token-blacklisting.
  res.json({ message: "Logged out." });
}

// POST /api/auth/forgot-password  { email }
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const genericResponse = { message: "If an account exists for that email, a reset link has been sent." };

    if (!email) return res.json(genericResponse);

    const user = await Login.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json(genericResponse); // never reveal whether the email exists

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:8080"}/reset-password.html?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Knotxme password",
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p>`,
    });

    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password  { token, password }
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await Login.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, adminLogin, logout, forgotPassword, resetPassword };
