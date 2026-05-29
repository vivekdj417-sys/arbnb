const express = require("express");
const authMiddleware = require("../middleware/auth");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const userBookings = await Booking.find({ userId: req.user.id }).populate("listingId");
  res.json(userBookings);
});

router.post("/", authMiddleware, async (req, res) => {
  const { listingId, startDate, endDate, guests } = req.body;
  if (!listingId || !startDate || !endDate || !guests) {
    return res.status(400).json({ error: "listingId, startDate, endDate, and guests are required" });
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (Number(guests) > listing.maxGuests) {
    return res.status(400).json({ error: "Guest count exceeds listing capacity" });
  }

  const booking = await Booking.create({
    listingId: listing._id,
    userId: req.user.id,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    guests: Number(guests),
    totalPrice: Number(listing.pricePerNight) * calculateNights(startDate, endDate)
  });

  res.status(201).json(booking);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: "You are not allowed to cancel this booking" });
  }

  await booking.deleteOne();
  res.json({ message: "Booking canceled" });
});

function calculateNights(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((end - start) / msPerDay));
}

module.exports = router;
