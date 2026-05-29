const express = require("express");
const pageController = require("../controllers/pageController");

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

router.get("/", pageController.home);
router.get("/login", pageController.loginPage);
router.post("/login", pageController.loginSubmit);
router.get("/register", pageController.registerPage);
router.post("/register", pageController.registerSubmit);
router.get("/logout", pageController.logout);
router.get("/listing/:id", pageController.listingPage);
router.post("/booking", requireLogin, pageController.bookingSubmit);
router.get("/bookings", requireLogin, pageController.viewBookings);
router.get("/create-listing", requireLogin, pageController.createListingPage);
router.post("/create-listing", requireLogin, pageController.createListingSubmit);

module.exports = router;
