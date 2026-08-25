const Meal = require('../models/Meal');
const Profile = require('../models/Profile');
const DietPlan = require('../models/DietPlan');
const aiService = require('../services/ai.service');
const { sendSuccess } = require('../utils/response.utils');
const logger = require('../utils/logger');

// GET /api/analytics/summary
// Today's intake summary
const getSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayMeals, profile, activePlan] = await Promise.all([
      Meal.find({ user: req.user._id, mealDate: { $gte: today, $lt: tomorrow } }).lean(),
      Profile.findOne({ user: req.user._id }).lean(),
      DietPlan.findOne({ user: req.user._id, isActive: true }).select('title days').lean(),
    ]);

    const todayCalories = todayMeals.reduce((s, m) => s + (m.totalCalories || 0), 0);
    const todayProtein = todayMeals.reduce((s, m) => s + (m.totalProtein || 0), 0);
    const todayCarbs = todayMeals.reduce((s, m) => s + (m.totalCarbs || 0), 0);
    const todayFat = todayMeals.reduce((s, m) => s + (m.totalFat || 0), 0);

    const targets = {
      calories: profile?.dailyCalorieTarget || 2000,
      protein: profile?.dailyProteinTarget || 60,
      carbs: profile?.dailyCarbTarget || 250,
      fat: profile?.dailyFatTarget || 65,
    };

    return sendSuccess(
      res,
      {
        today: {
          calories: parseFloat(todayCalories.toFixed(1)),
          protein: parseFloat(todayProtein.toFixed(1)),
          carbs: parseFloat(todayCarbs.toFixed(1)),
          fat: parseFloat(todayFat.toFixed(1)),
          mealCount: todayMeals.length,
          meals: todayMeals,
        },
        targets,
        progress: {
          calories: targets.calories ? Math.min(100, Math.round((todayCalories / targets.calories) * 100)) : 0,
          protein: targets.protein ? Math.min(100, Math.round((todayProtein / targets.protein) * 100)) : 0,
          carbs: targets.carbs ? Math.min(100, Math.round((todayCarbs / targets.carbs) * 100)) : 0,
          fat: targets.fat ? Math.min(100, Math.round((todayFat / targets.fat) * 100)) : 0,
        },
        activePlan: activePlan ? { id: activePlan._id, title: activePlan.title } : null,
        profile: profile
          ? {
              primaryGoal: profile.primaryGoal,
              bmi: profile.bmi,
              weightKg: profile.weightKg,
              targetWeightKg: profile.targetWeightKg,
            }
          : null,
      },
      'Summary retrieved'
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/weekly
// Last 7 days of nutrition data for charts
const getWeeklyData = async (req, res, next) => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      user: req.user._id,
      mealDate: { $gte: startDate, $lte: endDate },
    }).lean();

    // Group by date
    const dayMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = {
        date: key,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        mealCount: 0,
      };
    }

    meals.forEach((meal) => {
      const key = new Date(meal.mealDate).toISOString().split('T')[0];
      if (dayMap[key]) {
        dayMap[key].calories += meal.totalCalories || 0;
        dayMap[key].protein += meal.totalProtein || 0;
        dayMap[key].carbs += meal.totalCarbs || 0;
        dayMap[key].fat += meal.totalFat || 0;
        dayMap[key].mealCount += 1;
      }
    });

    const weeklyData = Object.values(dayMap).map((d) => ({
      ...d,
      calories: parseFloat(d.calories.toFixed(1)),
      protein: parseFloat(d.protein.toFixed(1)),
      carbs: parseFloat(d.carbs.toFixed(1)),
      fat: parseFloat(d.fat.toFixed(1)),
    }));

    const profile = await Profile.findOne({ user: req.user._id }).lean();
    const targets = {
      calories: profile?.dailyCalorieTarget || 2000,
      protein: profile?.dailyProteinTarget || 60,
    };

    // Macronutrient breakdown (total for week)
    const weeklyTotals = weeklyData.reduce(
      (acc, d) => ({
        calories: acc.calories + d.calories,
        protein: acc.protein + d.protein,
        carbs: acc.carbs + d.carbs,
        fat: acc.fat + d.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const totalMacroCalories =
      weeklyTotals.protein * 4 + weeklyTotals.carbs * 4 + weeklyTotals.fat * 9;

    const macroDistribution = totalMacroCalories > 0
      ? [
          {
            name: 'Protein',
            value: parseFloat(((weeklyTotals.protein * 4 / totalMacroCalories) * 100).toFixed(1)),
            grams: parseFloat(weeklyTotals.protein.toFixed(1)),
            color: '#22c55e',
          },
          {
            name: 'Carbs',
            value: parseFloat(((weeklyTotals.carbs * 4 / totalMacroCalories) * 100).toFixed(1)),
            grams: parseFloat(weeklyTotals.carbs.toFixed(1)),
            color: '#f59e0b',
          },
          {
            name: 'Fat',
            value: parseFloat(((weeklyTotals.fat * 9 / totalMacroCalories) * 100).toFixed(1)),
            grams: parseFloat(weeklyTotals.fat.toFixed(1)),
            color: '#ef4444',
          },
        ]
      : [];

    return sendSuccess(
      res,
      {
        weeklyData,
        weeklyTotals,
        targets,
        macroDistribution,
        averageCaloriesPerDay: parseFloat((weeklyTotals.calories / 7).toFixed(1)),
      },
      'Weekly data retrieved'
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/recommendations
// Personalized nutrition recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const [profile, recentMeals] = await Promise.all([
      Profile.findOne({ user: req.user._id }).lean(),
      Meal.find({ user: req.user._id }).sort({ mealDate: -1 }).limit(10).lean(),
    ]);

    if (!profile) {
      return sendSuccess(
        res,
        { recommendations: [] },
        'Complete your profile to get personalized recommendations'
      );
    }

    const result = await aiService.getRecommendations(profile, recentMeals);

    return sendSuccess(res, result, 'Recommendations retrieved');
  } catch (error) {
    logger.error('Recommendations error:', error.message);
    // Don't fail hard on recommendations
    return sendSuccess(
      res,
      {
        recommendations: [
          { type: 'tip', message: 'Log your meals consistently to get personalized recommendations.' },
        ],
        isDemo: true,
      },
      'Recommendations retrieved'
    );
  }
};

module.exports = { getSummary, getWeeklyData, getRecommendations };
