const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, trim: true },
        excerpt: { type: String, default: '' },
        body: { type: String, required: true },
        coverImage: { type: String, default: '' },
        images: [String],
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        tags: [String],
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['draft', 'published'], default: 'published' },
        featured: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isSubscriberOnly: { type: Boolean, default: false },
        audioUrl: { type: String, default: '' },
        videoUrl: { type: String, default: '' },
        readTime: { type: Number, default: 3 },
        language: { type: String, enum: ['en', 'yo'], default: 'en' },
    },
    { timestamps: true }
);

postSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);
