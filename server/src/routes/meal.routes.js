const express = require('express');
const router = express.Router();
const { createMeal, getMeals, getMeal, updateMeal, deleteMeal, getTodaySummary } = require('../controllers/meal.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

router.get('/today/summary', protect, getTodaySummary);
router.post('/', protect,
  [body('mealType').notEmpty().withMessage('Meal type is required')],
  validate,
  createMeal
);
router.get('/', protect, getMeals);
router.get('/:id', protect, getMeal);
router.put('/:id', protect, updateMeal);
router.delete('/:id', protect, deleteMeal);

module.exports = router;
