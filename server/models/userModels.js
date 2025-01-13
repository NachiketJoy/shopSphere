const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    authId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    address: {
      street: { type: String, required: [true, "Street is required"] },
      city: { type: String, required: [true, "City is required"] },
      postalCode: { type: String, required: [true, "Postal Code is required"] },
      country: { type: String, required: [true, "Country is required"] },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
