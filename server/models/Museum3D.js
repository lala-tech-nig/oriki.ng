const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
    label: { type: String, required: true },
    description: { type: String, default: '' },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
    },
    image: { type: String, default: '' },
});

const museum3DSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        modelUrl: { type: String, required: true },
        modelPublicId: { type: String, default: '' },
        previewImage: { type: String, default: '' },
        previewPublicId: { type: String, default: '' },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        tags: [String],
        annotations: [annotationSchema],
        era: { type: String, default: '' },
        origin: { type: String, default: '' },
        material: { type: String, default: '' },
        dimensions: { type: String, default: '' },
        curator: { type: String, default: '' },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        featured: { type: Boolean, default: false },
        isSubscriberOnly: { type: Boolean, default: true },
        views: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        fileSize: { type: String, default: '' },
        fileFormat: { type: String, default: 'glb' },
        status: { type: String, enum: ['draft', 'published'], default: 'published' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Museum3D', museum3DSchema);
