const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Personal Information
    age: { type: Number, min: 1, max: 120 },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    heightCm: { type: Number, min: 50, max: 300 },
    weightKg: { type: Number, min: 10, max: 500 },

    // Calculated fields
    bmi: { type: Number },
    bmr: { type: Number }, // Basal Metabolic Rate

    // Lifestyle
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      default: 'moderately_active',
    },
    exerciseFrequency: {
      type: String,
      enum: ['never', 'rarely', '1-2_per_week', '3-4_per_week', '5+_per_week'],
    },
    sleepHours: { type: Number, min: 0, max: 24 },

    // Goal
    primaryGoal: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'maintain_weight', 'general_wellness', 'muscle_gain'],
      default: 'general_wellness',
    },
    targetWeightKg: { type: Number },
    weeklyGoalKg: { type: Number }, // How much to lose/gain per week

    // Dietary Preferences
    dietType: {
      type: String,
      enum: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian', 'pescatarian'],
      default: 'non_vegetarian',
    },

    // Food Preferences
    favoriteFoods: [{ type: String, trim: true }],
    dislikedFoods: [{ type: String, trim: true }],
    allergies: [{ type: String, trim: true }],
    avoidFoods: [{ type: String, trim: true }],

    // Location
    country: { type: String, default: 'India' },
    state: { type: String },
    city: { type: String },

    // Cuisine Preference
    cuisinePreferences: [
      {
        type: String,
        enum: [
          'north_indian',
          'south_indian',
          'east_indian',
          'west_indian',
          'mughlai',
          'gujarati',
          'rajasthani',
          'bengali',
          'kerala',
          'punjabi',
          'maharashtrian',
          'custom',
        ],
      },
    ],

    // Budget
    dailyBudgetINR: { type: Number, min: 0 },
    weeklyBudgetINR: { type: Number, min: 0 },

    // Calorie targets (calculated or user-set)
    dailyCalorieTarget: { type: Number },
    dailyProteinTarget: { type: Number }, // grams
    dailyCarbTarget: { type: Number }, // grams
    dailyFatTarget: { type: Number }, // grams

    // Meal preferences
    mealsPerDay: { type: Number, default: 3, min: 1, max: 8 },
    includeSnacks: { type: Boolean, default: true },

    // Medical / Health Notes (non-diagnostic)
    healthNotes: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// Calculate BMI and BMR before saving
profileSchema.pre('save', function (next) {
  if (this.heightCm && this.weightKg) {
    const heightM = this.heightCm / 100;
    this.bmi = parseFloat((this.weightKg / (heightM * heightM)).toFixed(1));
  }

  if (this.age && this.weightKg && this.heightCm && this.gender) {
    // Mifflin-St Jeor Equation
    if (this.gender === 'male') {
      this.bmr = Math.round(
        10 * this.weightKg + 6.25 * this.heightCm - 5 * this.age + 5
      );
    } else {
      this.bmr = Math.round(
        10 * this.weightKg + 6.25 * this.heightCm - 5 * this.age - 161
      );
    }

    // Calculate TDEE and targets if not set
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };

    const multiplier = activityMultipliers[this.activityLevel] || 1.55;
    let tdee = Math.round(this.bmr * multiplier);

    // Adjust for goal
    if (this.primaryGoal === 'weight_loss') tdee -= 500;
    else if (this.primaryGoal === 'weight_gain' || this.primaryGoal === 'muscle_gain') tdee += 300;

    if (!this.dailyCalorieTarget) this.dailyCalorieTarget = tdee;
    if (!this.dailyProteinTarget) this.dailyProteinTarget = Math.round(this.weightKg * 1.6);
    if (!this.dailyCarbTarget) this.dailyCarbTarget = Math.round((tdee * 0.45) / 4);
    if (!this.dailyFatTarget) this.dailyFatTarget = Math.round((tdee * 0.3) / 9);
  }

  next();
});


module.exports = mongoose.model('Profile', profileSchema);
