require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const axios = require('axios');

const PORT = process.env.PORT || 5000;

// Ping AI service every 10 minutes to prevent sleeping
const keepAIServiceAwake = () => {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  setInterval(async () => {
    try {
      await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 30000 });
      logger.debug('AI service keep-alive ping sent');
    } catch {
      logger.debug('AI service ping failed — service may be waking up');
    }
  }, 10 * 60 * 1000); // Every 10 minutes
};

// Ping self to prevent backend from sleeping
const keepBackendAwake = (serverUrl) => {
  setInterval(async () => {
    try {
      await axios.get(`${serverUrl}/health`, { timeout: 30000 });
      logger.debug('Backend self keep-alive ping sent');
    } catch {
      logger.debug('Backend self ping failed');
    }
  }, 10 * 60 * 1000); // Every 10 minutes
};

const start = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 AI Nutrition Server running on port ${PORT}`);
      logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🤖 AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);

      // Start keep-alive pings only in production
      if (process.env.NODE_ENV === 'production') {
        keepAIServiceAwake();

        // Self ping using Render URL if available
        const backendUrl = process.env.RENDER_EXTERNAL_URL ||
          `http://localhost:${PORT}`;
        keepBackendAwake(backendUrl);

        logger.info('✅ Keep-alive pings started for production');
      }
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Force shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
