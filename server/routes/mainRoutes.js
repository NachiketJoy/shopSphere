const express = require('express');
const router = express.Router();
const mainController = require('../controller/mainController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.get('/account', authenticateJWT, mainController.account);

router.get('/order', authenticateJWT, mainController.order);

router.get('/user/:id/block', mainController.blockUser);

router.get('/user/:id/delete', mainController.deleteUser);

router.get('/contact', authenticateJWT, mainController.contact);

// admin
router.get('/dashboard', authenticateJWT, mainController.allUsers);

module.exports = router;