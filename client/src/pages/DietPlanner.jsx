import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { dietService } from '../services/diet.service';
import { Card, Button, Input, Select, Alert, StepIndicator, DemoBanner } from '../components/ui';
import { ChevronRight, ChevronLeft, Wand2, MapPin, Target, Leaf, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Personal', 'Goal', 'Diet', 'Restrictions', 'Location', 'Budget', 'Meals'];

const goalOptions = [
  { value: 'weight_loss', label: '🎯 Weight Loss', desc: 'Reduce body weight with a calorie deficit' },
  { value: 'weight_gain', label: '📈 Weight Gain', desc: 'Build mass with a calorie surplus' },
  { value: 'maintain_weight', label: '⚖️ Maintain Weight', desc: 'Stay at your current weight' },
  { value: 'general_wellness', label: '💚 General Wellness', desc: 'Balanced, healthy eating habits' },
  { value: 'muscle_gain', label: '💪 Muscle Gain', desc: 'Increase muscle with high protein' },
];

const dietOptions = [
  { value: 'vegetarian', label: '🌿 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'eggetarian', label: '🥚 Eggetarian' },
  { value: 'non_vegetarian', label: '🍗 Non-Vegetarian' },
  { value: 'pescatarian', label: '🐟 Pescatarian' },
];

const cuisineOptions = [
  { value: 'north_indian', label: 'North Indian' },
  { value: 'south_indian', label: 'South Indian' },
  { value: 'east_indian', label: 'East Indian' },
  { value: 'west_indian', label: 'West Indian (Gujarati, Maharashtrian)' },
  { value: 'mughlai', label: 'Mughlai / Awadhi' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'rajasthani', label: 'Rajasthani' },
];

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary (desk job, little exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3x/week)' },
  { value: 'moderately_active', label: 'Moderately Active (exercise 3-5x/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise 6-7x/week)' },
  { value: 'extra_active', label: 'Extra Active (athlete / physical job)' },
];

function StepPersonal({ form }) {
  const { register, formState: { errors } } = form;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Age" type="number" min="10" max="120" placeholder="25" error={errors.age?.message} {...register('age', { valueAsNumber: true })} />
        <Select label="Gender" error={errors.gender?.message} {...register('gender')}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Height (cm)" type="number" min="100" max="250" placeholder="170" {...register('heightCm', { valueAsNumber: true })} />
        <Input label="Weight (kg)" type="number" min="30" max="300" placeholder="65" {...register('weightKg', { valueAsNumber: true })} />
      </div>
      <Select label="Activity Level" {...register('activityLevel')}>
        {activityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
      <Input label="Daily Calorie Target (kcal)" type="number" placeholder="Leave blank to auto-calculate"
        hint="Based on your stats we'll calculate this automatically if left blank"
        {...register('dailyCalorieTarget', { valueAsNumber: true })} />
    </div>
  );
}

function StepGoal({ form }) {
  const { register, watch, setValue } = form;
  const current = watch('primaryGoal');
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">What's your primary nutrition goal?</p>
      {goalOptions.map(opt => (
        <label key={opt.value} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150
          ${current === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-200 bg-white'}`}>
          <input type="radio" value={opt.value} {...register('primaryGoal')} className="mt-0.5 accent-primary-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">{opt.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

function StepDiet({ form }) {
  const { register, watch } = form;
  const current = watch('dietType');
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">Select your dietary preference</p>
      <div className="grid grid-cols-1 gap-2">
        {dietOptions.map(opt => (
          <label key={opt.value} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150
            ${current === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-200 bg-white'}`}>
            <input type="radio" value={opt.value} {...register('dietType')} className="accent-primary-600" />
            <span className="text-sm font-medium text-gray-900">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StepRestrictions({ form }) {
  const { register } = form;
  return (
    <div className="space-y-4">
      <Input label="Food Allergies" placeholder="e.g. peanuts, shellfish, dairy (comma-separated)"
        hint="AI will avoid these foods in your plan" {...register('allergies')} />
      <Input label="Foods to Avoid" placeholder="e.g. broccoli, bitter gourd (comma-separated)"
        {...register('avoidFoods')} />
      <Input label="Favourite Foods" placeholder="e.g. dal makhani, palak paneer (comma-separated)"
        hint="We'll try to include these where appropriate" {...register('favoriteFoods')} />
    </div>
  );
}

function StepLocation({ form }) {
  const { register, watch } = form;
  const cuisines = watch('cuisinePreferences') || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
        Your location helps AI suggest locally available and culturally appropriate foods
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Country" defaultValue="India" {...register('country')} />
        <Input label="State / Region" placeholder="e.g. Uttar Pradesh" {...register('state')} />
      </div>
      <Input label="City" placeholder="e.g. Lucknow" {...register('city')} />
      <div>
        <label className="form-label">Cuisine Preferences (select all that apply)</label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          {cuisineOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input type="checkbox" value={opt.value} {...register('cuisinePreferences')} className="accent-primary-600 h-3.5 w-3.5" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepBudget({ form }) {
  const { register } = form;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
        <DollarSign className="h-4 w-4 text-amber-500 shrink-0" />
        Budget helps AI suggest affordable, practical meals. Costs in the plan are <strong>approximate</strong>.
      </div>
      <Input label="Daily Food Budget (₹)" type="number" min="50" placeholder="e.g. 200"
        hint="Estimated daily spending on food ingredients" {...register('dailyBudgetINR', { valueAsNumber: true })} />
      <Input label="Weekly Food Budget (₹)" type="number" min="200" placeholder="e.g. 1400"
        {...register('weeklyBudgetINR', { valueAsNumber: true })} />
    </div>
  );
}

function StepMeals({ form }) {
  const { register, watch } = form;
  const meals = watch('mealsPerDay') || 3;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-primary-50 p-3 rounded-lg">
        <Clock className="h-4 w-4 text-primary-500 shrink-0" />
        The plan will include 5 eating slots: Breakfast, Mid-Morning, Lunch, Evening Snack, Dinner
      </div>
      <Select label="Meals per day" {...register('mealsPerDay', { valueAsNumber: true })}>
        <option value={3}>3 (Breakfast, Lunch, Dinner)</option>
        <option value={4}>4 (+ Evening Snack)</option>
        <option value={5}>5 (+ Mid-Morning)</option>
        <option value={6}>6 (Multiple small meals)</option>
      </Select>
      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
        Additional instructions (optional):
      </div>
      <textarea
        rows={3}
        placeholder="e.g. 'Use only locally available ingredients', 'Make it simple and quick to cook', 'Focus on high-protein foods'"
        className="form-input resize-none text-xs"
        {...register('additionalInstructions')}
      />
    </div>
  );
}

const stepComponents = [StepPersonal, StepGoal, StepDiet, StepRestrictions, StepLocation, StepBudget, StepMeals];

export default function DietPlanner() {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      primaryGoal: 'general_wellness',
      dietType: 'non_vegetarian',
      activityLevel: 'moderately_active',
      mealsPerDay: 5,
      country: 'India',
      cuisinePreferences: ['north_indian'],
    },
  });

  const StepComponent = stepComponents[step];
  const isLast = step === STEPS.length - 1;

  const next = () => step < STEPS.length - 1 && setStep(s => s + 1);
  const prev = () => step > 0 && setStep(s => s - 1);

  const generate = async (data) => {
    setLoading(true);
    setError('');
    try {
      // Parse comma-separated strings into arrays
      const parse = (v) => typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : (v || []);
      const preferences = {
        ...data,
        allergies: parse(data.allergies),
        avoidFoods: parse(data.avoidFoods),
        favoriteFoods: parse(data.favoriteFoods),
        cuisinePreferences: data.cuisinePreferences || [],
        additionalInstructions: data.additionalInstructions,
      };

      const { data: res } = await dietService.generate({ preferences });
      const plan = res.data.dietPlan;
      toast.success('7-day diet plan generated!');
      if (res.data.isDemo) toast('Demo mode — connect an AI provider for personalized plans', { icon: '⚠️' });
      navigate(`/diet/${plan._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate diet plan. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Generate Your Diet Plan</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI creates a personalized 7-day regional plan in seconds</p>
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            {['Personal Details', 'Your Goal', 'Dietary Preference', 'Restrictions & Allergies',
              'Location & Cuisine', 'Budget', 'Meal Frequency'][step]}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Step {step + 1} of {STEPS.length}</p>
        </div>

        <form onSubmit={form.handleSubmit(generate)}>
          <StepComponent form={form} />

          {error && <Alert type="error" className="mt-4">{error}</Alert>}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button type="button" variant="secondary" onClick={prev} disabled={loading}>
                <ChevronLeft className="h-4 w-4" />Back
              </Button>
            )}
            <div className="flex-1" />
            {!isLast ? (
              <Button type="button" onClick={next}>
                Next<ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" loading={loading} className="gap-2">
                <Wand2 className="h-4 w-4" />
                {loading ? 'AI is generating your plan…' : 'Generate My Plan'}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {loading && (
        <div className="mt-4 p-4 bg-primary-50 rounded-xl text-center">
          <p className="text-sm font-medium text-primary-700">🤖 AI is crafting your personalized plan…</p>
          <p className="text-xs text-primary-500 mt-1">Considering your region, budget, and goals</p>
        </div>
      )}
    </div>
  );
}
