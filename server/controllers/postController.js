const Post = require('../models/Post');

const getPosts = async (req, res) => {
    try {
        const { category, tag, search, featured, page = 1, limit = 12, status } = req.query;
        const query = {};
        if (status) query.status = status; else query.status = 'published';
        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag] };
        if (featured) query.featured = true;
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { body: { $regex: search, $options: 'i' } },
        ];
        const total = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .populate('category', 'name slug color')
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ posts, total, pages: Math.ceil(total / limit), page: Number(page) });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('category', 'name slug color icon').populate('author', 'name avatar');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.views += 1;
        await post.save();
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug }).populate('category', 'name slug color icon').populate('author', 'name avatar');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.views += 1;
        await post.save();
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const createPost = async (req, res) => {
    try {
        const post = await Post.create({ ...req.body, author: req.user._id });
        res.status(201).json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Not found' });
        const idx = post.likes.indexOf(req.user._id);
        if (idx === -1) post.likes.push(req.user._id);
        else post.likes.splice(idx, 1);
        await post.save();
        res.json({ likes: post.likes.length, liked: idx === -1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost, toggleLike };
