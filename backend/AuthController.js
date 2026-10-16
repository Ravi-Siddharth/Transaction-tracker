
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const existingUser = await User.findOne({
      email: email
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        error: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRETKEY) {
      throw new Error("JWT_SECRETKEY is not configured");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRETKEY,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      message: "Login successful",

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },

      token
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
