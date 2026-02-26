const express = require('express');
const router = express.Router();
const { getPosts, getPostById, getPostBySlug, createPost, updatePost, deletePost, toggleLike } = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPostById);
router.post('/', protect, adminOnly, createPost);
router.put('/:id', protect, adminOnly, updatePost);
router.delete('/:id', protect, adminOnly, deletePost);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
