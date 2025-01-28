const Auth = require("../models/authModels");
const Order = require("../models/orderModels");

// Handle the user account page
exports.account = async (req, res) => {
    try {
        // Retrieves the user's information
        const user = req.user;
        res.render("account", { title: "Account", user });
    } catch (err) {
        console.error("Error rendering account:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.order = async (req, res) => {
    try {
        const user = req.user;
        // Orders are populated with product details and sorted by date (newest first)
        const orders = await Order.find({ userId: req.user._id })
        .populate("orderItems.productId")
        .sort({ orderedAt: -1 });
        res.render("order", { title: "Order History", user, orders });
    } catch (err) {
        console.error("Error rendering account:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Fetch all users for admin dashboard
exports.allUsers = async (req, res) => {
  try {
    // Check if the current user is an admin by comparing their email with the admin email
    const admin_login_email = process.env.ADMIN_LOGIN_EMAIL;
    const users = await Auth.find();
    const adminUser = users.find((user) => user.email === admin_login_email);
    const isAdmin = adminUser.email === req.user.email;
    const message = req.flash("message") || "";

    if (isAdmin) {
      res.render("dashboard", { title: "Dashboard", users, message });
    } else {
      res.status(404).render("404", { title: "Not Found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Handle user deletion (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Find and delete a user by their ID
    const user = await Auth.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // After deletion, redirects back to the dashboard
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Handle blocking/unblocking users
exports.blockUser = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Renders the contact page
exports.contact = async (req, res) => {
  try {
    const user = req.user;
    res.render("contact", { title: "Contact", user });
  } catch (err) {
    console.error("Error rendering contact page:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
