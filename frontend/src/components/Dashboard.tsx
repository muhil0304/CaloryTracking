import React from 'react';
import { 
  Flame, 
  TrendingUp, 
  Utensils, 
  Plus, 
  Sparkles, 
  ChevronRight,
  Apple,
  Activity
} from 'lucide-react';
import { MealLog, DailyGoal } from '../types';

interface DashboardProps {
  date: string;
  setDate: (date: string) => void;
  logs: MealLog[];
  goal: DailyGoal;
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  date,
  logs,
  goal,
  onNavigateToTab,
}) => {
  // Calculate totals
  const totalCalories = Math.round(logs.reduce((sum, log) => sum + log.calories, 0));
  const totalProtein = Math.round(logs.reduce((sum, log) => sum + log.protein, 0));
  const totalCarbs = Math.round(logs.reduce((sum, log) => sum + log.carbs, 0));
  const totalFat = Math.round(logs.reduce((sum, log) => sum + log.fat, 0));

  const remainingCalories = goal.calories - totalCalories;
  const isOverCalorieGoal = remainingCalories < 0;

  // Calculate percentages
  const caloriePercentage = Math.min(Math.round((totalCalories / goal.calories) * 100), 100);
  const proteinPercentage = Math.min(Math.round((totalProtein / goal.protein) * 100), 100);
  const carbsPercentage = Math.min(Math.round((totalCarbs / goal.carbs) * 100), 100);
  const fatPercentage = Math.min(Math.round((totalFat / goal.fat) * 100), 100);

  // Group logs by meal type
  const mealCalories = {
    Breakfast: Math.round(logs.filter(l => l.mealType === 'Breakfast').reduce((sum, l) => sum + l.calories, 0)),
    Lunch: Math.round(logs.filter(l => l.mealType === 'Lunch').reduce((sum, l) => sum + l.calories, 0)),
    Dinner: Math.round(logs.filter(l => l.mealType === 'Dinner').reduce((sum, l) => sum + l.calories, 0)),
    Snacks: Math.round(logs.filter(l => l.mealType === 'Snacks').reduce((sum, l) => sum + l.calories, 0)),
  };

  // Macro energy distribution
  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const calculatedTotalKcal = proteinKcal + carbsKcal + fatKcal || 1; // avoid division by zero

  const proteinEnergyPct = Math.round((proteinKcal / calculatedTotalKcal) * 100);
  const carbsEnergyPct = Math.round((carbsKcal / calculatedTotalKcal) * 100);
  const fatEnergyPct = Math.round((fatKcal / calculatedTotalKcal) * 100);

  // SVG Progress Ring parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Progress Ring Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
            <Flame className="h-4 w-4 text-emerald-500 mr-1.5" />
            Calorie Budget
          </h3>

          <div className="relative flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Foreground Circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                className={`${isOverCalorieGoal ? 'stroke-rose-500' : 'stroke-emerald-500'} transition-all duration-500 ease-out`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Text */}
            <div className="absolute text-center">
              <span className={`text-3xl font-extrabold tracking-tight ${isOverCalorieGoal ? 'text-rose-600' : 'text-slate-800'}`}>
                {Math.abs(remainingCalories)}
              </span>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {isOverCalorieGoal ? 'kcal Over' : 'kcal Left'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full mt-6 border-t border-slate-100 pt-4 text-center">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Consumed</span>
              <span className="text-lg font-bold text-slate-700">{totalCalories} kcal</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Daily Goal</span>
              <span className="text-lg font-bold text-slate-700">{goal.calories} kcal</span>
            </div>
          </div>
        </div>

        {/* Macronutrient Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden lg:col-span-2">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider flex items-center">
              <TrendingUp className="h-4 w-4 text-indigo-500 mr-1.5" />
              Macronutrient Targets
            </h3>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Daily Goals
            </span>
          </div>

          <div className="space-y-5">
            {/* Protein Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                  <span className="font-bold text-slate-700">Protein</span>
                </div>
                <span className="text-slate-500 font-medium">
                  <strong className="text-slate-800">{totalProtein}g</strong> / {goal.protein}g ({proteinPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercentage}%` }}
                />
              </div>
            </div>

            {/* Carbs Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                  <span className="font-bold text-slate-700">Carbohydrates</span>
                </div>
                <span className="text-slate-500 font-medium">
                  <strong className="text-slate-800">{totalCarbs}g</strong> / {goal.carbs}g ({carbsPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${carbsPercentage}%` }}
                />
              </div>
            </div>

            {/* Fat Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-rose-500 mr-2" />
                  <span className="font-bold text-slate-700">Fat</span>
                </div>
                <span className="text-slate-500 font-medium">
                  <strong className="text-slate-800">{totalFat}g</strong> / {goal.fat}g ({fatPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fatPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Energy Distribution Stats */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50/50 rounded-xl p-2">
              <span className="block text-[10px] font-bold text-emerald-700 uppercase">Protein Energy</span>
              <span className="text-sm font-extrabold text-emerald-800">{proteinEnergyPct}%</span>
            </div>
            <div className="bg-amber-50/50 rounded-xl p-2">
              <span className="block text-[10px] font-bold text-amber-700 uppercase">Carbs Energy</span>
              <span className="text-sm font-extrabold text-amber-800">{carbsEnergyPct}%</span>
            </div>
            <div className="bg-rose-50/50 rounded-xl p-2">
              <span className="block text-[10px] font-bold text-rose-700 uppercase">Fat Energy</span>
              <span className="text-sm font-extrabold text-rose-800">{fatEnergyPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meal Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-slate-800 text-base font-bold mb-4 flex items-center">
              <Utensils className="h-5 w-5 text-emerald-500 mr-2" />
              Meal Breakdown
            </h3>
            
            <div className="space-y-4">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((meal) => {
                const kcal = mealCalories[meal];
                const pct = totalCalories > 0 ? Math.round((kcal / totalCalories) * 100) : 0;
                
                return (
                  <div key={meal} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <div>
                        <span className="font-bold text-slate-700 block text-sm">{meal}</span>
                        <span className="text-xs text-slate-400 font-medium">{pct}% of today's intake</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-800 text-sm block">{kcal} kcal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('logger')}
            className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>Go to Meal Logger</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Indian Diet Insights Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                <Sparkles className="h-5 w-5 text-emerald-300" />
              </div>
              <h3 className="text-base font-bold tracking-wide">Indian Diet Insights</h3>
            </div>

            <div className="space-y-4 text-emerald-100/90 text-sm">
              <p className="leading-relaxed">
                Indian meals are rich in complex carbohydrates and healthy fats, but can sometimes be lower in protein. 
              </p>
              
              <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center">
                  <Apple className="h-3.5 w-3.5 text-emerald-300 mr-1.5" />
                  Pro Tip for Today
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  {totalProtein < goal.protein * 0.5 ? (
                    "You are currently low on protein. Try adding Paneer, Dal, Greek Yogurt, or Chicken Tikka to your next meal to hit your target!"
                  ) : totalCarbs > goal.carbs * 0.8 ? (
                    "You've consumed a significant portion of your carbs. Consider swapping white rice or roti for high-protein subzis or salads for dinner."
                  ) : (
                    "Great job maintaining a balanced macro distribution today! Keep tracking to build consistent healthy habits."
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">Active Tracking Streak</span>
            </div>
            <span className="text-sm font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-200">
              🔥 3 Days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};