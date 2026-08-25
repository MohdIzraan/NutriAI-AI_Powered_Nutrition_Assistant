const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);

module.exports = router;
