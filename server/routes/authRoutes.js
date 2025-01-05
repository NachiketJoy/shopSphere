const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authenticateJWT = require('../middleware/authenticateJWT');

// Authentication user
router.get('/', authController.authentication);

// Handle User Registration
router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.get('/homepage', authenticateJWT, authController.homepage);

router.get('/forgot-password', authController.forgotPassword);

// send reset link
router.post('/forgot-password', authController.sendResetLink);

// password reset
router.get('/reset-password', authController.resetPasswordPage);

// update password
router.post('/reset-password', authController.resetPassword);

module.exports = router;