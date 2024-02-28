
const userController = require('../userControllers/userControllers')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

const loadLogin = async (req, res) => {
    try {
        const err = req.session.err_msg;
        req.session.err_msg = null;
        res.render('login', { message: err });
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch && userData.is_admin === 1) {
                req.session.admin = userData._id;
                res.redirect('/admin/dashboard');
            } else {
                req.session.err_msg = 'Authentication denied';
                res.redirect('/admin');
            }
        } else {
            req.session.err_msg = 'Authentication denied';
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
};

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
};

const loadDashboard = async (req, res) => {
    try {
        if (req.session.admin) {
            // Admin is authenticated, render the dashboard
            res.render('dashboard');
        } else {
            // Admin is not authenticated, redirect to login page or handle accordingly
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
}



const loadUserDashboard = async (req, res) => {
    try {
        const adminData = await User.findById(req.session.admin);
        const userData = await User.find({
            is_admin: 0
        });
        res.render('userDashboard', { users: userData, admin: adminData });
    } catch (error) {
        console.log(error.message);
    }
};

const listUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userValue = await User.findById(id);

        if (!userValue) {
            return res.status(404).send('User not found');
        }

        // Toggle the isActive status
        await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    isActive: !userValue.isActive
                }
            },
            { new: true }
        );

        // If the user is blocked, destroy the session
        if (!userValue.isActive && req.session.user_id) {
            // Clear the session and destroy it
            req.session.destroy(err => {
                if (err) {
                    console.log('Error destroying session:', err);
                } else {
                    console.log('Session destroyed successfully');
                }
            });
        }

        // Redirect to the appropriate page
        return res.redirect(userValue.isActive ? '/admin/userDashboard' : '/login');
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, e.g., redirect to an error page
        return res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUserDashboard,
    listUser,
    logout
};
