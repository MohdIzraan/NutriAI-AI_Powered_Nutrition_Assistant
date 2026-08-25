const express = require('express');
const router = express.Router();
const { generateDietPlan, getDietPlans, getActiveDietPlan, getDietPlan, modifyDietPlan, deleteDietPlan } = require('../controllers/diet.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, generateDietPlan);
router.get('/', protect, getDietPlans);
router.get('/active', protect, getActiveDietPlan);
router.get('/:id', protect, getDietPlan);
router.put('/:id/modify', protect, modifyDietPlan);
router.delete('/:id', protect, deleteDietPlan);

module.exports = router;
