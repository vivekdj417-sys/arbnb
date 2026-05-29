const express = require("express");
const authMiddleware = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get("/", authMiddleware, bookingController.getBookings);
router.post("/", authMiddleware, bookingController.createBooking);
router.delete("/:id", authMiddleware, bookingController.cancelBooking);

module.exports = router;
