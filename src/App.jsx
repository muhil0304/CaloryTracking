import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Flame, 
  Dumbbell, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle, 
  Info,
  Apple,
  TrendingUp,
  LogOut,
  User
} from 'lucide-react';
import { createPortal } from 'react-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Footer from './components/Footer';

export default function App() {
  // Date helper to get local YYYY-MM-DD string
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Auth State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  // State
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [foods, setFoods] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    goals: { calories: 2000, protein: 120, carbs: 250, fat: 65 }
  });

  // Search & Log State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Custom Food Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    serving_size: '1 serving',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // Goal Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalsInput, setGoalsInput] = useState({
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65
  });

  // Notification Toast State
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const suggestionRef = useRef(null);

  // Fetch all foods on mount
  useEffect(() => {
    fetchFoods();
  }, []);

  // Fetch logs and stats on date or user change
  useEffect(() => {
    if (user) {
      fetchLogsAndStats();
    }
  }, [selectedDate, user]);

  // Sync goals input when stats goals change
  useEffect(() => {
    if (stats.goals) {
      setGoalsInput(stats.goals);
    }
  }, [stats.goals]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/foods');
      if (!res.ok) throw new Error('Failed to fetch foods');
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fetchLogsAndStats = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/logs?date=${selectedDate}&userId=${user.id}`),
        fetch(`/api/stats?date=${selectedDate}&userId=${user.id}`)
      ]);

      if (!logsRes.ok || !statsRes.ok) throw new Error('Failed to fetch daily data');

      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Quick Add
  const handleQuickAdd = async (food) => {
    if (!user) return;
    try {
      const logEntry = {
        food_id: food.id,
        food_name: food.name,
        quantity: 1,
        date: selectedDate,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        user_id: user.id
      };

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });

      if (!res.ok) throw new Error('Failed to log food');
      
      showToast(`Added 1 serving of ${food.name}!`);
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Custom Log Submission
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedFood) return;
    try {
      const logEntry = {
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        quantity: parseFloat(quantity),
        date: selectedDate,
        calories: Math.round(selectedFood.calories * quantity),
        protein: Math.round(selectedFood.protein * quantity * 10) / 10,
        carbs: Math.round(selectedFood.carbs * quantity * 10) / 10,
        fat: Math.round(selectedFood.fat * quantity * 10) / 10,
        user_id: user.id
      };

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });

      if (!res.ok) throw new Error('Failed to log food');

      showToast(`Logged ${quantity} serving(s) of ${selectedFood.name}!`);
      setSelectedFood(null);
      setSearchQuery('');
      setQuantity(1);
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Custom Food Creation
  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const foodData = {
        name: customFood.name,
        serving_size: customFood.serving_size,
        calories: parseFloat(customFood.calories),
        protein: parseFloat(customFood.protein || 0),
        carbs: parseFloat(customFood.carbs || 0),
        fat: parseFloat(customFood.fat || 0),
        is_custom: 1,
        user_id: user.id
      };

      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });

      if (!res.ok) throw new Error('Failed to create custom food');

      const newFood = await res.json();
      showToast(`Created custom food: ${newFood.name}`);
      setShowCustomModal(false);
      setCustomFood({
        name: '',
        serving_size: '1 serving',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      });
      fetchFoods();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Delete Log
  const handleDeleteLog = async (logId) => {
    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete log');

      showToast('Log deleted successfully');
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Update Goals
  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch(`/api/goals?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalsInput)
      });

      if (!res.ok) throw new Error('Failed to update goals');

      showToast('Goals updated successfully');
      setShowGoalModal(false);
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    showToast('Logged out successfully');
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(getLocalDateString(d));
  };

  const handleToday = () => {
    setSelectedDate(getLocalDateString());
  };

  if (!user) {
    if (authView === 'login') {
      return (
        <Login 
          onLoginSuccess={(userData) => {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }} 
          onToggleView={() => setAuthView('signup')} 
        />
      );
    } else {
      return (
        <Signup 
          onSignupSuccess={() => setAuthView('login')} 
          onToggleView={() => setAuthView('login')} 
        />
      );
    }
  }

  // Filter foods based on search query
  const filteredFoods = searchQuery.trim() === '' 
    ? [] 
    : foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Progress calculations
  const goalCalories = stats.goals?.calories || 2000;
  const goalProtein = stats.goals?.protein || 120;
  const goalCarbs = stats.goals?.carbs || 250;
  const goalFat = stats.goals?.fat || 65;

  const calPercent = Math.min(Math.round((stats.total_calories / goalCalories) * 100), 100);
  const proteinPercent = Math.min(Math.round((stats.total_protein / goalProtein) * 100), 100);
  const carbsPercent = Math.min(Math.round((stats.total_carbs / goalCarbs) * 100), 100);
  const fatPercent = Math.min(Math.round((stats.total_fat / goalFat) * 100), 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {createPortal(<Footer />, document.body)}
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-100">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-none">CaloTrack</h1>
              <span className="text-xs text-slate-500">Indian Food Calorie Tracker</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{user.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Date Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevDay}
              className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-3 py-2 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 cursor-pointer"
              />
            </div>
            <button 
              onClick={handleNextDay}
              className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleToday}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors"
            >
              Today
            </button>
            <button 
              onClick={() => setShowGoalModal(true)}
              className="px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              Set Goals
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Logs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Calories Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sm:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>Calories</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-900">{stats.total_calories}</span>
                    <span className="text-slate-400 text-sm">/ {goalCalories} kcal</span>
                  </div>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span>{calPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${calPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Protein Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Protein</span>
                  <Dumbbell className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{stats.total_protein}g</span>
                    <span className="text-slate-400 text-xs">/ {goalProtein}g</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proteinPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Carbs Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Carbs</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{stats.total_carbs}g</span>
                    <span className="text-slate-400 text-xs">/ {goalCarbs}g</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${carbsPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fat Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Fat</span>
                  <Utensils className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{stats.total_fat}g</span>
                    <span className="text-slate-400 text-xs">/ {goalFat}g</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fatPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Log List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-900">Daily Food Log</h2>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  {logs.length} items
                </span>
              </div>

              {isLoading ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm space-y-2">
                  <p>No food logged for this day yet.</p>
                  <p className="text-xs text-slate-400">Use the search panel to find and log Indian foods!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{log.food_name}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>Qty: {log.quantity} serving(s)</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:inline" />
                          <span className="text-indigo-600 font-medium">P: {log.protein}g</span>
                          <span className="text-amber-600 font-medium">C: {log.carbs}g</span>
                          <span className="text-rose-600 font-medium">F: {log.fat}g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{log.calories} kcal</span>
                        <button 
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Search & Quick Add */}
          <div className="space-y-8">
            
            {/* Search & Log Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                <span>Log Food</span>
              </h2>

              <div className="relative" ref={suggestionRef}>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search Indian foods (e.g., Roti, Paneer)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredFoods.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20 divide-y divide-slate-50">
                    {filteredFoods.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => {
                          setSelectedFood(food);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{food.name}</div>
                          <div className="text-xs text-slate-500">{food.serving_size} • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g</div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          {food.calories} kcal
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Food Form */}
              {selectedFood && (
                <form onSubmit={handleLogSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{selectedFood.name}</h3>
                      <p className="text-xs text-slate-500">Base: {selectedFood.serving_size} ({selectedFood.calories} kcal)</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedFood(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Servings</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <button 
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md shadow-emerald-100"
                      >
                        Add Log
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <button 
                onClick={() => setShowCustomModal(true)}
                className="w-full py-2.5 border border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-600 hover:text-emerald-600 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Food</span>
              </button>
            </div>

            {/* Popular / Quick Add Foods */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Popular Foods</span>
              </h2>

              <div className="space-y-3">
                {foods.slice(0, 5).map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{food.name}</h3>
                      <p className="text-xs text-slate-500">{food.serving_size} • {food.calories} kcal</p>
                    </div>
                    <button 
                      onClick={() => handleQuickAdd(food)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                      title="Quick Add 1 Serving"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Custom Food Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Create Custom Food</h3>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Food Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Homemade Chicken Curry"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Serving Size *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., 1 bowl, 100g"
                    value={customFood.serving_size}
                    onChange={(e) => setCustomFood({...customFood, serving_size: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Calories (kcal) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="e.g., 250"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({...customFood, calories: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({...customFood, protein: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({...customFood, carbs: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fat (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({...customFood, fat: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-100"
                >
                  Create Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Set Daily Goals</h3>
              <button 
                onClick={() => setShowGoalModal(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGoals} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Daily Calories Goal (kcal) *</label>
                <input 
                  type="number" 
                  required
                  min="500"
                  value={goalsInput.calories}
                  onChange={(e) => setGoalsInput({...goalsInput, calories: parseInt(e.target.value)})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Protein (g) *</label>
                  <input 
                    type="number" 
                    required
                    min="10"
                    value={goalsInput.protein}
                    onChange={(e) => setGoalsInput({...goalsInput, protein: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Carbs (g) *</label>
                  <input 
                    type="number" 
                    required
                    min="10"
                    value={goalsInput.carbs}
                    onChange={(e) => setGoalsInput({...goalsInput, carbs: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fat (g) *</label>
                  <input 
                    type="number" 
                    required
                    min="5"
                    value={goalsInput.fat}
                    onChange={(e) => setGoalsInput({...goalsInput, fat: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-100"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 flex items-center gap-3 z-50 animate-bounce">
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <Check className="w-5 h-5 text-emerald-600" />}
          <span className="font-medium text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}