import React, { useState, useMemo, useEffect } from 'react';
import { PRE_POPULATED_FOODS } from './data/indianFoods';
import { Food, LogEntry, DailyGoal, MealType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Dashboard } from './components/Dashboard';
import { FoodSearch } from './components/FoodSearch';
import { DailyLog } from './components/DailyLog';
import { CustomFoodModal } from './components/CustomFoodModal';
import { Sparkles, RefreshCw, Flame, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_GOAL: DailyGoal = {
  calories: 2000,
  protein: 60,
  carbs: 250,
  fat: 65,
};

export default function App() {
  const [customFoods, setCustomFoods] = useLocalStorage<Food[]>('swasthya_custom_foods', []);
  const [logEntries, setLogEntries] = useLocalStorage<LogEntry[]>('swasthya_daily_logs', []);
  const [dailyGoal, setDailyGoal] = useLocalStorage<DailyGoal>('swasthya_daily_goal', DEFAULT_GOAL);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const allFoods = useMemo(() => {
    return [...PRE_POPULATED_FOODS, ...customFoods];
  }, [customFoods]);

  const totals = useMemo(() => {
    return logEntries.reduce(
      (acc, entry) => {
        acc.calories += entry.food.calories * entry.servings;
        acc.carbs += entry.food.carbs * entry.servings;
        acc.protein += entry.food.protein * entry.servings;
        acc.fat += entry.food.fat * entry.servings;
        return acc;
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  }, [logEntries]);

  const roundedTotals = useMemo(() => {
    return {
      calories: Math.round(totals.calories),
      carbs: Math.round(totals.carbs),
      protein: Math.round(totals.protein),
      fat: Math.round(totals.fat),
    };
  }, [totals]);

  useEffect(() => {
    if (roundedTotals.calories >= dailyGoal.calories && dailyGoal.calories > 0 && !hasCelebrated) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#facc15', '#4ade80'],
      });
      setHasCelebrated(true);
    } else if (roundedTotals.calories < dailyGoal.calories) {
      setHasCelebrated(false);
    }
  }, [roundedTotals.calories, dailyGoal.calories, hasCelebrated]);

  const handleAddLog = (food: Food, mealType: MealType, servings: number) => {
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      food,
      mealType,
      servings,
      loggedAt: new Date().toISOString().split('T')[0],
    };
    setLogEntries((prev) => [newEntry, ...prev]);
  };

  const handleUpdateServings = (entryId: string, servings: number) => {
    setLogEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, servings } : entry))
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    setLogEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const handleAddCustomFood = (newFoodData: Omit<Food, 'id' | 'isCustom'>) => {
    const newFood: Food = {
      ...newFoodData,
      id: `custom-${crypto.randomUUID()}`,
      isCustom: true,
    };
    setCustomFoods((prev) => [newFood, ...prev]);
  };

  const handleResetDay = () => {
    if (window.confirm("Are you sure you want to clear today's logged meals?")) {
      setLogEntries([]);
      setHasCelebrated(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden pb-12">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl -z-10"></div>

      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Swasthya <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">Indian Diet</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Calorie & Macro Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDay}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
              title="Reset Today's Log"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Day
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-3xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Track Your Indian Meals Effortlessly</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                From high-protein Paneer Tikka to comforting Dal Chawal, Swasthya helps you balance your macros and hit your calorie goals with precision.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Made for Healthy Living
          </div>
        </div>

        <Dashboard
          dailyGoal={dailyGoal}
          setDailyGoal={setDailyGoal}
          totalCalories={roundedTotals.calories}
          totalCarbs={roundedTotals.carbs}
          totalProtein={roundedTotals.protein}
          totalFat={roundedTotals.fat}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <FoodSearch
              foods={allFoods}
              onAddLog={handleAddLog}
              onOpenCustomFoodModal={() => setIsCustomFoodModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-5">
            <DailyLog
              logEntries={logEntries}
              onUpdateServings={handleUpdateServings}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>
        </div>
      </main>

      <CustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onClose={() => setIsCustomFoodModalOpen(false)}
        onAddCustomFood={handleAddCustomFood}
      />
    </div>
  );
}