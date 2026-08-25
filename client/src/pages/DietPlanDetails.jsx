import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dietService } from '../services/diet.service';
import { Card, Button, Badge, Alert, DemoBanner, Spinner, EmptyState, Modal } from '../components/ui';
import {
  ChevronLeft, Wand2, Trash2, Send, ChevronDown, ChevronUp,
  Clock, DollarSign, Flame, Zap, BookOpen
} from 'lucide-react';
import { formatCalories, formatMacro, formatCost, getMealTypeLabel, getMealTypeIcon } from '../utils/formatters';
import toast from 'react-hot-toast';

function FoodRow({ food }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">{food.name}</span>
          {food.is_regional && <Badge variant="green" className="text-xs">Regional</Badge>}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{food.quantity}</div>
        {food.alternatives?.length > 0 && (
          <div className="text-xs text-gray-400 mt-0.5">
            Alt: {food.alternatives.slice(0, 2).join(', ')}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-semibold text-gray-900">{Math.round(food.calories)} kcal</div>
        <div className="text-xs text-gray-400">P:{food.protein}g C:{food.carbs}g F:{food.fat}g</div>
        {food.approximate_cost_inr != null && (
          <div className="text-xs text-amber-600 mt-0.5">{formatCost(food.approximate_cost_inr)}</div>
        )}
      </div>
    </div>
  );
}

function MealCard({ meal }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span>{getMealTypeIcon(meal.meal_type || meal.mealType)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{getMealTypeLabel(meal.meal_type || meal.mealType)}</div>
            {meal.time && <div className="text-xs text-gray-400">{meal.time}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{Math.round(meal.total_calories || meal.totalCalories || 0)} kcal</div>
            {meal.total_cost_inr != null && (
              <div className="text-xs text-amber-600">{formatCost(meal.total_cost_inr || meal.totalCostINR)}</div>
            )}
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 py-2 bg-white divide-y divide-gray-50">
          {(meal.foods || []).map((food, i) => <FoodRow key={i} food={food} />)}
          {meal.notes && (
            <p className="text-xs text-gray-500 italic pt-2">{meal.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

function DayCard({ day }) {
  const [open, setOpen] = useState(day.day_number === 1);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-700">{day.day_number}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{day.day_name}</div>
            <div className="text-xs text-gray-400">{day.meals?.length || 0} meals</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-gray-900">{Math.round(day.total_calories || 0)} kcal</div>
            <div className="text-xs text-gray-400">
              P:{formatMacro(day.total_protein)} C:{formatMacro(day.total_carbs)} F:{formatMacro(day.total_fat)}
            </div>
          </div>
          {day.total_cost_inr != null && (
            <Badge variant="amber">{formatCost(day.total_cost_inr)}</Badge>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-2">
          {(day.meals || []).map((meal, i) => <MealCard key={i} meal={meal} />)}
        </div>
      )}
    </Card>
  );
}

export default function DietPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modInput, setModInput]     = useState('');
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError]     = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

  const quickMods = [
    'Replace paneer with tofu in all meals',
    'Make lunches more budget-friendly',
    'Add more protein to breakfast',
    'Use foods common in Uttar Pradesh',
    'Make the plan more vegetarian-friendly',
    'Reduce oil and fat in dinners',
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await dietService.getOne(id);
        setPlan(data.data.plan);
      } catch {
        setError('Could not load diet plan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleModify = async (instruction) => {
    const instr = instruction || modInput.trim();
    if (!instr) return;

    setModLoading(true);
    setModError('');
    try {
      const { data } = await dietService.modify(id, instr);
      setPlan(data.data.plan);
      setModInput('');
      toast.success('Plan updated!');
      if (data.data.isDemo) toast('Demo mode — modification simulated', { icon: '⚠️' });
    } catch (err) {
      setModError(err.response?.data?.message || 'Modification failed');
    } finally {
      setModLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dietService.delete(id);
      toast.success('Plan deleted');
      navigate('/diet');
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Spinner size="lg" className="text-primary-500" />
    </div>
  );

  if (error || !plan) return (
    <EmptyState
      icon="📋"
      title="Plan not found"
      description={error || 'This diet plan could not be loaded'}
      action={<Link to="/diet" className="btn-secondary">← Back to Plans</Link>}
    />
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/diet" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-1">
            <ChevronLeft className="h-3 w-3" />Back to plans
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{plan.title}</h1>
          {plan.description && <p className="text-sm text-gray-500 mt-0.5 max-w-lg">{plan.description}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setDeleteModal(true)} className="text-red-500 hover:bg-red-50 shrink-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {plan.isActive === false && <Badge variant="gray">Inactive</Badge>}
      {plan.aiProvider === 'demo' && <DemoBanner />}

      {/* Plan Stats */}
      {plan.days?.length > 0 && (() => {
        const avg = plan.days.reduce((s, d) => s + (d.total_calories || 0), 0) / plan.days.length;
        const avgCost = plan.days.reduce((s, d) => s + (d.total_cost_inr || 0), 0) / plan.days.length;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Flame, label: 'Avg Calories/Day', value: `${Math.round(avg)} kcal`, color: 'text-primary-600' },
              { icon: DollarSign, label: 'Avg Cost/Day', value: formatCost(avgCost), color: 'text-amber-600' },
              { icon: BookOpen, label: 'Duration', value: `${plan.days.length} days`, color: 'text-blue-600' },
              { icon: Zap, label: 'AI Provider', value: plan.aiProvider || 'AI', color: 'text-purple-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="p-4">
                <Icon className={`h-4 w-4 ${color} mb-1.5`} />
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
              </Card>
            ))}
          </div>
        );
      })()}

      {/* AI Modification Panel */}
      <Card className="p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Wand2 className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900">Modify with AI</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Ask AI to change any aspect of this plan using plain language
        </p>
        <div className="flex gap-2 mb-3">
          <textarea
            value={modInput}
            onChange={(e) => setModInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleModify())}
            placeholder="e.g. 'Replace paneer with tofu', 'Make breakfast simpler', 'Use more Lucknow foods'"
            rows={2}
            className="flex-1 form-input resize-none text-sm"
            disabled={modLoading}
          />
          <Button onClick={() => handleModify()} loading={modLoading} disabled={!modInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {modError && <Alert type="error" className="mb-2">{modError}</Alert>}
        <div className="flex flex-wrap gap-1.5">
          {quickMods.map((m) => (
            <button key={m} onClick={() => handleModify(m)} disabled={modLoading}
              className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors disabled:opacity-50">
              {m}
            </button>
          ))}
        </div>
      </Card>

      {/* 7-Day Plan */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">7-Day Plan</h2>
        {(plan.days || []).map((day) => <DayCard key={day.day_number} day={day} />)}
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-400 border border-gray-100">
        ⚠️ AI-generated estimates. Prices are approximate. Consult a qualified nutritionist for medical dietary advice.
        This plan is for educational and informational purposes only.
      </div>

      {/* Delete Confirm */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Diet Plan">
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <strong>{plan.title}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
