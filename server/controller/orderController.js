const Order = require("../models/orderModels");
const CartItem = require("../models/cartItemsModels");
const Product = require("../models/productModels");
const Auth = require("../models/authModels");
const User = require("../models/userModels");
const cardValidation = require("../utils/cardValidation");
let io;

const setIO = (_io) => {
  io = _io;
};

// Create a new order controller
exports.createOrder = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, shippingAddress } = req.body;
    const userId = req.user._id;

    // Validate payment details
    if (!cardValidation.validateCreditCard(cardNumber)) {
      return res.status(400).json({ message: "Invalid card number" });
    }
    if (!cardValidation.validateExpiryDate(expiryDate)) {
      return res.status(400).json({ message: "Invalid expiry date" });
    }
    if (!cardValidation.validateCVV(cvv)) {
      return res.status(400).json({ message: "Invalid CVV" });
    }

    // Get cart items
    const cartItems = await CartItem.find({ authId: req.user._id }).populate(
      "productId"
    );
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check product availability and update quantities
    for (const item of cartItems) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res.status(400).json({
          message: `Product ${item.productId.name} no longer exists`,
        });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`,
        });
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);

    // Create order
    const order = await Order.create({
      userId,
      orderItems: cartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      totalAmount,
      status: "pending",
      shippingAddress,
    });

    // Update product quantities
    for (const item of cartItems) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { quantity: -item.quantity },
      });
    }

    // Emit initial status
    if (io) {
      io.emit(`notification-${userId}`, {
        type: "order",
        status: "pending",
        orderId: order._id,
        message: `Order #${order._id} has been created`,
        timestamp: new Date(),
      });
    }

    // Clear cart
    await CartItem.deleteMany({ authId: userId });

    // Initialize socket namespace for this order
    const orderSocket = io.of(`/order/${order._id}`);

    // Function to update order status and emit notifications
    const updateOrderStatus = async (status, timestamp = null) => {
      try {
        await Order.findByIdAndUpdate(
          order._id,
          {
            status,
            ...(timestamp && { [timestamp]: new Date() }),
          },
          { new: true }
        );

        if (io) {
          io.emit(`notification-${userId}`, {
            type: "order",
            status,
            orderId: order._id,
            message: `Order #${order._id} is now ${status}`,
            timestamp: new Date(),
          });
        } else {
          console.warn("Socket.IO not initialized");
        }
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    };

    // Allow cancellation within 5 seconds
    const cancellationTimeout = setTimeout(async () => {
      await updateOrderStatus("confirmed");

      // Change to delivering after 3 seconds
      setTimeout(async () => {
        await updateOrderStatus("delivering", "shippedAt");

        // Change to delivered after 5 seconds
        setTimeout(async () => {
          await updateOrderStatus("delivered", "deliveredAt");
        }, 5000);
      }, 3000);
    }, 5000);

    global.orderTimeouts = global.orderTimeouts || {};
    global.orderTimeouts[order._id] = cancellationTimeout;

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order status
exports.getOrderStatus = async (req, res) => {
  try {
    // Retrieves the current status of a specific order for the authenticated user
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Returns order status and timestamps for ordered, shipped, and delivered events
    res.status(200).json({
      success: true,
      status: order.status,
      orderedAt: order.orderedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders made my the authenticated user
exports.getAllOrders = async (req, res) => {
  try {
    // Retrieves all orders for the authenticated user
    // Returns orders sorted by creation date (newest first)
    // Includes detailed product information for each order item
    const orders = await Order.find({ userId: req.user._id })
      .populate("orderItems.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders (admin only)
exports.allOrders = async (req, res) => {
  try {
    const admin_login_email = process.env.ADMIN_LOGIN_EMAIL;

    // Validates admin access using environment variables
    const users = await Auth.find();
    const adminUser = users.find((user) => user.email === admin_login_email);
    const isAdmin = adminUser.email === req.user.email;

    // Admin-only endpoint to retrieve all orders in the system
    // Includes: User's address and full name, product's name and price
    const orders = await Order.find()
      .populate({
        path: "orderItems.productId",
        select: "name price",
      })
      .populate({
        path: "userId",
        select: "fullName",
      });

    if (isAdmin) {
      res.json(orders);
    } else {
      res.status(404).render("404", { title: "Not Found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.setIO = setIO;
