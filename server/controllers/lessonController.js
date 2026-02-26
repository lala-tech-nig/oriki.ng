const Lesson = require('../models/Lesson');

const getLessons = async (req, res) => {
    try {
        const { level, category, page = 1, limit = 20 } = req.query;
        const query = { status: 'published' };
        if (level) query.level = level;
        if (category) query.category = category;
        const total = await Lesson.countDocuments(query);
        const lessons = await Lesson.find(query)
            .sort({ level: 1, lessonNumber: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ lessons, total, pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Not found' });
        lesson.views += 1;
        await lesson.save();
        res.json(lesson);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getLessonBySlug = async (req, res) => {
    try {
        const lesson = await Lesson.findOne({ slug: req.params.slug });
        if (!lesson) return res.status(404).json({ message: 'Not found' });
        lesson.views += 1;
        await lesson.save();
        res.json(lesson);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const createLesson = async (req, res) => {
    try {
        const lesson = await Lesson.create({ ...req.body, author: req.user._id });
        res.status(201).json(lesson);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(lesson);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteLesson = async (req, res) => {
    try {
        await Lesson.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getLessons, getLessonById, getLessonBySlug, createLesson, updateLesson, deleteLesson };
