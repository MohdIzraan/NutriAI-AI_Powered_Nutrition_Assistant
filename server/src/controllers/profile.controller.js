const Profile = require('../models/Profile');
const User = require('../models/User');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.utils');
const logger = require('../utils/logger');


// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email avatar');

    if (!profile) {
      return sendNotFound(res, 'Profile');
    }

    return sendSuccess(res, { profile }, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};


// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'age',
      'gender',
      'heightCm',
      'weightKg',
      'activityLevel',
      'exerciseFrequency',
      'sleepHours',
      'primaryGoal',
      'targetWeightKg',
      'weeklyGoalKg',
      'dietType',
      'favoriteFoods',
      'dislikedFoods',
      'allergies',
      'avoidFoods',
      'country',
      'state',
      'city',
      'cuisinePreferences',
      'dailyBudgetINR',
      'weeklyBudgetINR',
      'dailyCalorieTarget',
      'dailyProteinTarget',
      'dailyCarbTarget',
      'dailyFatTarget',
      'mealsPerDay',
      'includeSnacks',
      'healthNotes',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true, upsert: true }
    );

    // Mark user profile as complete if key fields are set
    const isComplete =
      profile.age && profile.gender && profile.heightCm && profile.weightKg && profile.primaryGoal;

    if (isComplete && !req.user.isProfileComplete) {
      await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true });
    }

    logger.info(`Profile updated for user: ${req.user._id}`);

    return sendSuccess(res, { profile }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
