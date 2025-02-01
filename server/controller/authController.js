const Auth = require("../models/authModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailTransporter = require('../middleware/emailService')
const crypto = require("crypto");

/**
 * Admin Authentication
 * This function handles the initial admin setup and authentication page rendering
 * - Checks if admin exists, if not creates default admin account
 * - Uses environment variables for admin credentials
 * - Renders the authentication page with success/error messages
 */
exports.authentication = async (req, res) => {
  try {
    const admin_password = process.env.ADMIN_PASSWORD;
    const admin_login_email = process.env.ADMIN_LOGIN_EMAIL;
    const messages = {
      success: req.flash("success") || null,
      error: req.flash("error") || null,
    };

    // Check if admin exists, if not create default admin account
    const adminExists = await Auth.findOne({ email: admin_login_email });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(admin_password, 10);

      const admin = new Auth({
        email: admin_login_email,
        password: hashedPassword,
        fullName: "Admin",
      });

      await admin.save();
    }

    res.render("authentication", { title: "Login/ Signup", messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// User Registration Controller
exports.register = async (req, res) => {
  // Extract user input from request body
  const { email, password, fullName } = req.body;

  // Input validation - Check if all required fields are provided
  if (!fullName || !email || !password) {
    req.flash("error", "All fields are required");
    return res.redirect("/");
  }

  try {
    // Check if user already exists in database by email
    const userExists = await Auth.findOne({ email });
    if (userExists) {
      req.flash("error", "User already exists");
      return res.redirect("/"); // Redirect back if user exists
    }

    // Hash the password for security before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user instance with provided data
    const newUser = new Auth({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the new user to database
    await newUser.save();

    // Set success message and redirect
    req.flash("success", "User registered successfully!");
    res.redirect("/");
  } catch (err) {
    // Error handling
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.status(500).json({ message: err.message });
  }
};

// Login Controller for both admin and users
exports.login = async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Get environment variables
  const secret_key = process.env.SECRET_KEY; // JWT secret key
  const admin_login_email = process.env.ADMIN_LOGIN_EMAIL; // Admin email from env

  try {
    // Find user in database by email
    const user = await Auth.findOne({ email });

    // If user doesn't exist, flash error message and redirect to login page
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    // Check if user account is blocked
    if (user.isBlocked) {
      return res.status(403).send("Your account has been blocked");
    }

    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/");
    }

    // Generate JWT token valid for 1 hour
    const token = jwt.sign({ userId: user._id }, secret_key, {
      expiresIn: "1h",
    });

    // Set token in HTTP-only cookie
    res.cookie("auth_token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour in milliseconds

    // Redirect based on user type:
    // If email matches admin email -> redirect to admin dashboard
    // Otherwise -> redirect to user homepage
    if (user.email === admin_login_email) {
      res.redirect("/dashboard"); // Admin Route
    } else {
      res.redirect("/homepage"); // User Route
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Logout Controller for both admin and users
 * This controller function handles the logout process by:
 * 1. Clearing the authentication cookie
 * 2. Redirecting to the home page
 **/
exports.logout = async (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/");
};

// Renders the initial forgot password page
exports.forgotPassword = async (req, res) => {
  res.render("resetPassword", { title: "Forgot Password" });
};

// Handles the password reset link request
exports.sendResetLink = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists in database
    const user = await Auth.findOne({ email });
    if (!user) {
      req.flash("error", "User with that email does not exist.");
      return res.redirect("/");
    }

    // Generate reset token for security
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = bcrypt.hashSync(resetToken, 10);

    // Save token and expiration time (1 hour from now) to user record
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour in milliseconds
    await user.save();

    // Create reset URL with token and email
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

    // Send reset email to user
    await mailTransporter.sendMail({
      to: email,
      subject: "ShopShere: Password Reset Request",
      text: `Click the following link to reset your password: ${resetUrl}`,
    });

    req.flash("success", "Password reset link has been sent to your email");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
};

// Validates reset token and renders reset password page
exports.resetPasswordPage = async (req, res) => {
  const { token, email } = req.query;

  try {
    // Verify user and token existence
    const user = await Auth.findOne({ email });
    if (!user || !user.passwordResetToken) {
      return res.status(400).render("400", { title: "Invalid reset request" });
    }

    // Validate token and check expiration
    const isValidToken = bcrypt.compareSync(token, user.passwordResetToken);
    if (!isValidToken || user.passwordResetExpires < Date.now()) {
      return res
        .status(400)
        .render("400", { title: "Reset token is invalid or has expired" });
    }

    res.render("resetPassword", { title: "Reset Password", email, token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
};

// Processes the actual password reset
exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verify user and token existence
    const user = await Auth.findOne({ email });
    if (!user || !user.passwordResetToken) {
      return res.status(400).render("400", { title: "Invalid reset request" });
    }

    // Validate token and check expiration
    const isValidToken = bcrypt.compareSync(
      req.body.token,
      user.passwordResetToken
    );
    if (!isValidToken || user.passwordResetExpires < Date.now()) {
      return res
        .status(400)
        .render("400", { title: "Reset token is invalid or has expired" });
    }

    // Update password and clear reset token data
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    req.flash("success", "Password has been successfully reset.");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
};

// Password Update Controller for admin only
exports.updatePassword = async (req, res) => {
  // Extract old and new passwords from request body
  const { currentPassword, newPassword } = req.body;
  // Get admin user ID from the authenticated session
  const userId = req.user._id;

  try {
    // Find the admin user in the database by ID
    const user = await Auth.findById(userId);

    // Compare the provided old password with the stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // If passwords don't match, set error message
      return res.json({ success: false, message: "Current password is incorrect" });
    }

    // Check if old and new passwords are the same
    if (currentPassword === newPassword) {
      // Prevent using the same password
      return res.json({ success: false, message: "Your current password cannot be your new password" });
    }

    // Hash the new password before saving
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // Update user's password in the database
    user.password = hashedNewPassword;
    await user.save();
    
    // Set success message
    return res.json({ success: true, message: "Password updated successfully" });

  } catch (err) {
    // Handle any errors during the process
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
};

// Homepage Rendering
exports.homepage = async (req, res) => {
  try {
    // Get user information from the authenticated session
    const user = req.user;
    // Render the homepage view with user data
    res.render("homepage", { 
      title: "Home", // Page title
      user // Pass user data to the view
    });
  } catch (err) {
    // Handle any errors during rendering
    console.error("Error rendering homepage:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};