const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");

// Get all products
router.get("/products", productController.getProducts);

// Get product by id
router.get("/products/:id", productController.getProductById);

// Create a new product
router.post("/products", productController.createProduct);

// Update product by id
router.put("/products/:id", productController.updateProduct);

// Delete product by id
router.delete("/products/:id/delete", productController.deleteProduct);

module.exports = router;
