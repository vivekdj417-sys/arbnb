const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
