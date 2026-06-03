import React from 'react';
import { Trash2, Plus, Coffee, Sun, Moon, Cookie } from 'lucide-react';

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

interface MealLoggerProps {
  logs: MealLog[];
  onDeleteLog: (id: number) => Promise<void>;
  onSwitchToSearch: (mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => void;
}

export const MealLogger: React.FC<MealLoggerProps> = ({ logs, onDeleteLog, onSwitchToSearch }) => {
  const mealTypes = [
    { name: 'Breakfast', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
    { name: 'Lunch', icon: Sun, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
    { name: 'Dinner', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-100' },
    { name: 'Snacks', icon: Cookie, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
  ] as const;

  const getLogsByMeal = (mealType: string) => {
    return logs.filter((log) => log.meal_type === mealType);
  };

  const calculateMealTotals = (mealType: string) => {
    const mealLogs = getLogsByMeal(mealType);
    return mealLogs.reduce(
      (acc, log) => {
        acc.calories += log.calories;
        acc.protein += log.protein;
        acc.carbs += log.carbs;
        acc.fat += log.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Today's Meals</h2>
        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
          {logs.length} items logged
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mealTypes.map(({ name, icon: Icon, color, bg }) => {
          const mealLogs = getLogsByMeal(name);
          const totals = calculateMealTotals(name);

          return (
            <div key={name} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Meal Header */}
              <div className={`p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white shadow-sm ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{name}</h3>
                    <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{Math.round(totals.calories)} kcal</span>
                      <span>•</span>
                      <span>P: {Math.round(totals.protein)}g</span>
                      <span>•</span>
                      <span>C: {Math.round(totals.carbs)}g</span>
                      <span>•</span>
                      <span>F: {Math.round(totals.fat)}g</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchToSearch(name)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Food
                </button>
              </div>

              {/* Meal Items */}
              <div className="divide-y divide-slate-100">
                {mealLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    No items logged for {name} yet.
                  </div>
                ) : (
                  mealLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{log.name}</h4>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            ({log.quantity} {log.serving_unit})
                          </span>
                        </div>
                        <div className="flex gap-2.5 text-xs text-slate-500 mt-1">
                          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">C: {Math.round(log.carbs)}g</span>
                          <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">P: {Math.round(log.protein)}g</span>
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">F: {Math.round(log.fat)}g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-700 text-sm whitespace-nowrap">
                          {Math.round(log.calories)} kcal
                        </span>
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};