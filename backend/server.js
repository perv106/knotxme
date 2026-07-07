require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const brandRoutes = require("./routes/brandRoutes");
const creatorRoutes = require("./routes/creatorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ---------- Core middleware ----------
app.use(express.json({ limit: "1mb" }));

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:8080").split(",");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Basic protection against brute-force login attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/admin-login", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// ---------- Routes ----------~
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Knotxme API running on port ${PORT}`);
  });
});

module.exports = app;
