const jwt = require('jsonwebtoken');
const Auth = require('../models/authModels');

function authenticateJWT(req, res, next) {
    const secret_key = process.env.SECRET_KEY;
    const token = req.cookies.auth_token;

    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, secret_key, async (err, decoded) => {
        if (err) {
            return res.redirect('/');
        }

        try {
            const user = await Auth.findById(decoded.userId);
            if (!user) {
                return res.redirect('/');
            }
            req.user = user
            next();
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
}

module.exports = authenticateJWT;