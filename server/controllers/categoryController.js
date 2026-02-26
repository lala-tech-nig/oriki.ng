const Category = require('../models/Category');

const getCategories = async (req, res) => {
    try {
        const cats = await Category.find({ isActive: true }).sort('sortOrder name');
        res.json(cats);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getCategoryBySlug = async (req, res) => {
    try {
        const cat = await Category.findOne({ slug: req.params.slug });
        if (!cat) return res.status(404).json({ message: 'Category not found' });
        res.json(cat);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const createCategory = async (req, res) => {
    try {
        const { name, description, icon, color, coverImage, contentType, sortOrder } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const exists = await Category.findOne({ slug });
        if (exists) return res.status(400).json({ message: 'Category already exists' });
        const cat = await Category.create({ name, slug, description, icon, color, coverImage, contentType, sortOrder, createdBy: req.user._id });
        res.status(201).json(cat);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateCategory = async (req, res) => {
    try {
        const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cat) return res.status(404).json({ message: 'Category not found' });
        res.json(cat);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
