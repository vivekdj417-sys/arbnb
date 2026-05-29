const express = require("express");
const authMiddleware = require("../middleware/auth");
const listingController = require("../controllers/listingController");

const router = express.Router();

router.get("/", listingController.getListings);
router.get("/:id", listingController.getListingById);
router.post("/", authMiddleware, listingController.createListing);
router.put("/:id", authMiddleware, listingController.updateListing);
router.delete("/:id", authMiddleware, listingController.deleteListing);

module.exports = router;
