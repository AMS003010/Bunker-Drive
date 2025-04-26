const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwt');

const googleLogin = async (req, res) => {
    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
    }
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, name });
        }
        const token = generateToken(user._id);
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Google login failed:", err);
        res.status(500).json({ error: 'Google login failed' });
    }
};

module.exports = {
    googleLogin
};