const bcrypt = require("bcryptjs");

const users = [
  {
    id: 1,
    name: "Alice Owner",
    email: "alice@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "host"
  },
  {
    id: 2,
    name: "Bob Traveler",
    email: "bob@example.com",
    password: bcrypt.hashSync("guestpass", 10),
    role: "guest"
  }
];

const listings = [
  {
    id: 1,
    title: "Cozy Downtown Apartment",
    description: "Bright 2-bedroom apartment in the heart of the city.",
    city: "New York",
    pricePerNight: 120,
    maxGuests: 4,
    images: [
      "https://images.unsplash.com/photo-1560448073-0192ebc6a212",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
    ],
    ownerId: 1,
    amenities: ["Wi-Fi", "Kitchen", "Heating", "Air conditioning"]
  },
  {
    id: 2,
    title: "Lakefront Cottage",
    description: "Peaceful cottage with water views, perfect for a weekend escape.",
    city: "Seattle",
    pricePerNight: 180,
    maxGuests: 6,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe86"
    ],
    ownerId: 1,
    amenities: ["Free parking", "Hot tub", "Kitchen", "Fireplace"]
  }
];

const bookings = [];

function getUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getUserById(id) {
  return users.find((user) => user.id === Number(id));
}

function createUser({ name, email, password }) {
  const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id: nextId,
    name,
    email,
    password: hashedPassword,
    role: "guest"
  };
  users.push(user);
  return user;
}

function createListing(listing) {
  const nextId = listings.length ? Math.max(...listings.map((item) => item.id)) + 1 : 1;
  const newListing = { ...listing, id: nextId };
  listings.push(newListing);
  return newListing;
}

function createBooking(booking) {
  const nextId = bookings.length ? Math.max(...bookings.map((item) => item.id)) + 1 : 1;
  const newBooking = { ...booking, id: nextId, status: "confirmed" };
  bookings.push(newBooking);
  return newBooking;
}

module.exports = {
  users,
  listings,
  bookings,
  getUserByEmail,
  getUserById,
  createUser,
  createListing,
  createBooking
};
