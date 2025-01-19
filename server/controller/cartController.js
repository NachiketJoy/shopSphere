const CartItem = require("../models/cartItemsModels");
const Product = require("../models/productModels");

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const authId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({ authId, productId });

    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      // Create new cart item if it doesn't exist
      cartItem = await CartItem.create({
        authId,
        productId,
        quantity: 1,
      });
    }

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCartItems = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ authId: req.user._id }).populate(
      "productId"
    );

    res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      authId: req.user._id,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      authId: req.user._id,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await CartItem.deleteMany({ authId: req.user._id });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
