const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const authenticateJWT = require("../middleware/authenticateJWT");

router.use(authenticateJWT);

router.post("/orders", orderController.createOrder);
router.delete("/orders/:orderId", orderController.cancelOrder);
router.get("/orders/:orderId/status", orderController.getOrderStatus);
router.get("/orders", orderController.getAllOrders);

router.get("/checkout", authenticateJWT, (req, res) => {
  res.render("checkout", {
    user: req.user,
    title: "Checkout",
  });
});

module.exports = router;
