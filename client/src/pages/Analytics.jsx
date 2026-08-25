import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';
import { Card, SkeletonCard, Alert, Badge, EmptyState } from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie,
  Cell, Legend,
} from 'recharts';
import { TrendingUp, Flame, Dumbbell, Apple } from 'lucide-react';
import { formatMacro } from '../utils/formatters';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label, unit = 'kcal' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-md text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}:{' '}
          <strong>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{' '}
            {unit}
          </strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [weekly,  setWeekly]  = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [wRes, sRes] = await Promise.allSettled([
          analyticsService.getWeekly(),
          analyticsService.getSummary(),
        ]);
        if (wRes.status === 'fulfilled') setWeekly(wRes.value.data.data);
        if (sRes.status === 'fulfilled') setSummary(sRes.value.data.data);
      } catch {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-7 w-1/4 skeleton rounded mb-1" />
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  const w = weekly  || {};
  const s = summary || {};

  const hasData = w.weeklyData?.some(d => d.calories > 0);

  return (
    <div className="space-y-5 animate-fade-in">

      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Nutrition Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your weekly nutrition trends and macro distribution
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Empty state — shown when no meals are logged yet */}
      {!hasData && !error && (
        <Card className="p-10">
          <EmptyState
            icon="📊"
            title="No nutrition data yet"
            description="Log your first meal to start seeing charts and analytics here."
            action={
              <Link to="/food" className="btn-primary text-sm">
                Analyse Food to Log a Meal
              </Link>
            }
          />
        </Card>
      )}

      {/* Charts — only shown when meals exist */}
      {hasData && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: Flame,
                label: 'Avg Calories/Day',
                value: `${Math.round(w.averageCaloriesPerDay || 0)}`,
                unit: 'kcal',
                color: 'text-primary-600',
                bg: 'bg-primary-50',
              },
              {
                icon: Dumbbell,
                label: 'Weekly Protein',
                value: formatMacro(w.weeklyTotals?.protein),
                unit: 'g',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Apple,
                label: 'Weekly Carbs',
                value: formatMacro(w.weeklyTotals?.carbs),
                unit: 'g',
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                icon: TrendingUp,
                label: 'Calorie Target',
                value: `${s.targets?.calories || 2000}`,
                unit: 'kcal',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
            ].map(({ icon: Icon, label, value, unit, color, bg }) => (
              <Card key={label} className="p-4">
                <div className={`inline-flex items-center justify-center h-8 w-8 ${bg} rounded-lg mb-2`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="mt-0.5">
                  <span className="text-xl font-bold text-gray-900">
                    {value}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">{unit}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Weekly Calories Bar Chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Weekly Calories
                </h2>
                <p className="text-xs text-gray-400">
                  Daily calorie intake
                </p>
              </div>
              {w.targets?.calories && (
                <Badge variant="gray">
                  Target: {w.targets.calories} kcal
                </Badge>
              )}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={w.weeklyData}
                margin={{ top: 5, right: 10, bottom: 5, left: -15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="dayName"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="calories"
                  name="Calories"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Protein and Fat Line Chart */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                Protein & Fat Trend
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Grams per day over the week
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={w.weeklyData}
                  margin={{ top: 5, right: 10, bottom: 5, left: -15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="dayName"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip unit="g" />} />
                  <Line
                    type="monotone"
                    dataKey="protein"
                    name="Protein"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fat"
                    name="Fat"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Macro Distribution Pie Chart */}
            {w.macroDistribution?.length > 0 && (
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Macro Distribution
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  % of weekly calories by macronutrient
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={w.macroDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {w.macroDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, props) =>
                        [`${val}% (${props.payload.grams}g)`, name]
                      }
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {w.macroDistribution.map(({ name, value, grams, color }) => (
                    <div
                      key={name}
                      className="text-center p-2 bg-gray-50 rounded-lg"
                    >
                      <div
                        className="text-xs font-bold"
                        style={{ color }}
                      >
                        {value}%
                      </div>
                      <div className="text-xs text-gray-500">{name}</div>
                      <div className="text-xs text-gray-400">{grams}g</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Carbs Bar Chart */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              Carbohydrate Intake
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Daily carb intake in grams
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={w.weeklyData}
                margin={{ top: 0, right: 10, bottom: 0, left: -15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="dayName"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip unit="g" />} />
                <Bar
                  dataKey="carbs"
                  name="Carbs"
                  fill="#f59e0b"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Today's Progress vs Targets */}
          {s.targets && s.today && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Today's Progress vs Targets
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: 'Calories',
                    current: s.today.calories,
                    target: s.targets.calories,
                    unit: 'kcal',
                    color: '#22c55e',
                  },
                  {
                    label: 'Protein',
                    current: s.today.protein,
                    target: s.targets.protein,
                    unit: 'g',
                    color: '#3b82f6',
                  },
                  {
                    label: 'Carbs',
                    current: s.today.carbs,
                    target: s.targets.carbs,
                    unit: 'g',
                    color: '#f59e0b',
                  },
                  {
                    label: 'Fat',
                    current: s.today.fat,
                    target: s.targets.fat,
                    unit: 'g',
                    color: '#ef4444',
                  },
                ].map(({ label, current, target, unit, color }) => {
                  const pct = target
                    ? Math.min(100, Math.round((current / target) * 100))
                    : 0;
                  const over = pct >= 100;
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">
                          {label}
                        </span>
                        <span className="text-gray-900">
                          {typeof current === 'number'
                            ? current.toFixed(1) : 0}
                          {' / '}
                          {target} {unit}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: over ? '#ef4444' : color,
                          }}
                        />
                      </div>
                      <div
                        className="text-xs text-right"
                        style={{ color: over ? '#ef4444' : '#6b7280' }}
                      >
                        {pct}%{over && ' — over target'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}