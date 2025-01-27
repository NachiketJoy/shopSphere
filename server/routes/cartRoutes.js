const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");
const authenticateJWT = require("../middleware/authenticateJWT");

router.use(authenticateJWT);

// Add a new item into cart
router.post("/cart/add", cartController.addToCart);

// Get all cart items
router.get("/cart/items", cartController.getCartItems);

// Update cart item
router.put("/cart/update/:id", cartController.updateCartItem);

// Delete cart item
router.delete("/cart/delete/:id", cartController.deleteCartItem);

// Clear all items in cart
router.delete("/cart/clear", cartController.clearCart);

router.get("/cart", authenticateJWT, (req, res) => {
  res.render("cart", { user: req.user });
});

module.exports = router;
