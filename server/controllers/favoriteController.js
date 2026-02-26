const User = require('../models/User');
const Post = require('../models/Post');
const Museum3D = require('../models/Museum3D');

// @POST /api/favorites/post/:id
const togglePostFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const postId = req.params.id;
        const idx = user.favorites.findIndex(f => f.toString() === postId);
        if (idx === -1) user.favorites.push(postId);
        else user.favorites.splice(idx, 1);
        await user.save();
        res.json({ saved: idx === -1, favorites: user.favorites });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @POST /api/favorites/museum/:id
const toggleMuseumFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const itemId = req.params.id;
        const idx = user.museum3dFavorites.findIndex(f => f.toString() === itemId);
        if (idx === -1) user.museum3dFavorites.push(itemId);
        else user.museum3dFavorites.splice(idx, 1);
        await user.save();
        res.json({ saved: idx === -1, favorites: user.museum3dFavorites });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/favorites
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({ path: 'favorites', select: 'title slug coverImage category createdAt', populate: { path: 'category', select: 'name slug' } })
            .populate({ path: 'museum3dFavorites', select: 'title previewImage category createdAt', populate: { path: 'category', select: 'name slug' } });
        res.json({ posts: user.favorites, museum: user.museum3dFavorites });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { togglePostFavorite, toggleMuseumFavorite, getFavorites };
