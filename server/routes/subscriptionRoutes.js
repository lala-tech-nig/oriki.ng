const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, getSubscriptionStatus, cancelSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.post('/initiate', protect, initiatePayment);
router.post('/verify', protect, verifyPayment);
router.get('/status', protect, getSubscriptionStatus);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
