import React, { useState } from 'react';
import { DailyGoal } from '../types';
import { Edit2, Check, X, Flame, Wheat, ShieldAlert, Droplet } from 'lucide-react';

interface DashboardProps {
  dailyGoal: DailyGoal;
  setDailyGoal: (goal: DailyGoal) => void;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  dailyGoal,
  setDailyGoal,
  totalCalories,
  totalCarbs,
  totalProtein,
  totalFat,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editGoal, setEditGoal] = useState<DailyGoal>({ ...dailyGoal });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyGoal(editGoal);
    setIsEditing(false);
  };

  const handleCalorieChange = (val: number) => {
    // Automatically calculate proportional macros:
    // Carbs: 50% of calories (4 kcal/g)
    // Protein: 20% of calories (4 kcal/g)
    // Fat: 30% of calories (9 kcal/g)
    const carbs = Math.round((val * 0.50) / 4);
    const protein = Math.round((val * 0.20) / 4);
    const fat = Math.round((val * 0.30) / 9);
    setEditGoal({
      calories: val,
      carbs,
      protein,
      fat,
    });
  };

  const caloriePercentage = Math.min(Math.round((totalCalories / dailyGoal.calories) * 100), 999);
  const remainingCalories = dailyGoal.calories - totalCalories;
  const isOverGoal = remainingCalories < 0;

  // SVG Circle properties
  const radius = 75;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(caloriePercentage, 100) / 100) * circumference;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
          <Flame className="text-amber-500 animate-pulse" size={24} />
          Daily Chakra
        </h2>
        {!isEditing && (
          <button
            onClick={() => {
              setEditGoal({ ...dailyGoal });
              setIsEditing(true);
            }}
            className="p-2 bg-white/5 hover:bg-white/15 rounded-lg transition-all duration-200 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 text-xs font-medium"
            title="Edit Daily Goals"
          >
            <Edit2 size={14} />
            Edit Goals
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5 animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-amber-300">Adjust Daily Targets</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
              <button
                type="submit"
                className="p-1 bg-amber-500 hover:bg-amber-600 rounded text-black font-bold"
              >
                <Check size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Calorie Goal (kcal)</label>
            <input
              type="number"
              min="1000"
              max="10000"
              value={editGoal.calories}
              onChange={(e) => handleCalorieChange(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 text-sm"
              required
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Auto-allocates: 50% Carbs, 20% Protein, 30% Fat
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div>
              <label className="block text-[10px] text-gray-300 mb-1">Carbs (g)</label>
              <input
                type="number"
                min="10"
                max="1000"
                value={editGoal.carbs}
                onChange={(e) => setEditGoal({ ...editGoal, carbs: Number(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-300 mb-1">Protein (g)</label>
              <input
                type="number"
                min="10"
                max="500"
                value={editGoal.protein}
                onChange={(e) => setEditGoal({ ...editGoal, protein: Number(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-300 mb-1">Fat (g)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={editGoal.fat}
                onChange={(e) => setEditGoal({ ...editGoal, fat: Number(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500 text-xs"
                required
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center py-4">
          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center mb-6">
            <svg className="w-44 h-44 transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-white/5"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress Circle */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-amber-500 transition-all duration-500 ease-out"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))',
                }}
              />
            </svg>

            {/* Inner Text */}
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {totalCalories.toLocaleString()}
              </span>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                kcal logged
              </span>
              <span className="text-[11px] text-gray-400 mt-1">
                Goal: {dailyGoal.calories}
              </span>
            </div>
          </div>

          {/* Remaining / Surplus Badge */}
          <div className="w-full text-center mb-8">
            {isOverGoal ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-full text-rose-300 text-sm font-semibold animate-bounce">
                <ShieldAlert size={16} />
                Surplus of {Math.abs(remainingCalories).toLocaleString()} kcal
              </div>
            ) : (
              <div className="inline-flex flex-col items-center">
                <div className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-semibold">
                  {remainingCalories.toLocaleString()} kcal remaining
                </div>
                <span className="text-xs text-gray-400 mt-1.5">
                  {caloriePercentage}% of daily goal achieved
                </span>
              </div>
            )}
          </div>

          {/* Macronutrient Progress Bars */}
          <div className="w-full space-y-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Macronutrients</h3>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-amber-300 font-medium">
                  <Wheat size={14} />
                  Carbs
                </span>
                <span className="text-gray-300">
                  <strong className="text-white">{totalCarbs}g</strong> / {dailyGoal.carbs}g
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalCarbs / dailyGoal.carbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Flame size={14} />
                  Protein
                </span>
                <span className="text-gray-300">
                  <strong className="text-white">{totalProtein}g</strong> / {dailyGoal.protein}g
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalProtein / dailyGoal.protein) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <Droplet size={14} />
                  Fat
                </span>
                <span className="text-gray-300">
                  <strong className="text-white">{totalFat}g</strong> / {dailyGoal.fat}g
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalFat / dailyGoal.fat) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};