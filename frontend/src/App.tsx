import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  Database, 
  Settings, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Loader2,
  Flame
} from 'lucide-react';
import { Food, MealLog, DailyGoal } from './types';
import { api } from './api';
import { Dashboard } from './components/Dashboard';
import { MealLogger } from './components/MealLogger';
import { FoodDatabase } from './components/FoodDatabase';
import { GoalSettings } from './components/GoalSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch initial data and data on date change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch foods, logs for selected date, and goal for selected date
        const [fetchedFoods, fetchedLogs, fetchedGoal] = await Promise.all([
          api.getFoods(),
          api.getLogs(date),
          api.getGoal(date)
        ]);

        setFoods(fetchedFoods);
        setLogs(fetchedLogs);
        setGoal(fetchedGoal);
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to connect to the server. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [date]);

  // Show temporary notification
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handlers for updating state and calling API
  const handleAddCustomFood = async (newFood: Omit<Food, 'id'>) => {
    try {
      const created = await api.createFood(newFood);
      setFoods(prev => [created, ...prev]);
      showNotification(`Successfully added "${newFood.name}" to the database!`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to add custom food', 'error');
    }
  };

  const handleDeleteFood = async (id: number) => {
    try {
      await api.deleteFood(id);
      setFoods(prev => prev.filter(f => f.id !== id));
      showNotification('Food item deleted successfully');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete food item', 'error');
    }
  };

  const handleAddLog = async (logData: { mealType: string; foodId: number; servings: number }) => {
    try {
      const created = await api.createLog({
        date,
        mealType: logData.mealType,
        foodId: logData.foodId,
        servings: logData.servings
      });
      setLogs(prev => [...prev, created]);
      showNotification('Meal logged successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Failed to log meal', 'error');
    }
  };

  const handleUpdateLog = async (id: number, servings: number) => {
    try {
      const updated = await api.updateLog(id, servings);
      setLogs(prev => prev.map(l => l.id === id ? updated : l));
      showNotification('Log updated successfully');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update log', 'error');
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      await api.deleteLog(id);
      setLogs(prev => prev.filter(l => l.id !== id));
      showNotification('Log entry removed');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete log entry', 'error');
    }
  };

  const handleUpdateGoal = async (updatedGoal: Omit<DailyGoal, 'id'>) => {
    try {
      const saved = await api.updateGoal(updatedGoal);
      setGoal(saved);
      showNotification('Daily goals updated successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update goals', 'error');
    }
  };

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const formatDateString = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md shadow-emerald-100">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                CaloryTracking
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400 block -mt-1 font-medium">
                Indian Food Companion
              </span>
            </div>
          </div>

          {/* Date Selector (Global) */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="relative flex items-center px-2">
              <Calendar className="h-4 w-4 text-slate-400 mr-1.5 hidden sm:inline" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer w-28 sm:w-auto"
              />
            </div>

            <button 
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button 
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-white rounded-lg shadow-sm border border-slate-200/50 transition-all"
            >
              Today
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('logger')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'logger' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Utensils className="h-4 w-4" />
              <span>Meal Logger</span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'database' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Food Database</span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'goals' 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Goals</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-md animate-bounce-subtle">
          <div className={`p-4 rounded-xl shadow-lg border flex items-center space-x-3 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className={`p-1 rounded-lg ${notification.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <Flame className={`h-5 w-5 ${notification.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <p className="text-slate-500 font-medium">Loading your nutrition dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 max-w-2xl mx-auto text-center my-12">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-rose-900 mb-2">Connection Error</h3>
            <p className="text-rose-700 mb-6">{error}</p>
            <button 
              onClick={() => setDate(prev => `${prev}`)} // trigger reload
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* Active Tab View */}
            {activeTab === 'dashboard' && goal && (
              <Dashboard 
                date={date}
                setDate={setDate}
                logs={logs}
                goal={goal}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'logger' && goal && (
              <MealLogger 
                date={date}
                logs={logs}
                foods={foods}
                onAddLog={handleAddLog}
                onUpdateLog={handleUpdateLog}
                onDeleteLog={handleDeleteLog}
              />
            )}

            {activeTab === 'database' && (
              <FoodDatabase 
                foods={foods}
                onAddCustomFood={handleAddCustomFood}
                onDeleteFood={handleDeleteFood}
                onLogFoodDirectly={(foodId, mealType) => {
                  handleAddLog({ mealType, foodId, servings: 1 });
                  setActiveTab('logger');
                }}
              />
            )}

            {activeTab === 'goals' && goal && (
              <GoalSettings 
                currentGoal={goal}
                onUpdateGoal={handleUpdateGoal}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-4 py-2 flex justify-around items-center z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('logger')}
          className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all ${
            activeTab === 'logger' ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Utensils className="h-5 w-5" />
          <span className="text-[10px]">Meal Logger</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all ${
            activeTab === 'database' ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Database className="h-5 w-5" />
          <span className="text-[10px]">Food DB</span>
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all ${
            activeTab === 'goals' ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px]">Goals</span>
        </button>
      </nav>
    </div>
  );
}