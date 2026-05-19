const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const listingsRoutes = require("./routes/listings");
const bookingsRoutes = require("./routes/bookings");
const pagesRoutes = require("./routes/pages");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "okback-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use("/", pagesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/bookings", bookingsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "okback-airbnb-api" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
