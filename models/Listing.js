const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    maxGuests: { type: Number, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
