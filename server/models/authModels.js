const mongoose = require("mongoose");
const { Schema } = mongoose;

const authSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    fullName: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: { 
      type: String, 
      default: null 
    },
    passwordResetExpires: { 
      type: Date, 
      default: null 
    }, 
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Auth", authSchema);
