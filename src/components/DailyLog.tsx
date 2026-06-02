import React from 'react';
import { LogEntry, MealType } from '../types';
import { getFoodEmoji } from '../data/indianFoods';
import { Trash2, Plus, Minus, Coffee, Utensils, Moon, Cookie } from 'lucide-react';

interface DailyLogProps {
  logs: LogEntry[];
  onUpdateServings: (logId: string, servings: number) => void;
  onDeleteLog: (logId: string) => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({
  logs,
  onUpdateServings,
  onDeleteLog,
}) => {
  const mealTypes: { type: MealType; icon: React.ReactNode; color: string; bg: string }[] = [
    {
      type: 'Breakfast',
      icon: <Coffee size={18} />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      type: 'Lunch',
      icon: <Utensils size={18} />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      type: 'Dinner',
      icon: <Moon size={18} />,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      type: 'Snacks',
      icon: <Cookie size={18} />,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    },
  ];

  // Group logs by meal type
  const logsByMeal = mealTypes.map((meal) => {
    const mealLogs = logs.filter((log) => log.mealType === meal.type);
    const totalCalories = mealLogs.reduce((sum, log) => sum + log.food.calories * log.servings, 0);
    const totalCarbs = mealLogs.reduce((sum, log) => sum + log.food.carbs * log.servings, 0);
    const totalProtein = mealLogs.reduce((sum, log) => sum + log.food.protein * log.servings, 0);
    const totalFat = mealLogs.reduce((sum, log) => sum + log.food.fat * log.servings, 0);

    return {
      ...meal,
      logs: mealLogs,
      totals: {
        calories: Math.round(totalCalories),
        carbs: Math.round(totalCarbs),
        protein: Math.round(totalProtein),
        fat: Math.round(totalFat),
      },
    };
  });

  return (
    <div className="space-y-4">
      {logsByMeal.map(({ type, icon, color, bg, logs: mealLogs, totals }) => (
        <div
          key={type}
          className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden transition-all duration-300"
        >
          {/* Meal Section Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-xl ${bg} ${color}`}>
                {icon}
              </span>
              <div>
                <h3 className="font-bold text-sm text-white">{type}</h3>
                <p className="text-[10px] text-gray-400">
                  C: {totals.carbs}g • P: {totals.protein}g • F: {totals.fat}g
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-white">
                {totals.calories}
              </span>
              <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">
                kcal
              </span>
            </div>
          </div>

          {/* Meal Items List */}
          <div className="divide-y divide-white/5">
            {mealLogs.length > 0 ? (
              mealLogs.map((log) => {
                const emoji = getFoodEmoji(log.food.name, log.food.category);
                const itemCalories = Math.round(log.food.calories * log.servings);
                const itemCarbs = Math.round(log.food.carbs * log.servings);
                const itemProtein = Math.round(log.food.protein * log.servings);
                const itemFat = Math.round(log.food.fat * log.servings);

                return (
                  <div
                    key={log.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                  >
                    {/* Food Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0" role="img" aria-label={log.food.name}>
                        {emoji}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">
                          {log.food.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 truncate">
                          {log.servings} x {log.food.servingSize} • {itemCalories} kcal
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          C: {itemCarbs}g • P: {itemProtein}g • F: {itemFat}g
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Servings Adjuster */}
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateServings(log.id, Math.max(0.1, log.servings - 0.1))}
                          className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                          title="Decrease servings by 0.1"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-[36px] text-center">
                          {log.servings.toFixed(1)}x
                        </span>
                        <button
                          onClick={() => onUpdateServings(log.id, log.servings + 0.1)}
                          className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                          title="Increase servings by 0.1"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-lg text-rose-400 hover:text-rose-300 transition-all"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-400 text-xs">
                No items logged for {type.toLowerCase()} yet.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};