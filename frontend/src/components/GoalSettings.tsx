import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  Flame, 
  Check, 
  Info 
} from 'lucide-react';
import { DailyGoal } from '../types';

interface GoalSettingsProps {
  currentGoal: DailyGoal;
  onUpdateGoal: (goal: Omit<DailyGoal, 'id'>) => Promise<void>;
}

export const GoalSettings: React.FC<GoalSettingsProps> = ({
  currentGoal,
  onUpdateGoal,
}) => {
  const [calories, setCalories] = useState<string>(currentGoal.calories.toString());
  const [protein, setProtein] = useState<string>(currentGoal.protein.toString());
  const [carbs, setCarbs] = useState<string>(currentGoal.carbs.toString());
  const [fat, setFat] = useState<string>(currentGoal.fat.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Macro distribution presets
  const applyPreset = (type: 'balanced' | 'highProtein' | 'lowCarb') => {
    const calVal = parseFloat(calories) || 2000;
    
    let pPct = 0.20;
    let cPct = 0.50;
    let fPct = 0.30;

    if (type === 'highProtein') {
      pPct = 0.30;
      cPct = 0.40;
      fPct = 0.30;
    } else if (type === 'lowCarb') {
      pPct = 0.35;
      cPct = 0.15;
      fPct = 0.50;
    }

    // Calculate grams
    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    const pGrams = Math.round((calVal * pPct) / 4);
    const cGrams = Math.round((calVal * cPct) / 4);
    const fGrams = Math.round((calVal * fPct) / 9);

    setProtein(pGrams.toString());
    setCarbs(cGrams.toString());
    setFat(fGrams.toString());
    
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    const calVal = parseInt(calories);
    const protVal = parseInt(protein);
    const carbVal = parseInt(carbs);
    const fatVal = parseInt(fat);

    if (isNaN(calVal) || calVal <= 0 ||
        isNaN(protVal) || protVal < 0 ||
        isNaN(carbVal) || carbVal < 0 ||
        isNaN(fatVal) || fatVal < 0) {
      setError('Please enter valid positive numbers for all goals');
      setIsSaving(false);
      return;
    }

    // Validate macro calorie sum roughly matches calorie goal
    const calculatedCalories = (protVal * 4) + (carbVal * 4) + (fatVal * 9);
    const difference = Math.abs(calculatedCalories - calVal);
    
    if (difference > 150) {
      // Just a warning, but we let them save
      console.warn(`Macro calories (${calculatedCalories} kcal) differ from total calorie goal (${calVal} kcal)`);
    }

    try {
      await onUpdateGoal({
        date: currentGoal.date,
        calories: calVal,
        protein: protVal,
        carbs: carbVal,
        fat: fatVal,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update goals');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Goal Configuration</h2>
        <p className="text-slate-500 text-sm">Set your daily calorie and macronutrient targets to align with your fitness journey.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 flex items-center space-x-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <span>Goals updated successfully!</span>
            </div>
          )}

          {/* Calorie Goal Input */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Daily Calorie Target</h3>
                <p className="text-xs text-slate-400">Total energy budget for the day</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                required
                min="500"
                max="10000"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-32 px-3.5 py-2 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-right"
              />
              <span className="text-sm font-bold text-slate-400 uppercase">kcal</span>
            </div>
          </div>

          {/* Macro Presets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Sparkles className="h-4 w-4 text-amber-500 mr-1.5" />
              Quick Macro Presets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => applyPreset('balanced')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all"
              >
                <span className="font-bold text-slate-800 text-sm block">Balanced Diet</span>
                <span className="text-xs text-slate-400 block mt-0.5">50% Carbs, 20% Protein, 30% Fat</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('highProtein')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all"
              >
                <span className="font-bold text-slate-800 text-sm block">High Protein</span>
                <span className="text-xs text-slate-400 block mt-0.5">40% Carbs, 30% Protein, 30% Fat</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('lowCarb')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all"
              >
                <span className="font-bold text-slate-800 text-sm block">Low Carb / Keto</span>
                <span className="text-xs text-slate-400 block mt-0.5">15% Carbs, 35% Protein, 50% Fat</span>
              </button>
            </div>
          </div>

          {/* Macro Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {/* Protein */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                Protein Goal
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  required
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">grams</span>
              </div>
            </div>

            {/* Carbs */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                Carbohydrates Goal
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  required
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">grams</span>
              </div>
            </div>

            {/* Fat */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
                <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
                Fat Goal
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  required
                  min="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400">grams</span>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-start space-x-2.5">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Calorie Math:</strong> 1g of Protein = 4 kcal, 1g of Carbohydrates = 4 kcal, and 1g of Fat = 9 kcal. 
              Your current macro configuration sums up to <strong>{((parseInt(protein) || 0) * 4) + ((parseInt(carbs) || 0) * 4) + ((parseInt(fat) || 0) * 9)} kcal</strong>.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-100 transition-all flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>{isSaving ? 'Saving Goals...' : 'Save Goals'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};