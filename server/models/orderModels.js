const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    orderItems: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity cannot be less than 1"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivering", "delivered"],
      default: "pending",
    },
    shippingAddress: {
      street: { type: String, required: [true, "Street is required"] },
      city: { type: String, required: [true, "City is required"] },
      postalCode: { type: String, required: [true, "Postal Code is required"] },
      country: { type: String, required: [true, "Country is required"] },
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);

// .populate({
//   path: "userId",
//   select: "address",
//   populate: {
//     path: "authId",
//     select: "fullName",
//   },
// })