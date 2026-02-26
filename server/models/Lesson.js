const mongoose = require('mongoose');

const phraseSchema = new mongoose.Schema({
    yoruba: { type: String, required: true },
    english: { type: String, required: true },
    pronunciation: { type: String, default: '' },
    audioUrl: { type: String, default: '' },
    example: { type: String, default: '' },
});

const lessonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, sparse: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        lessonNumber: { type: Number, default: 1 },
        description: { type: String, default: '' },
        coverImage: { type: String, default: '' },
        content: { type: String, default: '' },
        phrases: [phraseSchema],
        audioUrl: { type: String, default: '' },
        videoUrl: { type: String, default: '' },
        category: { type: String, enum: ['greetings', 'numbers', 'colors', 'family', 'proverbs', 'grammar', 'culture', 'misc'], default: 'misc' },
        isSubscriberOnly: { type: Boolean, default: false },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['draft', 'published'], default: 'published' },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

lessonSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    next();
});

module.exports = mongoose.model('Lesson', lessonSchema);
