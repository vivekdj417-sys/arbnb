const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "okback-secret";

function normalizeEmail(email) {
  return String(email || "").toLowerCase();
}

function buildUserPayload(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function issueToken(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
}

async function getUserByEmail(email) {
  return User.findOne({ email: normalizeEmail(email) });
}

function isPasswordValid(user, password) {
  return user && bcrypt.compareSync(password, user.password);
}

async function createUser({ name, email, password }) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return User.create({
    name,
    email: normalizeEmail(email),
    password: hashedPassword,
    role: "guest"
  });
}

async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  if (!isPasswordValid(user, password)) {
    return null;
  }
  return user;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await createUser({ name, email, password });
    const token = issueToken(user);

    res.status(201).json({ user: buildUserPayload(user), token });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = issueToken(user);
    res.json({ user: buildUserPayload(user), token });
  } catch (error) {
    next(error);
  }
}

async function loginSubmit(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    req.session.user = buildUserPayload(user);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
}

async function registerSubmit(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.render("register", { error: "All fields are required" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.render("register", { error: "Email already in use" });
    }

    const user = await createUser({ name, email, password });
    req.session.user = buildUserPayload(user);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  loginSubmit,
  registerSubmit,
  logout,
  me
};
