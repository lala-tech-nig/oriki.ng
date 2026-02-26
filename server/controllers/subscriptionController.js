const User = require('../models/User');
const axios = require('axios');

const PLAN_PRICE_USD = 20;
const PAYSTACK_API = 'https://api.paystack.co';

// @POST /api/subscriptions/initiate  — start Paystack payment
const initiatePayment = async (req, res) => {
    try {
        const { plan = 'individual', seats = 1 } = req.body;
        const user = req.user;
        const amount = plan === 'org_bulk' ? PLAN_PRICE_USD * 100 * seats : PLAN_PRICE_USD * 100; // cents USD

        const response = await axios.post(
            `${PAYSTACK_API}/transaction/initialize`,
            {
                email: user.email,
                amount,
                currency: 'USD',
                metadata: { userId: user._id.toString(), plan, seats },
                callback_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
            },
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );

        res.json({ authorization_url: response.data.data.authorization_url, reference: response.data.data.reference });
    } catch (err) {
        res.status(500).json({ message: err.response?.data?.message || err.message });
    }
};

// @POST /api/subscriptions/verify  — verify after Paystack redirect
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.body;
        const response = await axios.get(`${PAYSTACK_API}/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        });
        const data = response.data.data;

        if (data.status !== 'success') return res.status(400).json({ message: 'Payment not successful' });

        const { userId, plan, seats } = data.metadata;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const user = await User.findByIdAndUpdate(
            userId || req.user._id,
            {
                'subscription.plan': plan,
                'subscription.status': 'active',
                'subscription.startedAt': now,
                'subscription.expiresAt': expiresAt,
                'subscription.paystackRef': reference,
                'subscription.seats': seats || 1,
                'subscription.priceUSD': data.amount / 100,
            },
            { new: true }
        ).select('-password');

        res.json({ message: 'Subscription activated', user, expiresAt });
    } catch (err) {
        res.status(500).json({ message: err.response?.data?.message || err.message });
    }
};

// @GET /api/subscriptions/status  — get countdown
const getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('subscription');
        const sub = user.subscription;
        if (!sub || sub.status !== 'active') return res.json({ active: false, daysLeft: 0, hoursLeft: 0, minutesLeft: 0 });

        const now = Date.now();
        const expiresAt = new Date(sub.expiresAt).getTime();
        const msLeft = expiresAt - now;

        if (msLeft <= 0) {
            await User.findByIdAndUpdate(req.user._id, { 'subscription.status': 'expired' });
            return res.json({ active: false, daysLeft: 0, hoursLeft: 0, minutesLeft: 0 });
        }

        const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

        res.json({ active: true, daysLeft, hoursLeft, minutesLeft, expiresAt: sub.expiresAt, plan: sub.plan, seats: sub.seats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @POST /api/subscriptions/cancel
const cancelSubscription = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { 'subscription.status': 'cancelled' });
        res.json({ message: 'Subscription cancelled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { initiatePayment, verifyPayment, getSubscriptionStatus, cancelSubscription };
