import { useState, useRef, useCallback } from 'react';
import { foodService } from '../services/food.service';
import { mealService } from '../services/meal.service';
import { Card, Button, Alert, Badge, DemoBanner, Disclaimer, Spinner } from '../components/ui';
import { Camera, Upload, X, Zap, CheckCircle, RefreshCw, Save } from 'lucide-react';
import { formatCalories, formatMacro, getConfidenceColor, getConfidenceLabel } from '../utils/formatters';
import toast from 'react-hot-toast';

const ACCEPTED = '.jpg,.jpeg,.png,.webp';
const MAX_MB = 10;

function ConfidencePill({ confidence }) {
  if (confidence == null) return null;
  const pct = Math.round(confidence * 100);
  const color = confidence >= 0.8 ? 'green' : confidence >= 0.6 ? 'amber' : 'red';
  return <Badge variant={color}>{getConfidenceLabel(confidence)} confidence · {pct}%</Badge>;
}

function MacroChip({ label, value, unit = 'g', bg }) {
  return (
    <div className={`${bg} rounded-lg p-2.5 text-center`}>
      <div className="text-base font-bold text-gray-900">{value}{unit}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function FoodRecognition() {
  const [image, setImage]       = useState(null); // { file, preview }
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [saved, setSaved]       = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [servings, setServings] = useState({}); // food index → serving size (g)
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      toast.error('Only JPG, PNG, and WEBP images are supported');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_MB}MB`);
      return;
    }
    setImage({ file, preview: URL.createObjectURL(file) });
    setResult(null);
    setSaved(false);
    setError('');
    setServings({});
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append('image', image.file);
      const { data } = await foodService.analyzeImage(formData);
      const r = data.data;
      setResult(r);

      // Initialize servings with AI-detected values
      const initServings = {};
      (r.detectedFoods || []).forEach((f, i) => {
        initServings[i] = f.serving_size || f.servingSize || 100;
      });
      setServings(initServings);

      if (r.isDemo) toast('Demo mode — using sample food data', { icon: '⚠️' });
      else toast.success('Analysis complete!');
    } catch (err) {
      const msg = err.response?.data?.message || 'AI analysis failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError('');
    setSaved(false);
    setServings({});
    if (fileRef.current) fileRef.current.value = '';
  };

  const saveMeal = async () => {
    if (!result) return;
    try {
      const foodItems = (result.detectedFoods || []).map((food, i) => {
        const newServing = servings[i] ?? food.serving_size ?? 100;
        const ratio = newServing / (food.serving_size || food.servingSize || 100);
        const n = food.nutrition_per_serving || food.nutritionPerServing || {};
        return {
          name: food.name,
          servingSize: newServing,
          servingUnit: food.serving_unit || food.servingUnit || 'grams',
          calories:  parseFloat(((n.calories  || 0) * ratio).toFixed(1)),
          protein:   parseFloat(((n.protein   || 0) * ratio).toFixed(1)),
          carbs:     parseFloat(((n.carbs     || 0) * ratio).toFixed(1)),
          fat:       parseFloat(((n.fat       || 0) * ratio).toFixed(1)),
          fiber:     parseFloat(((n.fiber     || 0) * ratio).toFixed(1)),
          confidence: food.confidence,
          isEstimated: true,
          nutritionSource: result.provider || 'ai_estimated',
        };
      });

      await mealService.create({
        mealType: 'snack',
        mealDate: new Date().toISOString(),
        foodItems,
        imageUrl: result.imageUrl,
        aiAnalysis: {
          provider: result.provider,
          model: result.model,
          isEstimated: true,
        },
      });

      setSaved(true);
      toast.success('Meal saved to history!');
    } catch (err) {
      toast.error('Failed to save meal');
    }
  };

  // Recalculate nutrition for adjusted serving
  const getAdjustedNutrition = (food, idx) => {
    const newServing = servings[idx] ?? food.serving_size ?? 100;
    const ratio = newServing / (food.serving_size || 100);
    const n = food.nutrition_per_serving || {};
    return {
      calories: parseFloat(((n.calories || 0) * ratio).toFixed(1)),
      protein:  parseFloat(((n.protein  || 0) * ratio).toFixed(1)),
      carbs:    parseFloat(((n.carbs    || 0) * ratio).toFixed(1)),
      fat:      parseFloat(((n.fat      || 0) * ratio).toFixed(1)),
    };
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">AI Food Recognition</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a food photo — AI identifies what's in it and estimates nutrition
        </p>
      </div>

      {/* Upload Area */}
      {!image ? (
        <Card className="p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/40'}`}
          >
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Upload className="h-7 w-7 text-primary-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {dragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max {MAX_MB}MB</p>
          </div>
          <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>AI identifies food items and estimates nutrition — works best with clear, well-lit photos</span>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Image Preview + Controls */}
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="relative shrink-0">
                <img src={image.preview} alt="Food" className="h-36 w-36 object-cover rounded-xl border border-gray-100" />
                <button onClick={reset} className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{image.file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(image.file.size / 1024).toFixed(0)} KB · {image.file.type}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={analyze} loading={loading} disabled={loading}>
                    {loading ? 'Analyzing…' : (
                      <><Zap className="h-4 w-4" />Analyze with AI</>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={reset} disabled={loading}>
                    <RefreshCw className="h-4 w-4" />Change
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card className="p-8 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="h-14 w-14 bg-primary-50 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
              </div>
              <div className="text-sm font-medium text-gray-700">AI is analyzing your food…</div>
              <div className="text-xs text-gray-400">Identifying items and estimating nutrition</div>
            </Card>
          )}

          {/* Error */}
          {error && <Alert type="error">{error}</Alert>}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in">
              {result.isDemo && <DemoBanner />}

              {/* Provider info */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Zap className="h-3.5 w-3.5 text-primary-400" />
                Provider: <strong>{result.provider}</strong>
                {result.model && <> · Model: <strong>{result.model}</strong></>}
                <Badge variant="amber">Estimated</Badge>
              </div>

              {/* Detected Foods */}
              {(result.detectedFoods || []).map((food, i) => {
                const adj = getAdjustedNutrition(food, i);
                return (
                  <Card key={i} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{food.name}</h3>
                        {food.category && <p className="text-xs text-gray-400 capitalize mt-0.5">{food.category}</p>}
                      </div>
                      <ConfidencePill confidence={food.confidence} />
                    </div>

                    {/* Serving Adjustment */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-600 shrink-0">Serving size</label>
                      <input
                        type="number"
                        min="1" max="2000"
                        value={servings[i] ?? food.serving_size ?? 100}
                        onChange={(e) => setServings(s => ({ ...s, [i]: parseFloat(e.target.value) || 100 }))}
                        className="w-20 form-input text-xs py-1.5 px-2 text-center"
                      />
                      <span className="text-xs text-gray-500">grams</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        AI estimate: {food.serving_size || 100}g
                      </span>
                    </div>

                    {/* Nutrition Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      <MacroChip label="Calories" value={Math.round(adj.calories)} unit=" kcal" bg="bg-primary-50" />
                      <MacroChip label="Protein"  value={adj.protein}  bg="bg-blue-50" />
                      <MacroChip label="Carbs"    value={adj.carbs}    bg="bg-amber-50" />
                      <MacroChip label="Fat"      value={adj.fat}      bg="bg-red-50" />
                    </div>

                    {/* Alternatives */}
                    {food.alternatives?.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">Alternatives:</span>
                        {food.alternatives.map((alt) => (
                          <Badge key={alt} variant="gray">{alt}</Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}

              {/* Save CTA */}
              <div className="flex gap-2">
                {!saved ? (
                  <Button onClick={saveMeal} className="flex-1">
                    <Save className="h-4 w-4" />Save to Meal History
                  </Button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-50 rounded-lg text-primary-700 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />Saved to meal history
                  </div>
                )}
                <Button variant="secondary" onClick={reset}>
                  <Camera className="h-4 w-4" />New
                </Button>
              </div>

              <Disclaimer />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
