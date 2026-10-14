
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },


  profilePicture: {
    data: {
      type: Buffer,
      default: null,
    },
    contentType: {
      type: String,
      default: "",
    },
  },


  uploadedFiles: [
    {
      fileName: {
        type: String,
        required: true,
      },
      fileData: {
        type: Buffer,
        required: true,
      },
      contentType: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  resetOtp: {
    type: String,
    default: null,
  },

  resetOtpExpiry: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;