const Listing = require("../models/Listing");

async function getListings(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

async function getListingById(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(listing);
  } catch (error) {
    next(error);
  }
}

async function createListing(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

async function updateListing(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not allowed to delete this listing" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
};
