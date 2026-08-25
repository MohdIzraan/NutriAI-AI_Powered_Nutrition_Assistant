const express = require('express');
const router = express.Router();
const { analyzeFood, getAnalysis } = require('../controllers/food.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

router.post('/analyze', protect, upload.single('image'), handleUploadError, analyzeFood);
router.get('/analysis/:id', protect, getAnalysis);

module.exports = router;
