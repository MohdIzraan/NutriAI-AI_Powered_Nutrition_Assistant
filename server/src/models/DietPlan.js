const mongoose = require('mongoose');

const dietMealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'],
    required: true,
  },
  time: String, // e.g. "8:00 AM"
  foods: [
    {
      name: { type: String, required: true },
      quantity: { type: String, required: true }, // e.g. "2 cups", "150g"
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      approximateCostINR: { type: Number, default: null },
      alternatives: [{ type: String }],
      isRegional: { type: Boolean, default: false },
    },
  ],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  totalCostINR: { type: Number, default: null },
  notes: { type: String },
});

const dietDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true, min: 1, max: 7 },
  dayName: { type: String }, // Monday, Tuesday etc
  meals: [dietMealSchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  totalCostINR: { type: Number, default: null },
});

const dietPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },

    // Plan parameters (snapshot at generation time)
    parameters: {
      primaryGoal: String,
      dietType: String,
      dailyCalorieTarget: Number,
      cuisinePreferences: [String],
      region: String,
      city: String,
      country: String,
      dailyBudgetINR: Number,
      allergies: [String],
      avoidFoods: [String],
      mealsPerDay: Number,
      activityLevel: String,
    },

    days: [dietDaySchema],

    // Plan status
    isActive: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },

    // AI metadata
    aiProvider: { type: String },
    aiModel: { type: String },
    generatedAt: { type: Date, default: Date.now },

    // User notes/modifications
    userNotes: { type: String },
    modifications: [
      {
        timestamp: { type: Date, default: Date.now },
        instruction: { type: String },
        appliedTo: { type: String }, 
      },
    ],
  },
  {
    timestamps: true,
  }
);

dietPlanSchema.index({ user: 1, createdAt: -1 });
dietPlanSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
