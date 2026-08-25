const Chat = require('../models/Chat');
const Profile = require('../models/Profile');
const DietPlan = require('../models/DietPlan');
const Meal = require('../models/Meal');
const aiService = require('../services/ai.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response.utils');
const logger = require('../utils/logger');

// POST /api/chat
// Send a message to the AI assistant
const sendMessage = async (req, res, next) => {
  try {
    const { message, chatId, contextType = 'general', dietPlanId } = req.body;

    if (!message || message.trim().length === 0) {
      return sendError(res, 'Message cannot be empty', 400, 'EMPTY_MESSAGE');
    }

    // Load or create chat
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    }

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        title: message.slice(0, 60),
        messages: [],
        context: { contextType },
      });
    }

    // Build context for AI
    const profile = await Profile.findOne({ user: req.user._id }).lean();
    let activePlan = null;
    if (dietPlanId) {
      activePlan = await DietPlan.findOne({ _id: dietPlanId, user: req.user._id }).lean();
    } else {
      activePlan = await DietPlan.findOne({ user: req.user._id, isActive: true }).lean();
    }

    // Get recent meals for context
    const recentMeals = await Meal.find({ user: req.user._id })
      .sort({ mealDate: -1 })
      .limit(5)
      .lean();

    const context = {
      user_profile: profile
        ? {
            name: req.user.name,
            age: profile.age,
            gender: profile.gender,
            primaryGoal: profile.primaryGoal,
            dietType: profile.dietType,
            allergies: profile.allergies,
            cuisinePreferences: profile.cuisinePreferences,
            region: `${profile.city || ''}, ${profile.state || ''}, ${profile.country || 'India'}`.trim(),
            dailyBudgetINR: profile.dailyBudgetINR,
            dailyCalorieTarget: profile.dailyCalorieTarget,
          }
        : null,
      active_diet_plan: activePlan
        ? {
            title: activePlan.title,
            days: activePlan.days?.slice(0, 2), // Include first 2 days for context
          }
        : null,
      recent_meals: recentMeals.map((m) => ({
        type: m.mealType,
        date: m.mealDate,
        calories: m.totalCalories,
        foods: m.foodItems?.map((f) => f.name),
      })),
    };

    // Add user message to history
    const userMessage = { role: 'user', content: message.trim(), timestamp: new Date() };
    chat.messages.push(userMessage);

    // Build message history for AI (last 20 messages)
    const messageHistory = chat.messages
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    // Call AI
    const aiResult = await aiService.chatWithAssistant(messageHistory, context);

    const assistantMessage = {
      role: 'assistant',
      content: aiResult.message || aiResult.content || 'I apologize, I could not generate a response.',
      timestamp: new Date(),
      metadata: {
        provider: aiResult.provider,
        model: aiResult.model,
      },
    };

    chat.messages.push(assistantMessage);
    await chat.save();

    return sendSuccess(
      res,
      {
        chatId: chat._id,
        message: assistantMessage.content,
        isDemo: aiResult.is_demo || false,
        provider: aiResult.provider,
      },
      'Message sent'
    );
  } catch (error) {
    logger.error('Chat controller error:', error.message);
    next(error);
  }
};

// GET /api/chat/history
const getChatHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [chats, total] = await Promise.all([
      Chat.find({ user: req.user._id })
        .select('title messages createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Chat.countDocuments({ user: req.user._id }),
    ]);

    return sendSuccess(
      res,
      {
        chats,
        pagination: { total, page: parseInt(page), limit: parseInt(limit) },
      },
      'Chat history retrieved'
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/:id
const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return sendError(res, 'Chat not found', 404, 'NOT_FOUND');
    return sendSuccess(res, { chat }, 'Chat retrieved');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/chat/:id
const deleteChat = async (req, res, next) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    return sendSuccess(res, { deleted: true }, 'Chat deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getChatHistory, getChat, deleteChat };
