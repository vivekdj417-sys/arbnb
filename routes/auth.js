const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "okback-secret";
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword, role: "guest" });
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
