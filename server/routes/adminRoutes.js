const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getStats, getUsers, updateUser, deleteUser, createAdmin, uploadImage, deleteImage } = require('../controllers/adminController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.post('/create-admin', protect, superAdminOnly, createAdmin);
router.post('/upload-image', protect, adminOnly, upload.single('image'), uploadImage);
router.delete('/delete-image', protect, adminOnly, deleteImage);

module.exports = router;
