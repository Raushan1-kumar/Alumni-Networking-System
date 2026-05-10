const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect any route — checks JWT from Authorization header
const protect = async (req, res, next) => {
  let token;

  // Token comes as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the logged-in user to req so controllers can use it
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };