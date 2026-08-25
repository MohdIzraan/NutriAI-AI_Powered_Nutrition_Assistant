export const formatCalories = (n) => `${Math.round(n ?? 0)} kcal`;
export const formatMacro = (n, unit = 'g') => `${parseFloat((n ?? 0).toFixed(1))}${unit}`;
export const formatCost = (n) => n != null ? `₹${Math.round(n)}` : 'N/A';
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export const formatDateTime = (d) => `${formatDate(d)}, ${formatTime(d)}`;

export const getMealTypeLabel = (t) =>
  ({ breakfast: 'Breakfast', mid_morning: 'Mid Morning', lunch: 'Lunch',
     evening_snack: 'Evening Snack', dinner: 'Dinner', snack: 'Snack', other: 'Other' }[t] ?? t);

export const getMealTypeIcon = (t) =>
  ({ breakfast: '🌅', mid_morning: '☕', lunch: '🍱', evening_snack: '🍵', dinner: '🌙', snack: '🍎', other: '🍽️' }[t] ?? '🍽️');

export const getGoalLabel = (g) =>
  ({ weight_loss: 'Weight Loss', weight_gain: 'Weight Gain', maintain_weight: 'Maintain Weight',
     general_wellness: 'General Wellness', muscle_gain: 'Muscle Gain' }[g] ?? g);

export const getDietLabel = (d) =>
  ({ vegetarian: 'Vegetarian', vegan: 'Vegan', eggetarian: 'Eggetarian',
     non_vegetarian: 'Non-Vegetarian', pescatarian: 'Pescatarian' }[d] ?? d);

export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
  if (bmi < 25)   return { label: 'Normal',      color: 'text-green-600' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'text-amber-600' };
  return                 { label: 'Obese',        color: 'text-red-600' };
};

export const getActivityLabel = (a) =>
  ({ sedentary: 'Sedentary', lightly_active: 'Lightly Active',
     moderately_active: 'Moderately Active', very_active: 'Very Active', extra_active: 'Extra Active' }[a] ?? a);

export const truncate = (str, n = 50) =>
  str && str.length > n ? str.slice(0, n) + '…' : str;

export const getConfidenceColor = (c) => {
  if (c >= 0.8) return 'text-green-600';
  if (c >= 0.6) return 'text-amber-600';
  return 'text-red-500';
};

export const getConfidenceLabel = (c) => {
  if (c >= 0.8) return 'High';
  if (c >= 0.6) return 'Medium';
  return 'Low';
};

export const getMacroColor = (macro) =>
  ({ calories: '#22c55e', protein: '#3b82f6', carbs: '#f59e0b', fat: '#ef4444', fiber: '#8b5cf6' }[macro] ?? '#6b7280');

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
