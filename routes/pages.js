const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

router.get("/", async (req, res, next) => {
  try {
    const listings = await Listing.find().lean();
    res.render("index", { listings });
  } catch (error) {
    next(error);
  }
});

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render("login", { error: "Invalid email or password" });
    }

    req.session.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.render("register", { error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render("register", { error: "Email already in use" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword, role: "guest" });
    req.session.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.get("/listing/:id", async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) {
      return res.status(404).render("message", { title: "Listing not found", message: "The requested listing does not exist." });
    }
    res.render("listing", { listing, error: null });
  } catch (error) {
    next(error);
  }
});

router.post("/booking", requireLogin, async (req, res, next) => {
  try {
    const { listingId, startDate, endDate, guests } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).render("message", { title: "Listing not found", message: "The requested listing does not exist." });
    }
    if (!startDate || !endDate || !guests) {
      return res.render("listing", { listing: listing.toObject(), error: "All booking fields are required" });
    }
    if (Number(guests) > listing.maxGuests) {
      return res.render("listing", { listing: listing.toObject(), error: "Guest count exceeds listing capacity" });
    }

    await Booking.create({
      listingId: listing._id,
      userId: req.session.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      guests: Number(guests),
      totalPrice: Number(listing.pricePerNight) * Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
    });

    res.redirect("/bookings");
  } catch (error) {
    next(error);
  }
});

router.get("/bookings", requireLogin, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.session.user.id }).populate("listingId").lean();
    const userBookings = bookings.map((booking) => ({ ...booking, listing: booking.listingId }));
    res.render("bookings", { bookings: userBookings });
  } catch (error) {
    next(error);
  }
});

router.get("/create-listing", requireLogin, (req, res) => {
  res.render("create-listing", { error: null });
});

router.post("/create-listing", requireLogin, async (req, res, next) => {
  try {
    const { title, description, city, pricePerNight, maxGuests, imageUrl, amenities } = req.body;
    if (!title || !description || !city || !pricePerNight || !maxGuests) {
      return res.render("create-listing", { error: "All fields except image and amenities are required." });
    }

    await Listing.create({
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
  } catch (error) {
    next(error);
  }
});

module.exports = router;
