const express = require("express");
const router = express.Router();
const mainController = require("../controller/mainController");
const authenticateJWT = require("../middleware/authenticateJWT");

// account page
router.get("/account", authenticateJWT, mainController.account);

// contact page
router.get("/contact", authenticateJWT, mainController.contact);
router.post('/contact-us', mainController.contactMsg);
router.get("/order", authenticateJWT, mainController.order);

// admin
router.get("/dashboard", authenticateJWT, mainController.allUsers);

router.get("/user/:id/block", mainController.blockUser);

router.get("/user/:id/delete", mainController.deleteUser);

module.exports = router;
