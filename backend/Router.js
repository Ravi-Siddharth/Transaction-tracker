
const express = require("express");

const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,

  forgotPassword,
  verifyOtp,
  resetPassword,

  UploadProfilePicture,

  getProfile,
  updateProfile,
  updateProfilePicture,
  getProfilePicture,
} = require("./Controller.js");

const { register, login } = require("./AuthController.js");
const Upload = require("./Upload.js");

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/login", login);

// Transactions
router.get("/transactions", getTransactions);
router.post("/transactions", addTransaction);
router.put("/transactions/:id", updateTransaction);
router.delete("/transactions/:id", deleteTransaction);

// Dashboard summary
router.get("/summary", getSummary);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Profile details
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Profile picture: save and retrieve
router.put(
  "/profile-picture",
  Upload.single("file"),
  updateProfilePicture
);

router.get("/profile-picture", getProfilePicture);

// General file upload
router.post(
  "/Upload",
  Upload.single("file"),
  UploadProfilePicture
);

module.exports = router;