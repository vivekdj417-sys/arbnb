const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail, createUser, listings, getUserById, createBooking, bookings, createListing } = require("../data/store");

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

router.get("/", (req, res) => {
  res.render("index", { listings });
});

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render("login", { error: "Invalid email or password" });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.redirect("/");
});

router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.render("register", { error: "All fields are required" });
  }
  if (getUserByEmail(email)) {
    return res.render("register", { error: "Email already in use" });
  }

  const user = createUser({ name, email, password });
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.get("/listing/:id", (req, res) => {
  const listing = listings.find((item) => item.id === Number(req.params.id));
  if (!listing) {
    return res.status(404).render("message", { title: "Listing not found", message: "The requested listing does not exist." });
  }
  res.render("listing", { listing, error: null });
});

router.post("/booking", requireLogin, (req, res) => {
  const { listingId, startDate, endDate, guests } = req.body;
  const listing = listings.find((item) => item.id === Number(listingId));
  if (!listing) {
    return res.status(404).render("message", { title: "Listing not found", message: "The requested listing does not exist." });
  }
  if (!startDate || !endDate || !guests) {
    return res.render("listing", { listing, error: "All booking fields are required" });
  }
  if (Number(guests) > listing.maxGuests) {
    return res.render("listing", { listing, error: "Guest count exceeds listing capacity" });
  }

  createBooking({
    listingId: listing.id,
    userId: req.session.user.id,
    startDate,
    endDate,
    guests: Number(guests),
    totalPrice: Number(listing.pricePerNight) * Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
  });

  res.redirect("/bookings");
});

router.get("/bookings", requireLogin, (req, res) => {
  const userBookings = bookings.filter((booking) => booking.userId === req.session.user.id).map((booking) => {
    const listing = listings.find((item) => item.id === booking.listingId);
    return { ...booking, listing };
  });
  res.render("bookings", { bookings: userBookings });
});

router.get("/create-listing", requireLogin, (req, res) => {
  res.render("create-listing", { error: null });
});

router.post("/create-listing", requireLogin, (req, res) => {
  const { title, description, city, pricePerNight, maxGuests, imageUrl, amenities } = req.body;
  if (!title || !description || !city || !pricePerNight || !maxGuests) {
    return res.render("create-listing", { error: "All fields except image and amenities are required." });
  }

  createListing({
    title,
    description,
    city,
    pricePerNight: Number(pricePerNight),
    maxGuests: Number(maxGuests),
    images: imageUrl ? [imageUrl] : [],
    amenities: amenities ? amenities.split(",").map((item) => item.trim()).filter(Boolean) : [],
    ownerId: req.session.user.id
  });

  res.redirect("/");
});

module.exports = router;
