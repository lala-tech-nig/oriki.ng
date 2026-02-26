const cloudinary = require('../config/cloudinary');
const Museum3D = require('../models/Museum3D');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const getAllMuseum = async (req, res) => {
    try {
        const { category, search, featured, page = 1, limit = 12 } = req.query;
        const query = { status: 'published' };
        if (category) query.category = category;
        if (featured) query.featured = true;
        if (search) query.title = { $regex: search, $options: 'i' };
        const total = await Museum3D.countDocuments(query);
        const items = await Museum3D.find(query)
            .populate('category', 'name slug')
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ items, total, pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMuseumById = async (req, res) => {
    try {
        const item = await Museum3D.findById(req.params.id).populate('category', 'name slug').populate('author', 'name avatar');
        if (!item) return res.status(404).json({ message: 'Not found' });
        item.views += 1;
        await item.save();
        res.json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const create3DItem = async (req, res) => {
    try {
        const { title, description, category, tags, annotations, era, origin, material, dimensions, curator, featured, isSubscriberOnly } = req.body;
        let modelUrl = '', modelPublicId = '', previewImage = '', previewPublicId = '';

        if (req.files?.model) {
            const result = await uploadToCloudinary(req.files.model[0].buffer, { resource_type: 'raw', folder: 'oriki-ng/museum3d', use_filename: true });
            modelUrl = result.secure_url;
            modelPublicId = result.public_id;
        }
        if (req.files?.preview) {
            const result = await uploadToCloudinary(req.files.preview[0].buffer, { resource_type: 'image', folder: 'oriki-ng/museum-previews', transformation: [{ quality: 'auto' }] });
            previewImage = result.secure_url;
            previewPublicId = result.public_id;
        }

        const parsedAnnotations = typeof annotations === 'string' ? JSON.parse(annotations) : annotations || [];
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags || [];

        const item = await Museum3D.create({
            title, description, modelUrl, modelPublicId, previewImage, previewPublicId,
            category, tags: parsedTags, annotations: parsedAnnotations, era, origin, material, dimensions, curator,
            featured, isSubscriberOnly, author: req.user._id,
        });
        res.status(201).json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const update3DItem = async (req, res) => {
    try {
        const updates = req.body;
        if (typeof updates.annotations === 'string') updates.annotations = JSON.parse(updates.annotations);
        if (typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
        const item = await Museum3D.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const delete3DItem = async (req, res) => {
    try {
        const item = await Museum3D.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        if (item.modelPublicId) await cloudinary.uploader.destroy(item.modelPublicId, { resource_type: 'raw' });
        if (item.previewPublicId) await cloudinary.uploader.destroy(item.previewPublicId);
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const toggleMuseumLike = async (req, res) => {
    try {
        const item = await Museum3D.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        const idx = item.likes.indexOf(req.user._id);
        if (idx === -1) item.likes.push(req.user._id);
        else item.likes.splice(idx, 1);
        await item.save();
        res.json({ likes: item.likes.length, liked: idx === -1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllMuseum, getMuseumById, create3DItem, update3DItem, delete3DItem, toggleMuseumLike };
