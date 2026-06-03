import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { MealLogger } from './components/MealLogger';
import { FoodSearch } from './components/FoodSearch';
import { HistoryLog } from './components/HistoryLog';
import { getFoods, getLogs, addLog, deleteLog, getGoal, updateGoal, createFood } from './api';
import { Flame, Utensils, Search, History, Heart, Menu, X } from 'lucide-react';

interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: string;
  is_custom: number;
}

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

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meals' | 'search' | 'history'>('dashboard');
  const [foods, setFoods] = useState<Food[]>([]);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Breakfast');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [fetchedFoods, fetchedLogs, fetchedGoal] = await Promise.all([
          getFoods(),
          getLogs(todayStr),
          getGoal(todayStr),
        ]);
        setFoods(fetchedFoods);
        setLogs(fetchedLogs);
        if (fetchedGoal) {
          setTargetCalories(fetchedGoal.target_calories);
        }
      } catch (error) {
        console.error('Failed to load initial data', error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [todayStr]);

  const handleAddLog = async (logData: { food_id: number; meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'; quantity: number }) => {
    try {
      await addLog({
        ...logData,
        date: todayStr,
      });
      // Refresh logs
      const updatedLogs = await getLogs(todayStr);
      setLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to add log', error);
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      await deleteLog(id);
      // Refresh logs
      const updatedLogs = await getLogs(todayStr);
      setLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to delete log', error);
    }
  };

  const handleUpdateGoal = async (newGoal: number) => {
    try {
      await updateGoal(todayStr, newGoal);
      setTargetCalories(newGoal);
    } catch (error) {
      console.error('Failed to update goal', error);
    }
  };

  const handleCreateCustomFood = async (foodData: Omit<Food, 'id' | 'is_custom'>) => {
    try {
      const newFood = await createFood(foodData);
      // Refresh food list
      const updatedFoods = await getFoods();
      setFoods(updatedFoods);
      return newFood;
    } catch (error) {
      console.error('Failed to create custom food', error);
      throw error;
    }
  };

  const handleSwitchToSearch = (mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => {
    setSelectedMealType(mealType);
    setActiveTab('search');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Flame },
    { id: 'meals', label: 'Log Meals', icon: Utensils },
    { id: 'search', label: 'Search Foods', icon: Search },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md shadow-emerald-200">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-base sm:text-lg tracking-tight">SwasthyaCal</h1>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block -mt-1">Indian Calorie Tracker</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-1 shadow-inner">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium text-sm">Loading your nutrition profile...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && (
              <Dashboard
                logs={logs}
                targetCalories={targetCalories}
                onUpdateGoal={handleUpdateGoal}
              />
            )}
            {activeTab === 'meals' && (
              <MealLogger
                logs={logs}
                onDeleteLog={handleDeleteLog}
                onSwitchToSearch={handleSwitchToSearch}
              />
            )}
            {activeTab === 'search' && (
              <FoodSearch
                foods={foods}
                onAddLog={handleAddLog}
                onCreateCustomFood={handleCreateCustomFood}
                defaultMealType={selectedMealType}
              />
            )}
            {activeTab === 'history' && <HistoryLog />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} SwasthyaCal. Made with ❤️ for healthy Indian living.</p>
        </div>
      </footer>
    </div>
  );
}