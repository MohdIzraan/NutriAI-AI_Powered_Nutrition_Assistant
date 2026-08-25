const Meal = require('../models/Meal');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
} = require('../utils/response.utils');
const logger = require('../utils/logger');

/**
 * POST /api/meals
 */
const createMeal = async (req, res, next) => {
  try {
    const { mealType, mealDate, foodItems, imageUrl, aiAnalysis, notes } = req.body;

    const meal = await Meal.create({
      user: req.user._id,
      mealType,
      mealDate: mealDate ? new Date(mealDate) : new Date(),
      foodItems: foodItems || [],
      imageUrl: imageUrl || null,
      aiAnalysis: aiAnalysis || null,
      notes: notes || '',
    });

    logger.info(`Meal created: ${meal._id} for user ${req.user._id}`);
    return sendCreated(res, { meal }, 'Meal saved successfully');
  } catch (error) {
    next(error);
  }
};


// GET /api/meals
// Supports: page, limit, mealType, startDate, endDate, sortBy, search
const getMeals = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      mealType,
      startDate,
      endDate,
      sortBy = 'mealDate',
      order = 'desc',
    } = req.query;

    const query = { user: req.user._id };

    if (mealType) query.mealType = mealType;

    if (startDate || endDate) {
      query.mealDate = {};
      if (startDate) query.mealDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.mealDate.$lte = end;
      }
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    const [meals, total] = await Promise.all([
      Meal.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Meal.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      {
        meals,
        pagination: {
          total,
          page: parseInt(page),
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Meals retrieved'
    );
  } catch (error) {
    next(error);
  }
};


// GET /api/meals/:id
const getMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) return sendNotFound(res, 'Meal');
    return sendSuccess(res, { meal }, 'Meal retrieved');
  } catch (error) {
    next(error);
  }
};


// PUT /api/meals/:id
const updateMeal = async (req, res, next) => {
  try {
    const { mealType, mealDate, foodItems, notes } = req.body;

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { mealType, mealDate, foodItems, notes } },
      { new: true, runValidators: true }
    );

    if (!meal) return sendNotFound(res, 'Meal');
    return sendSuccess(res, { meal }, 'Meal updated');
  } catch (error) {
    next(error);
  }
};


// DELETE /api/meals/:id
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!meal) return sendNotFound(res, 'Meal');
    return sendSuccess(res, { deleted: true }, 'Meal deleted');
  } catch (error) {
    next(error);
  }
};


// GET /api/meals/today/summary
const getTodaySummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meals = await Meal.find({
      user: req.user._id,
      mealDate: { $gte: today, $lt: tomorrow },
    }).lean();

    const summary = {
      totalMeals: meals.length,
      totalCalories: meals.reduce((s, m) => s + (m.totalCalories || 0), 0),
      totalProtein: meals.reduce((s, m) => s + (m.totalProtein || 0), 0),
      totalCarbs: meals.reduce((s, m) => s + (m.totalCarbs || 0), 0),
      totalFat: meals.reduce((s, m) => s + (m.totalFat || 0), 0),
      meals: meals,
    };

    return sendSuccess(res, summary, "Today's meal summary");
  } catch (error) {
    next(error);
  }
};

module.exports = { createMeal, getMeals, getMeal, updateMeal, deleteMeal, getTodaySummary };
