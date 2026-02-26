const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, default: '' },
        icon: { type: String, default: '' },
        color: { type: String, default: '#C8973A' },
        coverImage: { type: String, default: '' },
        contentType: {
            type: String,
            enum: ['posts', 'museum', 'lessons', 'all'],
            default: 'posts',
        },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
