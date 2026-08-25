const express = require('express');
const router = express.Router();
const { getSummary, getWeeklyData, getRecommendations } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/summary', protect, getSummary);
router.get('/weekly', protect, getWeeklyData);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
