const express = require("express");
const authMiddleware = require("../middleware/auth");
const Listing = require("../models/Listing");

const router = express.Router();

router.get("/", async (req, res) => {
  const { city, maxGuests } = req.query;
  const query = {};

  if (city) {
    query.city = { $regex: city, $options: "i" };
  }
  if (maxGuests) {
    query.maxGuests = { $gte: Number(maxGuests) };
  }

  const results = await Listing.find(query);
  res.json(results);
});

router.get("/:id", async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
});

router.post("/", authMiddleware, async (req, res) => {
  const { title, description, city, pricePerNight, maxGuests, images, amenities } = req.body;
  if (!title || !description || !city || !pricePerNight || !maxGuests) {
    return res.status(400).json({ error: "Listing title, description, city, price, and max guests are required" });
  }

  const listing = await Listing.create({
    title,
    description,
    city,
    pricePerNight: Number(pricePerNight),
    maxGuests: Number(maxGuests),
    images: images || [],
    amenities: amenities || [],
    ownerId: req.user.id
  });

  res.status(201).json(listing);
});

router.put("/:id", authMiddleware, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (listing.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: "You are not allowed to edit this listing" });
  }

  const updates = ["title", "description", "city", "pricePerNight", "maxGuests", "images", "amenities"];
  updates.forEach((field) => {
    if (req.body[field] !== undefined) {
      listing[field] = req.body[field];
    }
  });

  await listing.save();
  res.json(listing);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (listing.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: "You are not allowed to delete this listing" });
  }

  await listing.deleteOne();
  res.json({ message: "Listing deleted" });
});

module.exports = router;
