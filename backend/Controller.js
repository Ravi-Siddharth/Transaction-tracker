
import Transaction from "./models/Transaction.js";
import File from "./models/file.js";
import User from "./models/User.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const SECRET_KEY = process.env.JWT_SECRETKEY;

const getAuthenticatedUser = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Valid Bearer token required");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === "undefined") {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    throw error;
  }

  return jwt.verify(token, SECRET_KEY);
};

const getTransactions = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);

    const transactions = await Transaction.find({
      user: decoded.id,
    }).sort({ _id: 1 });

    res.json(transactions);
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const addTransaction = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);
    const { title, amount, type, date } = req.body;

    if (
      !title ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !type ||
      !date
    ) {
      return res.status(400).json({
        error: "title, amount, type and date are required",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        error: "Amount must be a valid non-negative number",
      });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        error: "type must be 'income' or 'expense'",
      });
    }

    const newTransaction = await Transaction.create({
      title: title.trim(),
      amount: Number(amount),
      type,
      date,
      user: decoded.id,
    });

    res.status(201).json(newTransaction);
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);
    const { title, amount, type, date } = req.body;

    if (
      !title ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !type ||
      !date
    ) {
      return res.status(400).json({
        error: "title, amount, type and date are required",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        error: "Amount must be a valid non-negative number",
      });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        error: "type must be 'income' or 'expense'",
      });
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: decoded.id,
      },
      {
        title: title.trim(),
        amount: Number(amount),
        type,
        date,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    res.json(updatedTransaction);
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);

    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: decoded.id,
    });

    if (!deletedTransaction) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    res.status(204).send();
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

// Summary grouped by date for the logged-in user
const getSummary = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);

    const summary = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(decoded.id),
        },
      },
      {
        $addFields: {
          groupedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: "$date" },
            },
          },
        },
      },
      {
        $sort: {
          date: 1,
          _id: 1,
        },
      },
      {
        $group: {
          _id: "$groupedDate",
          transactions: {
            $push: {
              _id: "$_id",
              title: "$title",
              amount: "$amount",
              date: "$date",
              type: "$type",
            },
          },
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                0,
              ],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "expense"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          balance: {
            $subtract: ["$totalIncome", "$totalExpense"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          transactions: 1,
          totalIncome: 1,
          totalExpense: 1,
          balance: 1,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    return res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim(),
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({
        error: "Email configuration is missing",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({
      message: "OTP sent successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error("Forgot password error:", err.message);

    res.status(500).json({
      error: "Unable to send OTP. Please try again later.",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        error: "User ID and OTP are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.resetOtp) {
      return res.status(400).json({
        error: "OTP not found",
      });
    }

    if (
      !user.resetOtpExpiry ||
      user.resetOtpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({
        error: "OTP has expired",
      });
    }

    if (user.resetOtp !== String(otp)) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    res.json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("OTP verification error:", err.message);

    res.status(500).json({
      error: "Unable to verify OTP",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        error: "User ID, OTP, and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.resetOtp || user.resetOtp !== String(otp)) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    if (
      !user.resetOtpExpiry ||
      user.resetOtpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({
        error: "OTP has expired",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    res.json({
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Password reset error:", err.message);

    res.status(500).json({
      error: "Unable to reset password",
    });
  }
};

const UploadProfilePicture = async (req, res) => {
  let savedPath;

  try {
    const decoded = getAuthenticatedUser(req);

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    savedPath = req.file.path;

    const newFile = await File.create({
      user: decoded.id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: newFile._id,
        originalName: newFile.originalName,
        fileName: newFile.fileName,
        size: newFile.size,
        type: newFile.type,
      },
    });
  } catch (err) {
    if (savedPath) {
      try {
        await fs.promises.unlink(savedPath);
      } catch (cleanupError) {
        console.error("File cleanup error:", cleanupError.message);
      }
    }

    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    console.error("Upload error:", err.message);

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);

    const user = await User.findById(decoded.id).select(
      "firstName lastName email"
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);
    const { firstName, lastName, email } = req.body;

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim()
    ) {
      return res.status(400).json({
        error: "First name, last name and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: decoded.id },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "This email is already in use",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.email = normalizedEmail;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const updateProfilePicture = async (req, res) => {
  let uploadedPath;

  try {
    const decoded = getAuthenticatedUser(req);

    if (!req.file) {
      return res.status(400).json({
        error: "Please select an image",
      });
    }

    uploadedPath = req.file.path;

    if (!req.file.mimetype.startsWith("image/")) {
      await fs.promises.unlink(uploadedPath);
      uploadedPath = null;

      return res.status(400).json({
        error: "Please upload an image file",
      });
    }

    const imageData = await fs.promises.readFile(uploadedPath);
    const user = await User.findById(decoded.id);

    if (!user) {
      await fs.promises.unlink(uploadedPath);
      uploadedPath = null;

      return res.status(404).json({
        error: "User not found",
      });
    }

    user.profilePicture = {
      data: imageData,
      contentType: req.file.mimetype,
    };

    await user.save();
    await fs.promises.unlink(uploadedPath);
    uploadedPath = null;

    res.json({
      message: "Profile picture saved successfully",
    });
  } catch (err) {
    if (uploadedPath) {
      await fs.promises.unlink(uploadedPath).catch(() => {});
    }

    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    console.error("Profile picture error:", err.message);

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

const getProfilePicture = async (req, res) => {
  try {
    const decoded = getAuthenticatedUser(req);

    const user = await User.findById(decoded.id).select(
      "profilePicture"
    );

    if (!user || !user.profilePicture?.data) {
      return res.status(404).json({
        error: "Profile picture not found",
      });
    }

    res.set("Content-Type", user.profilePicture.contentType);
    res.set("Cache-Control", "private, no-store");

    res.send(user.profilePicture.data);
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
};

export {
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
};
