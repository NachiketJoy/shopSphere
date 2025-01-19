const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.get("/orders", authenticateJWT, orderController.allOrders);

module.exports = router;