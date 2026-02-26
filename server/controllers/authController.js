const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role, orgName } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const userData = { name, email, password };
        if (role === 'org') {
            userData.role = 'org';
            userData.orgName = orgName || name;
            userData.orgCode = 'ORG-' + Date.now();
        }

        const user = await User.create(userData);
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, subscription: user.subscription },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!user.isActive) return res.status(403).json({ message: 'Account disabled. Contact admin.' });

        const token = generateToken(user._id);
        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, subscription: user.subscription, orgName: user.orgName, orgCode: user.orgCode },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password').populate('parentOrg', 'name orgName');
    res.json(user);
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const updates = (({ name, bio, phone, avatar }) => ({ name, bio, phone, avatar }))(req.body);
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @PUT /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (!(await user.matchPassword(oldPassword))) return res.status(400).json({ message: 'Incorrect current password' });
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
