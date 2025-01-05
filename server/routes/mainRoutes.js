const express = require('express');
const router = express.Router();
const mainController = require('../controller/mainController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.get('/account', authenticateJWT, mainController.account);

router.get('/user/:id/block', mainController.blockUser);

// Route to delete a user
router.get('/user/:id/delete', mainController.deleteUser);

// admin
router.get('/dashboard', authenticateJWT, mainController.allUsers);

module.exports = router;