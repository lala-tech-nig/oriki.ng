const express = require('express');
const router = express.Router();
const { getFavorites, togglePostFavorite, toggleMuseumFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFavorites);
router.post('/post/:id', protect, togglePostFavorite);
router.post('/museum/:id', protect, toggleMuseumFavorite);

module.exports = router;
