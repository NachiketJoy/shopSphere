const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const authenticateJWT = require("../middleware/authenticateJWT");

router.use(authenticateJWT);

// Create a new order
router.post("/orders", orderController.createOrder);

// Get order status
router.get("/orders/:orderId/status", orderController.getOrderStatus);

// Get all orders for an authenticated user
router.get("/orders", orderController.getAllOrders);

// Get all orders for admin
router.get("/admin/orders", authenticateJWT, orderController.allOrders);

// Checkout page
router.get("/checkout", authenticateJWT, (req, res) => {
  res.render("checkout", {
    user: req.user,
    title: "Checkout",
  });
});

module.exports = router;
