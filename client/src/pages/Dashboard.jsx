import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../context/AuthContext';
import {
  Card, SkeletonCard, EmptyState, Alert, ProgressBar,
  Badge, DemoBanner, MacroRow
} from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  Camera, BookOpen, MessageCircle, TrendingUp, Flame,
  Zap, Target, ChevronRight, UtensilsCrossed
} from 'lucide-react';
import {
  formatCalories, formatMacro, getMealTypeIcon, getMealTypeLabel, getGoalLabel
} from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, wRes, rRes] = await Promise.allSettled([
          analyticsService.getSummary(),
          analyticsService.getWeekly(),
          analyticsService.getRecommendations(),
        ]);

        if (sRes.status === 'fulfilled') setSummary(sRes.value.data.data);
        if (wRes.status === 'fulfilled') setWeekly(wRes.value.data.data);
        if (rRes.status === 'fulfilled') setRecommendations(rRes.value.data.data?.recommendations || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickActions = [
    { to: '/food', icon: Camera, label: 'Analyze Food', color: 'bg-primary-50 text-primary-600', desc: 'Recognize food with AI' },
    { to: '/meal-analyzer', icon: UtensilsCrossed, label: 'Log Meal', color: 'bg-blue-50 text-blue-600', desc: 'Save today\'s meal' },
    { to: '/diet', icon: BookOpen, label: 'Diet Plan', color: 'bg-amber-50 text-amber-600', desc: 'Generate weekly plan' },
    { to: '/assistant', icon: MessageCircle, label: 'AI Assistant', color: 'bg-purple-50 text-purple-600', desc: 'Ask nutrition questions' },
  ];

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="h-7 w-1/3 skeleton rounded mb-1" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonCard />
    </div>
  );

  const t = summary?.today || {};
  const targets = summary?.targets || { calories: 2000, protein: 60, carbs: 250, fat: 65 };
  const progress = summary?.progress || {};

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's your nutrition summary for today</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map(({ to, icon: Icon, label, color, desc }) => (
          <Link key={to} to={to} className="card p-4 hover:shadow-card-hover transition-all duration-200 group">
            <div className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ${color} mb-3`}>
              <Icon className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
            </div>
            <div className="text-sm font-semibold text-grsay-900 group-hover:text-primary-700 transition-colors">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Today's Intake */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calories */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today's Calories</div>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-3xl font-bold text-gray-900">{Math.round(t.calories || 0)}</span>
                <span className="text-sm text-gray-400 mb-1">/ {targets.calories} kcal</span>
              </div>
            </div>
            <div className="h-12 w-12 flex items-center justify-center">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0fdf4" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${Math.min(100, progress.calories || 0) * 0.97} 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <ProgressBar value={t.calories || 0} max={targets.calories} />
          <div className="mt-2 text-xs text-gray-500">{progress.calories || 0}% of daily goal</div>
        </Card>

        {/* Macros */}
        <Card className="p-5">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Macronutrients</div>
          <div className="space-y-3">
            <MacroRow label="Protein" value={formatMacro(t.protein)} color="#3b82f6"
              progress={t.protein} max={targets.protein} />
            <MacroRow label="Carbohydrates" value={formatMacro(t.carbs)} color="#f59e0b"
              progress={t.carbs} max={targets.carbs} />
            <MacroRow label="Fat" value={formatMacro(t.fat)} color="#ef4444"
              progress={t.fat} max={targets.fat} />
          </div>
        </Card>
      </div>

      {/* Weekly Chart */}
      {weekly?.weeklyData && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">Weekly Calories</div>
              <div className="text-xs text-gray-400">Last 7 days vs target</div>
            </div>
            <Badge variant="gray">Avg: {Math.round(weekly.averageCaloriesPerDay || 0)} kcal/day</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekly.weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dayName" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(v) => [`${Math.round(v)} kcal`, 'Calories']}
              />
              <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
              {weekly.targets?.calories && (
                <Bar dataKey={() => weekly.targets.calories} fill="#f0fdf4" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Meals */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-900">Today's Meals</div>
            <Link to="/history" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {!t.meals || t.meals.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="No meals logged yet"
              description="Analyze food or log a meal to get started"
              action={<Link to="/food" className="btn-primary text-xs">Analyze Food</Link>}
            />
          ) : (
            <div className="space-y-2">
              {t.meals.slice(0, 4).map((meal) => (
                <div key={meal._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getMealTypeIcon(meal.mealType)}</span>
                    <div>
                      <div className="text-xs font-medium text-gray-800">{getMealTypeLabel(meal.mealType)}</div>
                      <div className="text-xs text-gray-400">
                        {meal.foodItems?.slice(0, 2).map(f => f.name).join(', ')}
                        {meal.foodItems?.length > 2 && ` +${meal.foodItems.length - 2}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-700">{Math.round(meal.totalCalories)} kcal</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card className="p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <div className="text-sm font-semibold text-gray-900">AI Recommendations</div>
          </div>
          {recommendations.length === 0 ? (
            <EmptyState
              icon="💡"
              title="No recommendations yet"
              description="Log meals to get personalized insights"
            />
          ) : (
            <div className="space-y-2.5">
              {recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-base mt-0.5">
                    {rec.type === 'tip' ? '💡' : rec.type === 'food' ? '🥗' : rec.type === 'warning' ? '⚠️' : '✨'}
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-800">{rec.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {summary?.activePlan && (
            <Link to={`/diet/${summary.activePlan.id}`} className="mt-3 flex items-center justify-between p-2.5 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <div className="text-xs font-medium text-primary-700">
                Active Plan: {summary.activePlan.title}
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-primary-600" />
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}
