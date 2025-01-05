const Auth = require('../models/authModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.authentication = async (req, res) => {
    try {
        // const message = req.query.message || null;
        const messages = {
            success: req.flash('success') || null,
            error: req.flash('error') || null
        };
        res.render('authentication', { title: 'Login/ Signup', messages })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

exports.register = async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const userExists = await Auth.findOne({ email });
        if (userExists) {
            req.flash('error', 'User already exists');
            throw new Error(`User with email ${email} already exists`);
            // return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Auth({
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        // res.status(201).json({ message: "User registered successfully" });
        req.flash('success', 'User registered successfully!');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.status(500).json({ message: err.message });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const secret_key = process.env.SECRET_KEY;
    try {
        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isBlocked) {
            return res.status(403).send('Your account has been blocked');
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, secret_key, { expiresIn: '1h' });
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 });

        if (user.email === 'njoyekurun@gmail.com') {
            res.redirect('/dashboard');
        } else {
            res.redirect('/homepage');
        }

        // res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('auth_token');
    res.redirect('/');
}

exports.forgotPassword = async (req, res) => {
    res.render('resetPassword', { title: 'Forgot Password' });
}

exports.sendResetLink = async (req, res) => {
    const { email } = req.body;
    const admin_email = process.env.ADMIN_EMAIL;
    const admin_password = process.env.ADMIN_PASSWORD;

    try {
        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(400).send('User with that email does not exist.');
        }

        // Generate a random token and hash it
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = bcrypt.hashSync(resetToken, 10);

        // Store the hashed token and expiration time in the database
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

        // Set up the email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: admin_email, //  Gmail address
                pass: admin_password,   //  Gmail app password 
            }
        });

        // Send the password reset email
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset Request',
            text: `Click the following link to reset your password: ${resetUrl}`
        });

        res.send('Password reset link has been sent to your email.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong.');
    }
};

exports.resetPasswordPage = async (req, res) => {
    const { token, email } = req.query;

    try {
        const user = await Auth.findOne({ email });
        if (!user || !user.passwordResetToken) {
            return res.status(400).send('Invalid reset request.');
        }

        const isValidToken = bcrypt.compareSync(token, user.passwordResetToken);
        if (!isValidToken || user.passwordResetExpires < Date.now()) {
            return res.status(400).send('Reset token is invalid or has expired.');
        }

        res.render('resetPassword', { title: 'Reset Password', email, token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong.');
    }
}

exports.resetPassword = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Auth.findOne({ email });
        if (!user || !user.passwordResetToken) {
            return res.status(400).send('Invalid reset request.');
        }

        const isValidToken = bcrypt.compareSync(req.body.token, user.passwordResetToken);
        if (!isValidToken || user.passwordResetExpires < Date.now()) {
            return res.status(400).send('Reset token is invalid or has expired.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.passwordResetToken = undefined; // Clear reset token
        user.passwordResetExpires = undefined; // Clear expiry time
        await user.save();

        res.send('Password has been successfully reset.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong.');
    }
}

exports.homepage = async (req, res) => {
    try {
        const user = req.user;
        res.render('homepage', { title: 'Home', user });
    } catch (err) {
        console.error('Error rendering homepage:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}