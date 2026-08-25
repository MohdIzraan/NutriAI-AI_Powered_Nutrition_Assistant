import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { profileService } from '../services/profile.service';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select, Alert, Badge } from '../components/ui';
import { User, Target, MapPin, DollarSign, AlertCircle, CheckCircle, Utensils } from 'lucide-react';
import { getBMICategory } from '../utils/formatters';
import toast from 'react-hot-toast';

const cuisineOptions = [
  { value: 'north_indian', label: 'North Indian' },
  { value: 'south_indian', label: 'South Indian' },
  { value: 'east_indian', label: 'East Indian' },
  { value: 'west_indian', label: 'West Indian' },
  { value: 'mughlai', label: 'Mughlai / Awadhi' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'rajasthani', label: 'Rajasthani' },
];

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
        <Icon className="h-4 w-4 text-primary-600" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

const checkProfileComplete = (profile) => {
  if (!profile) return false;
  return !!(
    profile.age &&
    profile.gender &&
    profile.heightCm &&
    profile.weightKg &&
    profile.primaryGoal &&
    profile.dietType
  );
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm();
  const watchedWeight = watch('weightKg');
  const watchedHeight = watch('heightCm');

  useEffect(() => {
    profileService.get()
      .then(({ data }) => {
        const p = data.data.profile;
        setProfile(p);
        reset({
          ...p,
          favoriteFoods: p.favoriteFoods?.join(', ') || '',
          dislikedFoods: p.dislikedFoods?.join(', ') || '',
          allergies:     p.allergies?.join(', ') || '',
          avoidFoods:    p.avoidFoods?.join(', ') || '',
          cuisinePreferences: p.cuisinePreferences || [],
        });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const parse = (v) =>
        typeof v === 'string'
          ? v.split(',').map(s => s.trim()).filter(Boolean)
          : (v || []);

      const payload = {
        ...data,
        age:                parseInt(data.age) || undefined,
        heightCm:           parseFloat(data.heightCm) || undefined,
        weightKg:           parseFloat(data.weightKg) || undefined,
        dailyBudgetINR:     parseFloat(data.dailyBudgetINR) || undefined,
        weeklyBudgetINR:    parseFloat(data.weeklyBudgetINR) || undefined,
        dailyCalorieTarget: parseInt(data.dailyCalorieTarget) || undefined,
        mealsPerDay:        parseInt(data.mealsPerDay) || 3,
        favoriteFoods:      parse(data.favoriteFoods),
        dislikedFoods:      parse(data.dislikedFoods),
        allergies:          parse(data.allergies),
        avoidFoods:         parse(data.avoidFoods),
        cuisinePreferences: Array.isArray(data.cuisinePreferences)
          ? data.cuisinePreferences.filter(Boolean)
          : parse(data.cuisinePreferences),
      };

      const { data: res } = await profileService.update(payload);
      const updated = res.data.profile;
      setProfile(updated);
      setSuccess(true);
      await refreshUser();
      toast.success('Profile updated successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const liveHeight = parseFloat(watchedHeight) || profile?.heightCm;
  const liveWeight = parseFloat(watchedWeight) || profile?.weightKg;
  const bmi = liveHeight && liveWeight
    ? (liveWeight / Math.pow(liveHeight / 100, 2)).toFixed(1)
    : profile?.bmi;
  const bmiCat = getBMICategory(parseFloat(bmi));
  const isProfileComplete = checkProfileComplete(profile);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-5 h-32 animate-pulse bg-gray-50" />
      ))}
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your profile helps AI personalise nutrition recommendations
          </p>
        </div>
        <Badge variant={isProfileComplete ? 'green' : 'amber'}>
          {isProfileComplete
            ? <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />Profile Complete
              </span>
            : 'Incomplete — fill key fields'}
        </Badge>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {success && (
        <Alert type="success">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" />Profile saved successfully!
          </div>
        </Alert>
      )}

      {bmi && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Body Mass Index (BMI)</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-gray-900">{bmi}</span>
                {bmiCat && (
                  <span className={`text-sm font-medium ${bmiCat.color}`}>
                    {bmiCat.label}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 max-w-xs">
              BMI is calculated from your height and weight.
              It is a general indicator, not a medical diagnosis.
            </p>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Section icon={User} title="Personal Details">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name"  defaultValue={user?.name}  disabled className="bg-gray-50" />
            <Input label="Email" defaultValue={user?.email} disabled className="bg-gray-50" />
            <Input label="Age" type="number" min="1" max="120"
              placeholder="e.g. 21" {...register('age')} />
            <Select label="Gender" {...register('gender')}>
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </Select>
            <Input label="Height (cm)" type="number" min="100" max="250"
              placeholder="e.g. 170" {...register('heightCm')} />
            <Input label="Weight (kg)" type="number" min="30" max="300"
              placeholder="e.g. 65" {...register('weightKg')} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Select label="Activity Level" {...register('activityLevel')}>
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
              <option value="extra_active">Extra Active</option>
            </Select>
            <Input label="Sleep (hours/night)" type="number" min="0" max="24"
              placeholder="e.g. 7" {...register('sleepHours')} />
          </div>
        </Section>

        <Section icon={Target} title="Goals & Targets">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Primary Goal" {...register('primaryGoal')}>
              <option value="general_wellness">General Wellness</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="maintain_weight">Maintain Weight</option>
              <option value="muscle_gain">Muscle Gain</option>
            </Select>
            <Input label="Target Weight (kg)" type="number"
              placeholder="Optional" {...register('targetWeightKg')} />
            <Input label="Daily Calorie Target (kcal)" type="number"
              placeholder="Leave blank to auto-calculate"
              hint="We calculate this from your stats if left blank"
              {...register('dailyCalorieTarget')} />
            <Select label="Meals per Day" {...register('mealsPerDay')}>
              <option value={3}>3 meals</option>
              <option value={4}>4 meals</option>
              <option value={5}>5 meals</option>
              <option value={6}>6 meals</option>
            </Select>
          </div>
        </Section>

        <Section icon={Utensils} title="Diet & Food Preferences">
          <Select label="Dietary Type" {...register('dietType')}>
            <option value="non_vegetarian">Non-Vegetarian</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="pescatarian">Pescatarian</option>
          </Select>
          <div className="grid grid-cols-1 gap-3 mt-3">
            <Input label="Food Allergies"
              placeholder="e.g. peanuts, dairy, gluten (comma-separated)"
              {...register('allergies')} />
            <Input label="Foods to Avoid"
              placeholder="e.g. brinjal, bitter gourd (comma-separated)"
              {...register('avoidFoods')} />
            <Input label="Favourite Foods"
              placeholder="e.g. dal makhani, palak paneer (comma-separated)"
              {...register('favoriteFoods')} />
          </div>
          <div className="mt-3">
            <label className="form-label">Cuisine Preferences</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {cuisineOptions.map(opt => (
                <label key={opt.value}
                  className="flex items-center gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" value={opt.value}
                    {...register('cuisinePreferences')}
                    className="accent-primary-600 h-3.5 w-3.5" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </Section>

        <Section icon={MapPin} title="Location">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Country"
              placeholder="e.g. India" {...register('country')} />
            <Input label="State / Region"
              placeholder="State / Region" {...register('state')} />
            <Input label="City"
              placeholder="City" {...register('city')} />
          </div>
        </Section>

        <Section icon={DollarSign} title="Budget">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Daily Food Budget (₹)" type="number"
              placeholder="e.g. 200" hint="Approximate daily spend"
              {...register('dailyBudgetINR')} />
            <Input label="Weekly Food Budget (₹)" type="number"
              placeholder="e.g. 1400" {...register('weeklyBudgetINR')} />
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <Button type="submit" loading={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>
      </form>

      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-400 border border-gray-100">
        <AlertCircle className="inline h-3 w-3 mr-1" />
        Profile information is used only to personalise AI nutrition recommendations.
        Not shared with third parties. Not used for medical diagnosis.
      </div>
    </div>
  );
}