const User = require('../models/User');

// @GET /api/subaccounts  — org gets its sub-accounts
const getSubAccounts = async (req, res) => {
    try {
        if (req.user.role !== 'org' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Org account required' });
        }
        const members = await User.find({ parentOrg: req.user._id }).select('-password');
        res.json(members);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @POST /api/subaccounts  — org creates a sub-account
const createSubAccount = async (req, res) => {
    try {
        if (req.user.role !== 'org') return res.status(403).json({ message: 'Org account required' });

        // Check seats
        const sub = req.user.subscription;
        const currentMembers = await User.countDocuments({ parentOrg: req.user._id });
        if (sub && sub.status === 'active' && currentMembers >= (sub.seats || 1)) {
            return res.status(400).json({ message: 'Seat limit reached. Upgrade your plan for more members.' });
        }

        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const member = await User.create({
            name, email, password,
            role: 'user',
            isSubAccount: true,
            parentOrg: req.user._id,
            subscription: {
                plan: req.user.subscription?.plan || 'individual',
                status: req.user.subscription?.status || 'inactive',
                startedAt: req.user.subscription?.startedAt,
                expiresAt: req.user.subscription?.expiresAt,
            },
        });

        res.status(201).json({ _id: member._id, name: member.name, email: member.email, createdAt: member.createdAt });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @DELETE /api/subaccounts/:id
const deleteSubAccount = async (req, res) => {
    try {
        const member = await User.findOne({ _id: req.params.id, parentOrg: req.user._id });
        if (!member) return res.status(404).json({ message: 'Member not found' });
        await member.deleteOne();
        res.json({ message: 'Sub-account removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getSubAccounts, createSubAccount, deleteSubAccount };
