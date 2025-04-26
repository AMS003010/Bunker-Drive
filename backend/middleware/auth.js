const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const userIdFromClient = req.headers['x-user-id'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!userIdFromClient) {
            return res.status(403).json({ error: 'No User Id provided' });
        } 

        if (userIdFromClient && userIdFromClient !== decoded.userId) {
            return res.status(403).json({ error: 'User ID mismatch' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = {
    protect
};