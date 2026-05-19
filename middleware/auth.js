const jwt = require("jsonwebtoken");
const { getUserById } = require("../data/store");

const JWT_SECRET = process.env.JWT_SECRET || "okback-secret";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid token user" });
    }
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
