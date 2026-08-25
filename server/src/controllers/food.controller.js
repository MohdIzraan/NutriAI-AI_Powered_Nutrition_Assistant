const path = require('path');
const fs = require('fs');
const AIAnalysis = require('../models/AIAnalysis');
const aiService = require('../services/ai.service');
const { sendSuccess, sendError } = require('../utils/response.utils');
const logger = require('../utils/logger');


// POST /api/food/analyze
// Accepts image upload and runs AI food recognition
const analyzeFood = async (req, res, next) => {
  const startTime = Date.now();
  let imagePath = null;

  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400, 'NO_FILE');
    }

    imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    logger.info(`Starting food analysis for user ${req.user._id}, file: ${req.file.filename}`);

    // Call Python AI service
    const aiResult = await aiService.analyzeFoodImage(imagePath, {
      userId: req.user._id.toString(),
    });

    const processingTime = Date.now() - startTime;

    // Save AI analysis record
    const analysis = await AIAnalysis.create({
      user: req.user._id,
      analysisType: 'food_recognition',
      imageUrl,
      inputData: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      rawResponse: aiResult,
      result: {
        detectedFoods: aiResult.detected_foods || [],
        nutritionEstimate: aiResult.nutrition || null,
        isEstimated: true,
      },
      provider: aiResult.provider || 'unknown',
      model: aiResult.model || 'unknown',
      processingTimeMs: processingTime,
      isDemo: aiResult.is_demo || false,
      status: 'success',
    });

    return sendSuccess(
      res,
      {
        analysisId: analysis._id,
        imageUrl,
        detectedFoods: aiResult.detected_foods || [],
        nutrition: aiResult.nutrition || null,
        provider: aiResult.provider,
        model: aiResult.model,
        isDemo: aiResult.is_demo || false,
        isEstimated: true,
        processingTimeMs: processingTime,
        disclaimer:
          'Nutritional values are AI-estimated and may not be 100% accurate. Adjust serving sizes as needed.',
      },
      'Food analysis complete'
    );
  } catch (error) {
    logger.error('Food analysis controller error:', error.message);

    // Save failed analysis
    if (req.file) {
      try {
        await AIAnalysis.create({
          user: req.user._id,
          analysisType: 'food_recognition',
          imageUrl: `/uploads/${req.file.filename}`,
          inputData: { filename: req.file?.filename },
          provider: 'unknown',
          processingTimeMs: Date.now() - startTime,
          status: 'failed',
          errorMessage: error.message,
          isDemo: false,
        });
      } catch (dbErr) {
        logger.error('Failed to save error analysis record:', dbErr.message);
      }
    }

    next(error);
  }
};


// GET /api/food/analysis/:id
const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await AIAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return sendError(res, 'Analysis not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { analysis }, 'Analysis retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeFood, getAnalysis };
