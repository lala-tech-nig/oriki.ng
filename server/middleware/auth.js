const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid or expired' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: 'Super admin access required' });
    }
};

const subscribedOnly = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const sub = req.user.subscription;
    const now = new Date();

    if (
        req.user.role === 'admin' ||
        req.user.role === 'superadmin' ||
        (sub && sub.status === 'active' && sub.expiresAt && new Date(sub.expiresAt) > now)
    ) {
        next();
    } else {
        res.status(403).json({ message: 'Active subscription required', requiresSubscription: true });
    }
};

module.exports = { protect, adminOnly, superAdminOnly, subscribedOnly };
