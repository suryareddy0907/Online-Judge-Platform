import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const initAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete existing admin if exists
    await User.deleteOne({ email: "suryareddy0907@gmail.com" });
    console.log("Removed existing admin user");

    // Create default admin password (you should change this)
    const defaultPassword = "admin123"; // Change this to a secure password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const adminUser = new User({
      username: "admin",
      email: "suryareddy0907@gmail.com",
      passwordHash: hashedPassword,
      role: "admin",
      isActive: true,
      isBanned: false,
      createdAt: new Date()
    });

    await adminUser.save();
    console.log("Default admin user created successfully");
    console.log("Email: suryareddy0907@gmail.com");
    console.log("Password: admin123");
    console.log("Please change the password after first login!");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
initAdmin(); 