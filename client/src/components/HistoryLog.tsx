import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Flame, Utensils } from 'lucide-react';
import { getLogs, getGoal } from '../api';

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

export const HistoryLog: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoading(true);
      try {
        const [fetchedLogs, fetchedGoal] = await Promise.all([
          getLogs(selectedDate),
          getGoal(selectedDate),
        ]);
        setLogs(fetchedLogs);
        if (fetchedGoal) {
          setTargetCalories(fetchedGoal.target_calories);
        } else {
          setTargetCalories(2000); // default fallback
        }
      } catch (error) {
        console.error('Error fetching history data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const totalCalories = Math.round(logs.reduce((sum, log) => sum + log.calories, 0));
  const totalProtein = Math.round(logs.reduce((sum, log) => sum + log.protein, 0));
  const totalCarbs = Math.round(logs.reduce((sum, log) => sum + log.carbs, 0));
  const totalFat = Math.round(logs.reduce((sum, log) => sum + log.fat, 0));

  const caloriePercentage = Math.min(100, Math.round((totalCalories / targetCalories) * 100)) || 0;

  return (
    <div className="space-y-6">
      {/* Date Selector Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-bold text-slate-800 focus:outline-none text-sm sm:text-base cursor-pointer"
          />
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500">Loading historical logs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Summary Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Day Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Calories Consumed</span>
                  <span className="font-bold text-slate-800">{totalCalories} / {targetCalories} kcal</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${caloriePercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                  <span className="text-slate-500 block mb-0.5">Carbs</span>
                  <span className="font-bold text-amber-700">{totalCarbs}g</span>
                </div>
                <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                  <span className="text-slate-500 block mb-0.5">Protein</span>
                  <span className="font-bold text-rose-700">{totalProtein}g</span>
                </div>
                <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50">
                  <span className="text-slate-500 block mb-0.5">Fat</span>
                  <span className="font-bold text-indigo-700">{totalFat}g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Logged Items List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">Logged Items</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No meals logged on this date.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h4 className="font-semibold text-slate-800 text-sm">{log.name}</h4>
                        <span className="text-xs text-slate-400">
                          ({log.quantity} {log.serving_unit})
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs text-slate-500 mt-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                          {log.meal_type}
                        </span>
                        <span>•</span>
                        <span>P: {Math.round(log.protein)}g</span>
                        <span>•</span>
                        <span>C: {Math.round(log.carbs)}g</span>
                        <span>•</span>
                        <span>F: {Math.round(log.fat)}g</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700 text-sm">
                      {Math.round(log.calories)} kcal
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};