const CartItem = require("../models/cartItemsModels");
const Product = require("../models/productModels");

// Add item to cart controller
exports.addToCart = async (req, res) => {
  try {
    // Extract productId from request body and user ID from authenticated user
    const { productId } = req.body;
    const authId = req.user._id;

    // Verify if the product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const availableStock = product.quantity;

    // Check if the item is already in user's cart
    let cartItem = await CartItem.findOne({ authId, productId });

    if (cartItem) {
      // If the current quantity in cart exceeds available stock
      if (cartItem.quantity >= availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than ${availableStock} of this product.`,
        });
      }

      // increment quantity by 1
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      // If item doesn't exist, create new cart item
      cartItem = await CartItem.create({
        authId,
        productId,
        quantity: 1,
      });
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all items in user's cart
exports.getCartItems = async (req, res) => {
  try {
    // Find all cart items for the authenticated user and populate product details
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

// Update quantity of a cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;

    // Ensure quantity is valid
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Find and update the cart item
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

// Remove a specific item from cart
exports.deleteCartItem = async (req, res) => {
  try {
    // Find and delete the specified cart item
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      authId: req.user._id,
    });

    // Verify the cart item in the authenticated user's cart
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

// Remove all items from user's cart
exports.clearCart = async (req, res) => {
  try {
    // Delete all cart items for the authenticated user
    await CartItem.deleteMany({ authId: req.user._id });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
