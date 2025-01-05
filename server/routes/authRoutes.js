const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authenticateJWT = require('../middleware/authenticateJWT');

// Authentication user page
router.get('/', authController.authentication);

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.get('/homepage', authenticateJWT, authController.homepage);

// forgot and reset password 
router.get('/forgot-password', authController.forgotPassword);

router.post('/forgot-password', authController.sendResetLink);

router.get('/reset-password', authController.resetPasswordPage);

router.post('/reset-password', authController.resetPassword);

// update password (admin)
router.post('/update-password', authenticateJWT, authController.updatePassword);

module.exports = router;