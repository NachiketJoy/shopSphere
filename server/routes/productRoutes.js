const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");

router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id/delete", productController.deleteProduct);

module.exports = router;
