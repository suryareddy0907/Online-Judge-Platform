import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    if (user.isBanned || !user.isActive) {
      return res.status(403).json({ message: "Account is banned or inactive." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};

export const requireAdminOrModerator = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    if (!["admin", "moderator"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Admin or moderator privileges required." });
    }

    if (user.isBanned || !user.isActive) {
      return res.status(403).json({ message: "Account is banned or inactive." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin/Moderator middleware error:", error);
    res.status(401).json({ message: "Invalid token." });
  }
}; 