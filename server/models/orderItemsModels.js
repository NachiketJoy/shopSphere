const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderItemsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity cannot be less than 1"],
        },
        addedAt: {
            type: Date,
            default: Date.now,
        }

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("OrderItems", orderItemsSchema);
