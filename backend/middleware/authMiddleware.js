const jwt = require("jsonwebtoken");
const Login = require("../models/Login");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      // allow token via query string for direct-download links (Excel export)
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Login.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized. User no longer exists." });
    }
    if (user.accountStatus === "Blocked" || user.accountStatus === "Suspended") {
      return res.status(403).json({ message: "Your account has been " + user.accountStatus.toLowerCase() + "." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized. Invalid or expired token." });
  }
}

module.exports = { protect };
