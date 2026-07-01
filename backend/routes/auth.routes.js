import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = express.Router();

// Helper: sign a JWT for a given user ID
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }

    const user = await User.create({ username, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
