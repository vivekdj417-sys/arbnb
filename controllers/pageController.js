const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

async function home(req, res, next) {
  try {
    const listings = await Listing.find().lean();
    res.render("index", { listings });
  } catch (error) {
    next(error);
  }
}

function loginPage(req, res) {
  res.render("login", { error: null });
}

function registerPage(req, res) {
  res.render("register", { error: null });
}

async function listingPage(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) {
      return res.status(404).render("message", { title: "Listing not found", message: "The requested listing does not exist." });
    }
    res.render("listing", { listing, error: null });
  } catch (error) {
    next(error);
  }
}

async function bookingSubmit(req, res, next) {
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
}

async function viewBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ userId: req.session.user.id }).populate("listingId").lean();
    const userBookings = bookings.map((booking) => ({ ...booking, listing: booking.listingId }));
    res.render("bookings", { bookings: userBookings });
  } catch (error) {
    next(error);
  }
}

function createListingPage(req, res) {
  res.render("create-listing", { error: null });
}

async function createListingSubmit(req, res, next) {
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
}

module.exports = {
  home,
  loginPage,
  registerPage,
  listingPage,
  bookingSubmit,
  viewBookings,
  createListingPage,
  createListingSubmit
};
