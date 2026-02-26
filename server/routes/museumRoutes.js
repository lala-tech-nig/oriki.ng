const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllMuseum, getMuseumById, create3DItem, update3DItem, delete3DItem, toggleMuseumLike } = require('../controllers/museumController');
const { protect, adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB

router.get('/', getAllMuseum);
router.get('/:id', getMuseumById);
router.post(
    '/',
    protect,
    adminOnly,
    upload.fields([{ name: 'model', maxCount: 1 }, { name: 'preview', maxCount: 1 }]),
    create3DItem
);
router.put('/:id', protect, adminOnly, update3DItem);
router.delete('/:id', protect, adminOnly, delete3DItem);
router.post('/:id/like', protect, toggleMuseumLike);

module.exports = router;
