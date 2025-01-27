const jwt = require("jsonwebtoken");
const Auth = require("../models/authModels");

/**
 * Middleware function to authenticate JWT tokens
 * This function verifies if the user is authenticated before allowing access to protected routes
 */
function authenticateJWT(req, res, next) {
  // Get the secret key from environment variables
  const secret_key = process.env.SECRET_KEY;

  // Extract the JWT token from cookies
  const token = req.cookies.auth_token;

  // If no token exists, redirect to login page
  if (!token) {
    return res.redirect("/");
  }

  // Verify the JWT token
  jwt.verify(token, secret_key, async (err, decoded) => {
    // If token verification fails, redirect to login page
    if (err) {
      return res.redirect("/");
    }

    try {
      // Find user in database using the decoded user ID from the token
      const user = await Auth.findById(decoded.userId);

      // If user doesn't exist in database, redirect to login page
      if (!user) {
        return res.redirect("/");
      }

      // Attach user object to request for use in subsequent middleware/routes
      req.user = user;

      // Continue to next middleware/route handler
      next();
    } catch (err) {
      // If database query fails, send error response
      res.status(500).json({ message: err.message });
    }
  });
}

module.exports = authenticateJWT;