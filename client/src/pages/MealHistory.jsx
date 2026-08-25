import { useState, useEffect, useCallback } from 'react';
import { mealService } from '../services/meal.service';
import { Card, Button, Badge, EmptyState, SkeletonCard, Modal, Alert } from '../components/ui';
import { Trash2, Eye, Camera, ImageOff } from 'lucide-react';
import {
  formatDate, formatMacro, getMealTypeLabel, getMealTypeIcon
} from '../utils/formatters';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MEAL_TYPES = [
  '', 'breakfast', 'mid_morning', 'lunch',
  'evening_snack', 'dinner', 'snack', 'other'
];

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
}

function MealImage({ url, alt = 'Meal photo' }) {
  const [errored, setErrored] = useState(false);
  const src = resolveImageUrl(url);

  if (!src || errored) {
    return (
      <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <ImageOff className="h-5 w-5 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="h-14 w-14 object-cover rounded-xl border border-gray-100 shrink-0"
    />
  );
}

export default function MealHistory() {
  const [meals, setMeals]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [mealType, setMealType]   = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [order, setOrder]         = useState('desc');
  const [deleteId, setDeleteId]   = useState(null);
  const [viewMeal, setViewMeal]   = useState(null);
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit, order };
      if (mealType)  params.mealType  = mealType;
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;

      const { data } = await mealService.getAll(params);
      setMeals(data.data.meals);
      setTotal(data.data.pagination.total);
    } catch {
      setError('Failed to load meal history');
    } finally {
      setLoading(false);
    }
  }, [page, mealType, startDate, endDate, order]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await mealService.delete(deleteId);
      toast.success('Meal deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete meal');
    }
  };

  const resetFilters = () => {
    setMealType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Meal History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} meals recorded
          </p>
        </div>
        <Link to="/food" className="btn-primary text-xs gap-1.5">
          <Camera className="h-4 w-4" />Log Meal
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={mealType}
            onChange={e => { setMealType(e.target.value); setPage(1); }}
            className="form-input w-auto text-xs"
          >
            <option value="">All Meal Types</option>
            {MEAL_TYPES.filter(Boolean).map(t => (
              <option key={t} value={t}>{getMealTypeLabel(t)}</option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1); }}
            className="form-input w-auto text-xs"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1); }}
            className="form-input w-auto text-xs"
          />

          <select
            value={order}
            onChange={e => setOrder(e.target.value)}
            className="form-input w-auto text-xs"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {(mealType || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-red-500 underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {error && <Alert type="error">{error}</Alert>}

      {/* Meal List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : meals.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="No meals found"
          description="No meals match your filters, or you have not logged any meals yet."
          action={
            <Link to="/food" className="btn-primary text-sm">
              Analyse Food to Log a Meal
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {meals.map(meal => (
            <Card
              key={meal._id}
              className="p-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">

                  {/* Show real meal photo if available, otherwise show emoji */}
                  {meal.imageUrl ? (
                    <MealImage
                      url={meal.imageUrl}
                      alt={getMealTypeLabel(meal.mealType)}
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-2xl">
                      {getMealTypeIcon(meal.mealType)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {getMealTypeLabel(meal.mealType)}
                      </span>
                      <Badge variant="gray" className="text-xs">
                        {formatDate(meal.mealDate)}
                      </Badge>
                      {meal.aiAnalysis?.isEstimated && (
                        <Badge variant="amber" className="text-xs">
                          Estimated
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {meal.foodItems?.map(f => f.name).join(', ')
                        || 'No items recorded'}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="font-semibold text-primary-700">
                        {Math.round(meal.totalCalories)} kcal
                      </span>
                      <span className="text-gray-400">
                        P:{formatMacro(meal.totalProtein)}
                      </span>
                      <span className="text-gray-400">
                        C:{formatMacro(meal.totalCarbs)}
                      </span>
                      <span className="text-gray-400">
                        F:{formatMacro(meal.totalFat)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setViewMeal(meal)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(meal._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="secondary" size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </Button>
          <span className="text-xs text-gray-500">
            Page {page} of {pages}
          </span>
          <Button
            variant="secondary" size="sm"
            disabled={page === pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      {/* View Meal Detail Modal */}
      <Modal
        open={!!viewMeal}
        onClose={() => setViewMeal(null)}
        title={viewMeal
          ? `${getMealTypeLabel(viewMeal.mealType)} — ${formatDate(viewMeal.mealDate)}`
          : ''}
      >
        {viewMeal && (
          <div className="space-y-4">

            {/* Show image at top of modal if available */}
            {viewMeal.imageUrl && (
              <img
                src={resolveImageUrl(viewMeal.imageUrl)}
                alt="Meal photo"
                className="w-full h-48 object-cover rounded-xl border border-gray-100"
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}

            {/* Nutrition summary */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Calories', value: `${Math.round(viewMeal.totalCalories)} kcal`, color: 'bg-primary-50' },
                { label: 'Protein',  value: formatMacro(viewMeal.totalProtein), color: 'bg-blue-50' },
                { label: 'Carbs',    value: formatMacro(viewMeal.totalCarbs),   color: 'bg-amber-50' },
                { label: 'Fat',      value: formatMacro(viewMeal.totalFat),     color: 'bg-red-50' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`${color} rounded-lg p-2`}>
                  <div className="text-xs font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Food items list */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Food Items
              </div>
              <div className="space-y-2">
                {(viewMeal.foodItems || []).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.servingSize}{item.servingUnit}
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      <div className="font-semibold">
                        {Math.round(item.calories)} kcal
                      </div>
                      <div className="text-gray-400">
                        P:{item.protein}g C:{item.carbs}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {viewMeal.aiAnalysis?.provider && (
              <div className="text-xs text-gray-400">
                Analysed by: {viewMeal.aiAnalysis.provider}
                {viewMeal.aiAnalysis.isEstimated && ' · Estimated values'}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Meal"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete this meal? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}