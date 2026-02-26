const express = require('express');
const router = express.Router();
const { getSubAccounts, createSubAccount, deleteSubAccount } = require('../controllers/subAccountController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSubAccounts);
router.post('/', protect, createSubAccount);
router.delete('/:id', protect, deleteSubAccount);

module.exports = router;
