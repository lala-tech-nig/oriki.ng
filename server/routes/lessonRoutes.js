const express = require('express');
const router = express.Router();
const { getLessons, getLessonById, getLessonBySlug, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getLessons);
router.get('/slug/:slug', getLessonBySlug);
router.get('/:id', getLessonById);
router.post('/', protect, adminOnly, createLesson);
router.put('/:id', protect, adminOnly, updateLesson);
router.delete('/:id', protect, adminOnly, deleteLesson);

module.exports = router;
