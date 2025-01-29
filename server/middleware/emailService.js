const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config(); 
  // Admin credentials for sending and receiving emails
const admin_email = process.env.ADMIN_EMAIL;
const admin_email_password = process.env.ADMIN_EMAIL_PASSWORD;

// Configure email service using admin credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: admin_email, // Gmail Address
        pass: admin_email_password, // Gmail Password
    }
});

module.exports = transporter;