import { useState } from 'react';
import { Link } from 'react-router-dom';
import { foodService } from '../services/food.service';
import { mealService } from '../services/meal.service';
import { Card, Button, Alert, Badge, Select, Input, DemoBanner, Disclaimer } from '../components/ui';
import { Upload, Save, CheckCircle, Camera, Zap } from 'lucide-react';
import { getMealTypeLabel } from '../utils/formatters';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast','mid_morning','lunch','evening_snack','dinner','snack','other'];

export default function MealAnalyzer() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file?.type.match(/image\/(jpeg|jpg|png|webp)/)) { toast.error('Invalid file type'); return; }
    if (file.size > 10*1024*1024) { toast.error('File too large (max 10MB)'); return; }
    setImage({ file, preview: URL.createObjectURL(file) });
    setResult(null); setSaved(false); setError('');
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true); setError('');
    try {
      const fd = new FormData(); fd.append('image', image.file);
      const { data } = await foodService.analyzeImage(fd);
      setResult(data.data);
      if (data.data.isDemo) toast('Demo mode active', { icon: '⚠️' });
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const saveMeal = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const foodItems = (result.detectedFoods || []).map(f => {
        const n = f.nutrition_per_serving || {};
        return { name: f.name, servingSize: f.serving_size || 100, servingUnit: f.serving_unit || 'grams',
          calories: n.calories || 0, protein: n.protein || 0, carbs: n.carbs || 0,
          fat: n.fat || 0, fiber: n.fiber || 0, confidence: f.confidence, isEstimated: true };
      });
      await mealService.create({ mealType, mealDate: new Date().toISOString(), foodItems,
        imageUrl: result.imageUrl, notes,
        aiAnalysis: { provider: result.provider, model: result.model, isEstimated: true } });
      setSaved(true); toast.success('Meal saved!');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const totalCals = (result?.detectedFoods || []).reduce((s, f) => s + (f.nutrition_per_serving?.calories || 0), 0);

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Meal Analyzer</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload food photo → AI analyzes → Log to history</p>
      </div>
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Select label="Meal Type" value={mealType} onChange={e => setMealType(e.target.value)}>
            {MEAL_TYPES.map(t => <option key={t} value={t}>{getMealTypeLabel(t)}</option>)}
          </Select>
          <Input label="Notes (optional)" placeholder="e.g. home-cooked" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {!image ? (
          <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}
            onClick={() => document.getElementById('ma-file').click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
            <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Drop food image here or click to browse</p>
            <input id="ma-file" type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp" onChange={e=>handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <img src={image.preview} className="h-32 w-32 object-cover rounded-xl border border-gray-100" alt="Food" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-gray-900">{image.file.name}</p>
                <p className="text-xs text-gray-400">{(image.file.size/1024).toFixed(0)} KB</p>
                <div className="flex gap-2">
                  <Button onClick={analyze} loading={loading}><Zap className="h-4 w-4"/>Analyze</Button>
                  <Button variant="secondary" onClick={()=>{setImage(null);setResult(null);setSaved(false);}}>Change</Button>
                </div>
              </div>
            </div>
            {error && <Alert type="error">{error}</Alert>}
            {result && (
              <div className="space-y-3 animate-fade-in">
                {result.isDemo && <DemoBanner/>}
                <div className="grid grid-cols-2 gap-2">
                  {(result.detectedFoods||[]).map((f,i)=>(
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{f.name}</span>
                        {f.confidence && <Badge variant={f.confidence>=0.8?'green':'amber'} className="text-xs">{Math.round(f.confidence*100)}%</Badge>}
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(f.nutrition_per_serving?.calories||0)} kcal · {(f.nutrition_per_serving?.protein||0).toFixed(1)}g protein
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <span className="text-sm font-medium text-primary-800">Total Estimated</span>
                  <span className="text-lg font-bold text-primary-700">{Math.round(totalCals)} kcal</span>
                </div>
                {!saved ? (
                  <Button onClick={saveMeal} loading={saving} className="w-full">
                    <Save className="h-4 w-4"/>Save as {getMealTypeLabel(mealType)}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-primary-50 rounded-lg text-primary-700 text-sm font-medium">
                    <CheckCircle className="h-4 w-4"/>Meal saved! <Link to="/history" className="underline">View history</Link>
                  </div>
                )}
                <Disclaimer/>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
