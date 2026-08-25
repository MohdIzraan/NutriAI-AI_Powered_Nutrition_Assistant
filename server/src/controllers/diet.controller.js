const DietPlan  = require('../models/DietPlan');
const Profile   = require('../models/Profile');
const aiService = require('../services/ai.service');
const {
  sendSuccess, sendCreated, sendError, sendNotFound,
} = require('../utils/response.utils');
const logger = require('../utils/logger');


// These helper functions convert the Python response (snake_case) into the format MongoDB expects (camelCase).
// Python returns:  meal_type, total_calories, approximate_cost_inr
// MongoDB expects: mealType,  totalCalories,  approximateCostINR

const transformFood = (food) => ({
  name:               food.name || '',
  quantity:           food.quantity || '',
  calories:           food.calories || 0,
  protein:            food.protein  || 0,
  carbs:              food.carbs    || 0,
  fat:                food.fat      || 0,
  approximateCostINR: food.approximate_cost_inr
                      ?? food.approximateCostINR
                      ?? null,
  alternatives:       food.alternatives || [],
  isRegional:         food.is_regional
                      ?? food.isRegional
                      ?? false,
});

const transformMeal = (meal) => ({
  mealType:      meal.meal_type     || meal.mealType     || 'other',
  time:          meal.time          || '',
  foods:         (meal.foods || []).map(transformFood),
  totalCalories: meal.total_calories ?? meal.totalCalories ?? 0,
  totalProtein:  meal.total_protein  ?? meal.totalProtein  ?? 0,
  totalCarbs:    meal.total_carbs    ?? meal.totalCarbs    ?? 0,
  totalFat:      meal.total_fat      ?? meal.totalFat      ?? 0,
  totalCostINR:  meal.total_cost_inr ?? meal.totalCostINR  ?? null,
  notes:         meal.notes || '',
});

const transformDay = (day) => ({
  dayNumber:     day.day_number    ?? day.dayNumber    ?? 1,
  dayName:       day.day_name      ?? day.dayName      ?? '',
  meals:         (day.meals || []).map(transformMeal),
  totalCalories: day.total_calories ?? day.totalCalories ?? 0,
  totalProtein:  day.total_protein  ?? day.totalProtein  ?? 0,
  totalCarbs:    day.total_carbs    ?? day.totalCarbs    ?? 0,
  totalFat:      day.total_fat      ?? day.totalFat      ?? 0,
  totalCostINR:  day.total_cost_inr ?? day.totalCostINR  ?? null,
});

const transformDietPlanResult = (aiResult) => ({
  ...aiResult,
  days: (aiResult.days || []).map(transformDay),
});


// POST /api/diet/generate
const generateDietPlan = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return sendError(
        res,
        'Please complete your profile before generating a diet plan',
        400,
        'PROFILE_INCOMPLETE'
      );
    }

    const preferences = req.body.preferences || {};

    const effectiveProfile = {
      age:                profile.age,
      gender:             profile.gender,
      heightCm:           profile.heightCm,
      weightKg:           profile.weightKg,
      activityLevel:      profile.activityLevel,
      primaryGoal:        profile.primaryGoal,
      dietType:           profile.dietType,
      allergies:          profile.allergies          || [],
      avoidFoods:         profile.avoidFoods         || [],
      favoriteFoods:      profile.favoriteFoods      || [],
      cuisinePreferences: profile.cuisinePreferences || [],
      country:            profile.country            || 'India',
      state:              profile.state              || '',
      city:               profile.city               || '',
      dailyBudgetINR:     profile.dailyBudgetINR     || null,
      dailyCalorieTarget: profile.dailyCalorieTarget || 2000,
      dailyProteinTarget: profile.dailyProteinTarget || 60,
      mealsPerDay:        profile.mealsPerDay        || 3,
      ...preferences,
    };

    logger.info(`Generating diet plan for user ${req.user._id}`);

    // Call the Python AI service
    const aiResult = await aiService.generateDietPlan(
      effectiveProfile,
      preferences
    );

    // Convert Python snake_case → MongoDB camelCase
    const transformed = transformDietPlanResult(aiResult);

    // Save to MongoDB
    const dietPlan = await DietPlan.create({
      user:        req.user._id,
      title:       transformed.title
                   || `7-Day ${(effectiveProfile.primaryGoal || '')
                       .replace(/_/g, ' ')} Plan`,
      description: transformed.description || '',
      parameters:  effectiveProfile,
      days:        transformed.days || [],
      aiProvider:  transformed.provider || 'unknown',
      aiModel:     transformed.model    || 'unknown',
      isActive:    true,
    });

    // Deactivate all other plans for this user
    await DietPlan.updateMany(
      { user: req.user._id, _id: { $ne: dietPlan._id } },
      { $set: { isActive: false } }
    );

    logger.info(
      `Diet plan created: ${dietPlan._id} for user ${req.user._id}`
    );

    return sendCreated(
      res,
      {
        dietPlan,
        isDemo:     transformed.is_demo || false,
        provider:   transformed.provider,
        disclaimer: 'This is an AI-generated diet plan. ' +
                    'Consult a nutritionist for medical dietary advice.',
      },
      'Diet plan generated successfully'
    );
  } catch (error) {
    logger.error('Diet generation error:', error.message);
    next(error);
  }
};


// GET /api/diet
const getDietPlans = async (req, res, next) => {
  try {
    const plans = await DietPlan
      .find({ user: req.user._id })
      .select('-days')
      .sort({ createdAt: -1 })
      .limit(20);

    return sendSuccess(res, { plans }, 'Diet plans retrieved');
  } catch (error) {
    next(error);
  }
};


// GET /api/diet/active
const getActiveDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan
      .findOne({ user: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    return sendSuccess(
      res,
      { plan: plan || null },
      'Active plan retrieved'
    );
  } catch (error) {
    next(error);
  }
};


// GET /api/diet/:id
const getDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!plan) return sendNotFound(res, 'Diet plan');

    return sendSuccess(res, { plan }, 'Diet plan retrieved');
  } catch (error) {
    next(error);
  }
};


// PUT /api/diet/:id/modify
const modifyDietPlan = async (req, res, next) => {
  try {
    const { instruction } = req.body;

    if (!instruction) {
      return sendError(
        res,
        'Modification instruction is required',
        400,
        'NO_INSTRUCTION'
      );
    }

    const plan = await DietPlan.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!plan) return sendNotFound(res, 'Diet plan');

    const profile = await Profile.findOne({ user: req.user._id });

    const aiResult = await aiService.modifyDietPlan(
      plan.toObject(),
      instruction,
      profile?.toObject() || {}
    );

    const transformed = transformDietPlanResult(aiResult);
    plan.days = transformed.days || plan.days;
    plan.modifications.push({
      timestamp: new Date(),
      instruction,
      appliedTo: aiResult.applied_to || 'global',
    });

    await plan.save();

    return sendSuccess(
      res,
      { plan, isDemo: aiResult.is_demo || false },
      'Diet plan modified successfully'
    );
  } catch (error) {
    next(error);
  }
};


// DELETE /api/diet/:id
const deleteDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOneAndDelete({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!plan) return sendNotFound(res, 'Diet plan');

    return sendSuccess(res, { deleted: true }, 'Diet plan deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDietPlan,
  getDietPlans,
  getActiveDietPlan,
  getDietPlan,
  modifyDietPlan,
  deleteDietPlan,
};