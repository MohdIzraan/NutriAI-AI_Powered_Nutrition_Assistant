const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 300000, // 5 minutes — handles Render free tier wake-up time
  headers: { 'Content-Type': 'application/json' },
});

aiClient.interceptors.request.use(
  (config) => {
    logger.debug(`AI Service Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

aiClient.interceptors.response.use(
  (response) => {
    logger.debug(`AI Service Response: ${response.status}`);
    return response;
  },
  (error) => {
    logger.error('AI Service Error:', error.message);
    return Promise.reject(error);
  }
);

// Wake up the AI service before making a request
// This is needed because Render free tier sleeps after 15 minutes
const wakeUpAIService = async () => {
  try {
    await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 60000 });
    logger.debug('AI service is awake');
  } catch {
    logger.debug('AI service wake-up ping sent');
  }
};

const analyzeFoodImage = async (imagePath, options = {}) => {
  try {
    await wakeUpAIService();
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    if (options.userId) formData.append('user_id', options.userId);

    const response = await aiClient.post('/ai/food/analyze', formData, {
      headers: { ...formData.getHeaders() },
      timeout: 300000,
    });
    return response.data;
  } catch (error) {
    logger.error('Food analysis error:', error.message);
    throw new Error(
      error.response?.data?.detail ||
      'AI food analysis service is currently unavailable'
    );
  }
};

const generateDietPlan = async (profile, preferences) => {
  try {
    await wakeUpAIService();
    const response = await aiClient.post('/ai/diet/generate', {
      profile,
      preferences,
    });
    return response.data;
  } catch (error) {
    logger.error('Diet generation error:', error.message);
    throw new Error(
      error.response?.data?.detail ||
      'AI diet generation service is currently unavailable'
    );
  }
};

const chatWithAssistant = async (messages, context = {}) => {
  try {
    await wakeUpAIService();
    const response = await aiClient.post('/ai/chat', {
      messages,
      context,
    });
    return response.data;
  } catch (error) {
    logger.error('Chat error:', error.message);
    throw new Error(
      error.response?.data?.detail ||
      'AI chat service is currently unavailable'
    );
  }
};

const modifyDietPlan = async (currentPlan, instruction, userProfile) => {
  try {
    await wakeUpAIService();
    const response = await aiClient.post('/ai/diet/modify', {
      current_plan: currentPlan,
      instruction,
      user_profile: userProfile,
    });
    return response.data;
  } catch (error) {
    logger.error('Diet modification error:', error.message);
    throw new Error(
      error.response?.data?.detail ||
      'AI plan modification service is currently unavailable'
    );
  }
};

const getRecommendations = async (userProfile, recentMeals = []) => {
  try {
    await wakeUpAIService();
    const response = await aiClient.post('/ai/recommendations', {
      profile: userProfile,
      recent_meals: recentMeals,
    });
    return response.data;
  } catch (error) {
    logger.error('Recommendations error:', error.message);
    throw new Error(
      error.response?.data?.detail ||
      'AI recommendations service is currently unavailable'
    );
  }
};

const checkHealth = async () => {
  try {
    const response = await aiClient.get('/health', { timeout: 10000 });
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