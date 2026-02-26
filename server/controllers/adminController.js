const User = require('../models/User');
const Post = require('../models/Post');
const Museum3D = require('../models/Museum3D');
const Lesson = require('../models/Lesson');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

// @GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const [users, posts, museum, lessons, categories, subscribers, orgs] = await Promise.all([
            User.countDocuments({ role: { $in: ['user', 'org'] } }),
            Post.countDocuments(),
            Museum3D.countDocuments(),
            Lesson.countDocuments(),
            Category.countDocuments(),
            User.countDocuments({ 'subscription.status': 'active' }),
            User.countDocuments({ role: 'org' }),
        ]);
        res.json({ users, posts, museum, lessons, categories, subscribers, orgs });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
        const total = await User.countDocuments(query);
        const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
        res.json({ users, total, pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/admin/users/:id
const updateUser = async (req, res) => {
    try {
        const { isActive, role, subscription } = req.body;
        const updates = {};
        if (isActive !== undefined) updates.isActive = isActive;
        if (role) updates.role = role;
        if (subscription) updates.subscription = subscription;
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot delete yourself' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @POST /api/admin/create-admin  (superadmin only)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email taken' });
        const admin = await User.create({ name, email, password, role: 'admin' });
        res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @POST /api/admin/upload-image  — generic image upload for posts
const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const streamifier = require('streamifier');
        const uploadToCloud = () => new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'oriki-ng/posts', transformation: [{ quality: 'auto' }] }, (err, result) => {
                if (err) reject(err); else resolve(result);
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        const result = await uploadToCloud();
        res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @DELETE /api/admin/delete-image
const deleteImage = async (req, res) => {
    try {
        const { public_id, resource_type = 'image' } = req.body;
        await cloudinary.uploader.destroy(public_id, { resource_type });
        res.json({ message: 'Image deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getStats, getUsers, updateUser, deleteUser, createAdmin, uploadImage, deleteImage };
