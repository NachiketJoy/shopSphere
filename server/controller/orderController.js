const OrderItem = require("../models/orderModels");
const Auth = require('../models/authModels');
const User = require('../models/userModels');  

exports.allOrders = async (req, res) => {
    try {
        const admin_login_email = process.env.ADMIN_LOGIN_EMAIL;
        const orders = await OrderItem.find()
        .populate({
            path: 'userId',
            select: 'authId address',
            populate: {
                path: 'authId',
                select: 'fullName',
            }
        })
        .populate({
            path: 'orderItems.productId',
            select: 'name price',
        });
        const users = await Auth.find();
        const adminUser = users.find(user => user.email === admin_login_email);
        const isAdmin = adminUser.email === req.user.email;

        if (isAdmin) {
            res.json(orders);
        } else {
            res.status(404).render('404', { title: 'Not Found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}