const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subscriptionSchema = new mongoose.Schema({
    plan: { type: String, enum: ['individual', 'org_bulk'], default: 'individual' },
    status: { type: String, enum: ['active', 'inactive', 'expired', 'cancelled'], default: 'inactive' },
    startedAt: Date,
    expiresAt: Date,
    paystackRef: String,
    seats: { type: Number, default: 1 },
    priceUSD: Number,
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ['user', 'org', 'admin', 'superadmin'], default: 'user' },
        avatar: { type: String, default: '' },
        bio: { type: String, default: '' },
        phone: { type: String, default: '' },
        // Organisation fields
        orgName: { type: String, default: '' },
        orgCode: { type: String, unique: true, sparse: true },
        parentOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        isSubAccount: { type: Boolean, default: false },
        subscription: subscriptionSchema,
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
        museum3dFavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Museum3D' }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
