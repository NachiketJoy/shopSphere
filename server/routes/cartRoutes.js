const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");
const authenticateJWT = require("../middleware/authenticateJWT");

router.use(authenticateJWT);

router.post("/cart/add", cartController.addToCart);
router.get("/cart/items", cartController.getCartItems);
router.put("/cart/update/:id", cartController.updateCartItem);
router.delete("/cart/delete/:id", cartController.deleteCartItem);
router.delete("/cart/clear", cartController.clearCart);

router.get("/cart", authenticateJWT, (req, res) => {
  res.render("cart", { user: req.user });
});

module.exports = router;
