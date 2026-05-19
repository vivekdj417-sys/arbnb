const express = require("express");
const authMiddleware = require("../middleware/auth");
const { bookings, listings, createBooking } = require("../data/store");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  const userBookings = bookings.filter((booking) => booking.userId === req.user.id);
  res.json(userBookings);
});

router.post("/", authMiddleware, (req, res) => {
  const { listingId, startDate, endDate, guests } = req.body;
  if (!listingId || !startDate || !endDate || !guests) {
    return res.status(400).json({ error: "listingId, startDate, endDate, and guests are required" });
  }

  const listing = listings.find((item) => item.id === Number(listingId));
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (guests > listing.maxGuests) {
    return res.status(400).json({ error: "Guest count exceeds listing capacity" });
  }

  const booking = createBooking({
    listingId: listing.id,
    userId: req.user.id,
    startDate,
    endDate,
    guests,
    totalPrice: Number(listing.pricePerNight) * calculateNights(startDate, endDate)
  });

  res.status(201).json(booking);
});

router.delete("/:id", authMiddleware, (req, res) => {
  const bookingIndex = bookings.findIndex((booking) => booking.id === Number(req.params.id));
  if (bookingIndex === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }
  const booking = bookings[bookingIndex];
  if (booking.userId !== req.user.id) {
    return res.status(403).json({ error: "You are not allowed to cancel this booking" });
  }
  bookings.splice(bookingIndex, 1);
  res.json({ message: "Booking canceled" });
});

function calculateNights(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((end - start) / msPerDay));
}

module.exports = router;
