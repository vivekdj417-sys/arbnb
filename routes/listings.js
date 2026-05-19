const express = require("express");
const authMiddleware = require("../middleware/auth");
const { listings, createListing } = require("../data/store");

const router = express.Router();

router.get("/", (req, res) => {
  const { city, maxGuests } = req.query;
  let results = listings;

  if (city) {
    results = results.filter((listing) => listing.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (maxGuests) {
    results = results.filter((listing) => listing.maxGuests >= Number(maxGuests));
  }

  res.json(results);
});

router.get("/:id", (req, res) => {
  const listing = listings.find((item) => item.id === Number(req.params.id));
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
});

router.post("/", authMiddleware, (req, res) => {
  const { title, description, city, pricePerNight, maxGuests, images, amenities } = req.body;
  if (!title || !description || !city || !pricePerNight || !maxGuests) {
    return res.status(400).json({ error: "Listing title, description, city, price, and max guests are required" });
  }

  const listing = createListing({
    title,
    description,
    city,
    pricePerNight,
    maxGuests,
    images: images || [],
    amenities: amenities || [],
    ownerId: req.user.id
  });

  res.status(201).json(listing);
});

router.put("/:id", authMiddleware, (req, res) => {
  const listing = listings.find((item) => item.id === Number(req.params.id));
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (listing.ownerId !== req.user.id) {
    return res.status(403).json({ error: "You are not allowed to edit this listing" });
  }

  const updates = ["title", "description", "city", "pricePerNight", "maxGuests", "images", "amenities"];
  updates.forEach((field) => {
    if (req.body[field] !== undefined) {
      listing[field] = req.body[field];
    }
  });

  res.json(listing);
});

router.delete("/:id", authMiddleware, (req, res) => {
  const index = listings.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }
  const listing = listings[index];
  if (listing.ownerId !== req.user.id) {
    return res.status(403).json({ error: "You are not allowed to delete this listing" });
  }
  listings.splice(index, 1);
  res.json({ message: "Listing deleted" });
});

module.exports = router;
