import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Flame,
  TrendingUp,
  Sparkles,
  Info,
  X,
  Check,
  Activity,
  Apple,
  Coffee,
  PlusCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

export default function App() {
  // State
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [logs, setLogs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Custom Food Form State
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
    serving_size: '1 serving'
  });

  const searchRef = useRef(null);

  // Daily Goals
  const dailyCalorieGoal = 2000;
  const dailyCarbsGoal = 250; // grams
  const dailyProteinGoal = 75; // grams
  const dailyFatGoal = 65; // grams

  // Fetch logs and foods on mount and when date changes
  useEffect(() => {
    fetchLogs(selectedDate);
    fetchFoods();
  }, [selectedDate]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLogs = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/logs?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not load logs. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await fetch(`${API_BASE}/foods`);
      if (!res.ok) throw new Error('Failed to fetch foods');
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  // Select food from search results
  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Log selected food
  const handleLogFood = async (foodId, qty, date) => {
    if (!foodId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_id: foodId,
          quantity: parseFloat(qty) || 1,
          date: date
        })
      });
      if (!res.ok) throw new Error('Failed to log food');
      // Refresh logs to ensure we have the populated food object
      fetchLogs(date);
      setSelectedFood(null);
      setQuantity(1);
      showToast('Food logged successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to log food item.');
    } finally {
      setLoading(false);
    }
  };

  // Quick add food item
  const handleQuickAdd = async (food) => {
    await handleLogFood(food.id, 1, selectedDate);
  };

  // Delete log item
  const handleDeleteLog = async (logId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/logs/${logId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete log');
      fetchLogs(selectedDate);
      showToast('Log entry deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete log entry.');
    } finally {
      setLoading(false);
    }
  };

  // Create custom food
  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    const { name, calories, carbs, protein, fat, serving_size } = customFood;
    if (!name || !calories) {
      setError('Name and Calories are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          calories: parseFloat(calories),
          carbs: parseFloat(carbs) || 0,
          protein: parseFloat(protein) || 0,
          fat: parseFloat(fat) || 0,
          serving_size: serving_size || '1 serving'
        })
      });
      if (!res.ok) throw new Error('Failed to create food');
      
      await fetchFoods();
      setShowCustomModal(false);
      setCustomFood({
        name: '',
        calories: '',
        carbs: '',
        protein: '',
        fat: '',
        serving_size: '1 serving'
      });
      showToast('Custom food created successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to create custom food.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to show temporary success message
  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Date navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Calculate totals
  const totals = logs.reduce((acc, log) => {
    const food = log.food || {};
    const qty = log.quantity || 1;
    return {
      calories: acc.calories + (food.calories || 0) * qty,
      carbs: acc.carbs + (food.carbs || 0) * qty,
      protein: acc.protein + (food.protein || 0) * qty,
      fat: acc.fat + (food.fat || 0) * qty
    };
  }, { calories: 0, carbs: 0, protein: 0, fat: 0 });

  // Round totals
  totals.calories = Math.round(totals.calories);
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;

  const caloriePercentage = Math.min(Math.round((totals.calories / dailyCalorieGoal) * 100), 100);
  const carbsPercentage = Math.min(Math.round((totals.carbs / dailyCarbsGoal) * 100), 100);
  const proteinPercentage = Math.min(Math.round((totals.protein / dailyProteinGoal) * 100), 100);
  const fatPercentage = Math.min(Math.round((totals.fat / dailyFatGoal) * 100), 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md shadow-emerald-100">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">NutriTrack</h1>
              <p className="text-xs text-slate-500 font-medium">Your Daily Nutrition Companion</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-slate-900 hover:shadow-sm"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="relative flex items-center px-3">
              <Calendar className="h-4 w-4 text-slate-400 mr-2 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-white rounded-lg transition-all text-slate-600 hover:text-slate-900 hover:shadow-sm"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Calories Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full -z-0 opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500">Calories</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> {caloriePercentage}%
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{totals.calories}</span>
                <span className="text-slate-400 text-sm font-medium">/ {dailyCalorieGoal} kcal</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${caloriePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500">Carbohydrates</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {carbsPercentage}%
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-slate-900">{totals.carbs}g</span>
                <span className="text-slate-400 text-xs">/ {dailyCarbsGoal}g</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${carbsPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Protein Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500">Protein</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {proteinPercentage}%
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-slate-900">{totals.protein}g</span>
                <span className="text-slate-400 text-xs">/ {dailyProteinGoal}g</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${proteinPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fat Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500">Fat</span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {fatPercentage}%
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-slate-900">{totals.fat}g</span>
                <span className="text-slate-400 text-xs">/ {dailyFatGoal}g</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${fatPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Logged Foods */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-slate-900">Today's Food Log</h2>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {logs.length} {logs.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {loading && logs.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
                  <p className="text-sm">Loading your log...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center max-w-md mx-auto">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coffee className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No food logged yet</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Keep track of your calories and macros by searching and adding foods on the right.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const food = log.food || {};
                    const qty = log.quantity || 1;
                    return (
                      <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-baseline gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{food.name}</h4>
                            <span className="text-xs text-slate-400 font-medium">
                              ({qty} × {food.serving_size || '1 serving'})
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Carbs: {Math.round((food.carbs || 0) * qty)}g
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              Protein: {Math.round((food.protein || 0) * qty)}g
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Fat: {Math.round((food.fat || 0) * qty)}g
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-slate-900">
                              {Math.round((food.calories || 0) * qty)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">kcal</span>
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Log Summary Footer */}
                  <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between text-sm font-bold text-slate-700">
                    <span>Total Consumed</span>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Calories</span>
                        <span className="text-slate-900 font-extrabold">{totals.calories} kcal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Carbs</span>
                        <span className="text-slate-900">{totals.carbs}g</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Protein</span>
                        <span className="text-slate-900">{totals.protein}g</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Fat</span>
                        <span className="text-slate-900">{totals.fat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Add Food & Search */}
          <div className="space-y-6">
            {/* Search & Add Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-500" /> Log Food Item
              </h3>

              {/* Search Input */}
              <div className="relative mb-4" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search foods (e.g. Apple, Chicken...)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
                />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => handleSelectFood(food)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{food.name}</p>
                          <p className="text-xs text-slate-400">{food.serving_size} • {food.calories} kcal</p>
                        </div>
                        <Plus className="h-4 w-4 text-emerald-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Food Form */}
              {selectedFood ? (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-4 animate-fadeIn">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedFood.name}</h4>
                      <p className="text-xs text-slate-500">{selectedFood.serving_size} • {selectedFood.calories} kcal</p>
                    </div>
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Number of Servings
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <button
                      onClick={() => handleLogFood(selectedFood.id, quantity, selectedDate)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md shadow-emerald-100 transition-all self-end h-[38px] flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Log
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl mb-4 bg-slate-50/30">
                  <p className="text-xs text-slate-400 font-medium">Select a food from search to log</p>
                </div>
              )}

              {/* Create Custom Food Button */}
              <button
                onClick={() => setShowCustomModal(true)}
                className="w-full py-2.5 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 bg-white"
              >
                <Plus className="h-4 w-4" /> Create Custom Food
              </button>
            </div>

            {/* Quick Add Popular Foods */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> Quick Add Foods
              </h3>
              {foods.length === 0 ? (
                <p className="text-xs text-slate-400">No foods available. Create some custom foods!</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {foods.slice(0, 6).map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors border border-slate-100"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{food.name}</p>
                        <p className="text-[10px] text-slate-400">{food.serving_size} • {food.calories} kcal</p>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(food)}
                        className="p-1.5 bg-white hover:bg-emerald-500 hover:text-white text-slate-600 rounded-lg border border-slate-200 hover:border-emerald-500 transition-all shadow-sm"
                        title="Quick add 1 serving"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Custom Food Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Create Custom Food</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Chicken Breast"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 165"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100g, 1 cup"
                    value={customFood.serving_size}
                    onChange={(e) => setCustomFood({ ...customFood, serving_size: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-100 transition-all"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-fadeIn">
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}
    </div>
  );
}