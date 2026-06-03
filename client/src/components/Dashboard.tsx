import React, { useState } from 'react';
import { Flame, Target, Utensils, Sparkles, Edit2, Check, X } from 'lucide-react';

interface MealLog {
  id: number;
  food_id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  quantity: number;
  serving_unit: string;
  logged_at: string;
}

interface DashboardProps {
  logs: MealLog[];
  targetCalories: number;
  onUpdateGoal: (newGoal: number) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, targetCalories, onUpdateGoal }) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(targetCalories.toString());
  const [isSaving, setIsSaving] = useState(false);

  // Calculate totals
  const totalCalories = Math.round(logs.reduce((sum, log) => sum + log.calories, 0));
  const totalProtein = Math.round(logs.reduce((sum, log) => sum + log.protein, 0));
  const totalCarbs = Math.round(logs.reduce((sum, log) => sum + log.carbs, 0));
  const totalFat = Math.round(logs.reduce((sum, log) => sum + log.fat, 0));

  // Macro targets (Standard healthy ratio: 50% Carbs, 20% Protein, 30% Fat)
  // Carbs: 4 kcal/g, Protein: 4 kcal/g, Fat: 9 kcal/g
  const targetCarbs = Math.round((targetCalories * 0.5) / 4);
  const targetProtein = Math.round((targetCalories * 0.2) / 4);
  const targetFat = Math.round((targetCalories * 0.3) / 9);

  const remainingCalories = Math.max(0, targetCalories - totalCalories);
  const caloriePercentage = Math.min(100, Math.round((totalCalories / targetCalories) * 100)) || 0;

  // Meal type breakdown
  const mealBreakdown = logs.reduce(
    (acc, log) => {
      acc[log.meal_type] = (acc[log.meal_type] || 0) + log.calories;
      return acc;
    },
    { Breakfast: 0, Lunch: 0, Dinner: 0, Snacks: 0 } as Record<string, number>
  );

  const handleSaveGoal = async () => {
    const parsed = parseInt(tempGoal, 10);
    if (isNaN(parsed) || parsed <= 0) return;
    setIsSaving(true);
    try {
      await onUpdateGoal(parsed);
      setIsEditingGoal(false);
    } catch (error) {
      console.error('Failed to update goal', error);
    } finally {
      setIsSaving(false);
    }
  };

  // SVG Progress Ring parameters
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  // Dynamic motivational message
  const getMotivationalMessage = () => {
    if (totalCalories === 0) return "Ready to start your day? Log your first Indian meal!";
    if (totalCalories < targetCalories * 0.5) return "Great start! Keep tracking to hit your goals.";
    if (totalCalories < targetCalories) return "You're doing amazing! Almost at your daily target.";
    if (totalCalories === targetCalories) return "Perfect! You hit your calorie goal exactly!";
    return "You've exceeded your calorie goal. Balance it out with some light activity!";
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Goal Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <h2 className="text-xl font-bold">Aapka Health Dashboard</h2>
            </div>
            <p className="text-emerald-100 text-sm mt-1">{getMotivationalMessage()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 border border-white/20">
            <Target className="w-5 h-5 text-amber-300" />
            <div>
              <span className="text-xs text-emerald-100 block">Daily Calorie Goal</span>
              {isEditingGoal ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-20 bg-white text-slate-800 px-2 py-0.5 rounded text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    min="500"
                    max="10000"
                  />
                  <button onClick={handleSaveGoal} disabled={isSaving} className="p-1 hover:bg-white/20 rounded text-white">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIsEditingGoal(false); setTempGoal(targetCalories.toString()); }} className="p-1 hover:bg-white/20 rounded text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{targetCalories} kcal</span>
                  <button onClick={() => setIsEditingGoal(true)} className="p-1 hover:bg-white/20 rounded text-emerald-100 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Progress Ring Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Calorie Tracker
          </h3>
          <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#f1f5f9"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="url(#emeraldGradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-800">{totalCalories}</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">of {targetCalories} kcal</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-4 border-t border-slate-100">
            <div className="text-center">
              <span className="text-xs text-slate-400 block">Remaining</span>
              <span className="text-lg font-bold text-emerald-600">{remainingCalories} kcal</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="text-xs text-slate-400 block">Logged</span>
              <span className="text-lg font-bold text-slate-700">{caloriePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Macronutrient Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-500" /> Macronutrients
            </h3>
            <div className="space-y-4">
              {/* Carbs */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Carbohydrates</span>
                  <span className="text-slate-500 text-xs">{totalCarbs}g / {targetCarbs}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Protein</span>
                  <span className="text-slate-500 text-xs">{totalProtein}g / {targetProtein}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Fats</span>
                  <span className="text-slate-500 text-xs">{totalFat}g / {targetFat}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
              <span className="text-slate-500">Carbs ({totalCarbs * 4} kcal)</span>
            </div>
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1"></span>
              <span className="text-slate-500">Protein ({totalProtein * 4} kcal)</span>
            </div>
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>
              <span className="text-slate-500">Fat ({totalFat * 9} kcal)</span>
            </div>
          </div>
        </div>

        {/* Meal Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-700 font-semibold mb-4">Meal Distribution</h3>
            <div className="space-y-3">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((meal) => {
                const calories = mealBreakdown[meal];
                const percentage = totalCalories > 0 ? Math.round((calories / totalCalories) * 100) : 0;
                return (
                  <div key={meal} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${
                        meal === 'Breakfast' ? 'bg-amber-400' :
                        meal === 'Lunch' ? 'bg-emerald-400' :
                        meal === 'Dinner' ? 'bg-indigo-400' : 'bg-rose-400'
                      }`} />
                      <div>
                        <span className="font-medium text-slate-700 text-sm block">{meal}</span>
                        <span className="text-xs text-slate-400">{percentage}% of daily intake</span>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">{calories} kcal</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};