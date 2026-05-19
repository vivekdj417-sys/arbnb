const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserByEmail, createUser } = require("../data/store");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "okback-secret";
const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (getUserByEmail(email)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user = createUser({ name, email, password });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
