const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    provider: String,
    model: String,
    tokensUsed: Number,
  },
});

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Nutrition Chat',
    },
    messages: [messageSchema],
    context: {
      dietPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'DietPlan' },
      mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
      contextType: { type: String, enum: ['general', 'diet_plan', 'meal', 'profile'] },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
