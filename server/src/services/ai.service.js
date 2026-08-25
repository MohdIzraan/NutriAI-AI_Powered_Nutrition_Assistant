const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 120000, // 2 minutes for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
aiClient.interceptors.request.use(
  (config) => {
    logger.debug(`AI Service Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for logging
aiClient.interceptors.response.use(
  (response) => {
    logger.debug(`AI Service Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error('AI Service Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Analyze food image using Python AI service
 * @param {string} imagePath - Path to local image file
 * @param {object} options - Analysis options
 */
const analyzeFoodImage = async (imagePath, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    if (options.userId) formData.append('user_id', options.userId);

    const response = await aiClient.post('/ai/food/analyze', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Food analysis error:', error.message);
    throw new Error(
      error.response?.data?.detail || 'AI food analysis service is currently unavailable'
    );
  }
};

/**
 * Generate personalized diet plan
 * @param {object} profile - User profile data
 * @param {object} preferences - Diet preferences
 */
const generateDietPlan = async (profile, preferences) => {
  try {
    const response = await aiClient.post('/ai/diet/generate', {
      profile,
      preferences,
    });
    return response.data;
  } catch (error) {
    logger.error('Diet generation error:', error.message);
    throw new Error(
      error.response?.data?.detail || 'AI diet generation service is currently unavailable'
    );
  }
};

/**
 * Chat with AI nutrition assistant
 * @param {Array} messages - Conversation history
 * @param {object} context - User context (profile, current diet plan etc)
 */
const chatWithAssistant = async (messages, context = {}) => {
  try {
    const response = await aiClient.post('/ai/chat', {
      messages,
      context,
    });
    return response.data;
  } catch (error) {
    logger.error('Chat error:', error.message);
    throw new Error(
      error.response?.data?.detail || 'AI chat service is currently unavailable'
    );
  }
};

/**
 * Modify a diet plan using natural language
 * @param {object} currentPlan - Current diet plan
 * @param {string} instruction - Natural language modification instruction
 * @param {object} userProfile - User profile for context
 */
const modifyDietPlan = async (currentPlan, instruction, userProfile) => {
  try {
    const response = await aiClient.post('/ai/diet/modify', {
      current_plan: currentPlan,
      instruction,
      user_profile: userProfile,
    });
    return response.data;
  } catch (error) {
    logger.error('Diet modification error:', error.message);
    throw new Error(
      error.response?.data?.detail || 'AI plan modification service is currently unavailable'
    );
  }
};

/**
 * Get AI recommendations based on user data
 * @param {object} userProfile - User profile
 * @param {Array} recentMeals - Recent meal history
 */
const getRecommendations = async (userProfile, recentMeals = []) => {
  try {
    const response = await aiClient.post('/ai/recommendations', {
      profile: userProfile,
      recent_meals: recentMeals,
    });
    return response.data;
  } catch (error) {
    logger.error('Recommendations error:', error.message);
    throw new Error(
      error.response?.data?.detail || 'AI recommendations service is currently unavailable'
    );
  }
};


// Check AI service health
const checkHealth = async () => {
  try {
    const response = await aiClient.get('/health', { timeout: 5000 });
    return { healthy: true, data: response.data };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

module.exports = {
  analyzeFoodImage,
  generateDietPlan,
  chatWithAssistant,
  modifyDietPlan,
  getRecommendations,
  checkHealth,
};
