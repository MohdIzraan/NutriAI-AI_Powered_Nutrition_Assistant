const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    analysisType: {
      type: String,
      enum: ['food_recognition', 'nutrition_estimation', 'diet_generation', 'chat'],
      required: true,
    },
    imageUrl: String,

    // Input
    inputData: {
      type: mongoose.Schema.Types.Mixed,
    },

    // AI Response
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Processed result
    result: {
      detectedFoods: [
        {
          name: String,
          confidence: Number,
          boundingBox: mongoose.Schema.Types.Mixed,
        },
      ],
      nutritionEstimate: mongoose.Schema.Types.Mixed,
      isEstimated: { type: Boolean, default: true },
    },

    // Provider info
    provider: { type: String, required: true },
    model: { type: String },
    processingTimeMs: { type: Number },
    isDemo: { type: Boolean, default: false },

    // Error handling
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

aiAnalysisSchema.index({ user: 1, createdAt: -1 });
aiAnalysisSchema.index({ analysisType: 1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
