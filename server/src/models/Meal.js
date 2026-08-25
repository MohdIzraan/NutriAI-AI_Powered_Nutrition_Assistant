const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  servingSize: { type: Number, required: true },
  servingUnit: { type: String, default: 'grams' },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  confidence: { type: Number, default: null }, // AI confidence 0-1
  isEstimated: { type: Boolean, default: true },
  nutritionSource: { type: String, default: 'ai_estimated' }, 
});

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner', 'snack', 'other'],
      required: true,
    },
    mealDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    foodItems: [foodItemSchema],

    // Aggregated totals
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalFiber: { type: Number, default: 0 },

    // Image
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },

    // AI Analysis metadata
    aiAnalysis: {
      provider: { type: String },
      model: { type: String },
      analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIAnalysis' },
      isEstimated: { type: Boolean, default: true },
    },

    notes: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totals before save
mealSchema.pre('save', function (next) {
  if (this.foodItems && this.foodItems.length > 0) {
    this.totalCalories = parseFloat(
      this.foodItems.reduce((sum, item) => sum + (item.calories || 0), 0).toFixed(1)
    );
    this.totalProtein = parseFloat(
      this.foodItems.reduce((sum, item) => sum + (item.protein || 0), 0).toFixed(1)
    );
    this.totalCarbs = parseFloat(
      this.foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0).toFixed(1)
    );
    this.totalFat = parseFloat(
      this.foodItems.reduce((sum, item) => sum + (item.fat || 0), 0).toFixed(1)
    );
    this.totalFiber = parseFloat(
      this.foodItems.reduce((sum, item) => sum + (item.fiber || 0), 0).toFixed(1)
    );
  }
  next();
});

mealSchema.index({ user: 1, mealDate: -1 });
mealSchema.index({ user: 1, mealType: 1 });

module.exports = mongoose.model('Meal', mealSchema);
