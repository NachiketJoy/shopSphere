const Auth = require('../models/authModels');
const jwt = require('jsonwebtoken');

exports.account = async (req, res) => {
    try {
        const user = req.user;
        res.render('account', { title: 'Account', user });
    } catch (err) {
        console.error('Error rendering account:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.allUsers = async (req, res) => {
    try {
        const users = await Auth.find();
        const adminUser = users.find(user => user.email === 'njoyekurun@gmail.com');
        const isAdmin = adminUser.email === req.user.email;

        if (isAdmin) {
            res.render('dashboard', { title: 'Dashboard', users });
        } else {
            res.status(403).render('404', { title: 'Forbidden' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await Auth.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await Auth.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};