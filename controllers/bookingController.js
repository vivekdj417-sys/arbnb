const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

function calculateNights(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((end - start) / msPerDay));
}

async function getBookings(req, res, next) {
  try {
    const userBookings = await Booking.find({ userId: req.user.id }).populate("listingId");
    res.json(userBookings);
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not allowed to cancel this booking" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking canceled" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBookings,
  createBooking,
  cancelBooking
};
