const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  register,
  login,
  getCurrentUser
} = require("../controllers/auth.controller");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;