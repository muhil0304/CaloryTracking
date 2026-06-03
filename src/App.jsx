import React, { useState, useEffect, useRef } from 'react';
import Footer from './Footer';
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
  TrendingUp
} from 'lucide-react';

export default function App() {
  // Date helper to get local YYYY-MM-DD string
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  // Notification Toast State
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const suggestionRef = useRef(null);

  // Fetch all foods and logs on mount/date change
  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    fetchLogsAndStats();
  }, [selectedDate]);

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
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/logs?date=${selectedDate}`),
        fetch(`/api/stats?date=${selectedDate}`)
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
    try {
      const logEntry = {
        food_id: food.id,
        food_name: food.name,
        quantity: 1,
        date: selectedDate,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
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
  const handleLogFood = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;

    try {
      const multiplier = parseFloat(quantity);
      if (isNaN(multiplier) || multiplier <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      const logEntry = {
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        quantity: multiplier,
        date: selectedDate,
        calories: Math.round(selectedFood.calories * multiplier * 10) / 10,
        protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
        carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
        fat: Math.round(selectedFood.fat * multiplier * 10) / 10
      };

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });

      if (!res.ok) throw new Error('Failed to log food');

      showToast(`Logged ${multiplier} serving(s) of ${selectedFood.name}`);
      setSelectedFood(null);
      setSearchQuery('');
      setQuantity(1);
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Delete Log
  const handleDeleteLog = async (id, name) => {
    try {
      const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete log entry');
      
      showToast(`Removed ${name} from logs`);
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Custom Food Creation
  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    const { name, serving_size, calories, protein, carbs, fat } = customFood;

    if (!name || !serving_size || calories === '' || protein === '' || carbs === '' || fat === '') {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          serving_size,
          calories: parseFloat(calories),
          protein: parseFloat(protein),
          carbs: parseFloat(carbs),
          fat: parseFloat(fat)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create custom food');

      showToast(`Successfully created custom food: ${name}`);
      setCustomFood({
        name: '',
        serving_size: '1 serving',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      });
      setShowCustomModal(false);
      fetchFoods();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Date Navigation
  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(getLocalDateString(current));
  };

  const setToday = () => {
    setSelectedDate(getLocalDateString());
  };

  // Filter foods based on search query
  const filteredFoods = searchQuery
    ? foods.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Circular Progress Calculations
  const calorieGoal = stats.goals.calories;
  const caloriesConsumed = Math.round(stats.total_calories);
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
  const caloriePercentage = Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100));

  // SVG Circle parameters
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  // Macro Progress Calculations
  const getMacroProgress = (consumed, goal) => {
    const percentage = Math.min(100, Math.round((consumed / goal) * 100));
    return { percentage, consumed: Math.round(consumed * 10) / 10, goal };
  };

  const carbsProgress = getMacroProgress(stats.total_carbs, stats.goals.carbs);
  const proteinProgress = getMacroProgress(stats.total_protein, stats.goals.protein);
  const fatProgress = getMacroProgress(stats.total_fat, stats.goals.fat);

  // Popular quick-add foods list
  const popularFoods = foods.filter(f => 
    ['Roti', 'Rice', 'Dal Tadka', 'Masala Chai', 'Idli'].includes(f.name)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Footer />
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <Check className="w-5 h-5 text-emerald-600" />}
          <span className="font-medium text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AaharCal</h1>
              <p className="text-xs text-slate-500 font-medium">Indian Food Calorie Tracker</p>
            </div>
          </div>

          {/* Date Picker & Navigation */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              />
            </div>

            <button 
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button 
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-bold bg-white text-emerald-700 rounded-lg shadow-sm hover:bg-emerald-50 transition-all"
            >
              Today
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Dashboard & Stats */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Calorie Progress Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-600" />
                Daily Calorie Budget
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                {/* Circular Progress */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="text-slate-100"
                      strokeWidth={strokeWidth}
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="text-emerald-500 transition-all duration-500 ease-out"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-3xl font-extrabold text-slate-800">{caloriesConsumed}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">of {calorieGoal} kcal</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 flex-1 max-w-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500">Remaining Calories</p>
                    <p className={`text-xl font-bold ${caloriesRemaining > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {caloriesRemaining > 0 ? `${caloriesRemaining} kcal` : 'Goal Exceeded!'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500">Daily Progress</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${caloriePercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{caloriePercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Macro-nutrient Breakdown Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Macro-nutrient Breakdown
              </h2>

              <div className="space-y-5">
                {/* Carbs */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-sm font-bold text-slate-700">Carbohydrates</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {carbsProgress.consumed}g / {carbsProgress.goal}g ({carbsProgress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${carbsProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      <span className="text-sm font-bold text-slate-700">Protein</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {proteinProgress.consumed}g / {proteinProgress.goal}g ({proteinProgress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${proteinProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="text-sm font-bold text-slate-700">Fats</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {fatProgress.consumed}g / {fatProgress.goal}g ({fatProgress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${fatProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Goals are based on a standard 2000 kcal Indian diet recommendation.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Log Food & Custom Food */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Log Food Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  Log Food Consumption
                </h2>
                <button 
                  onClick={() => setShowCustomModal(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Custom Food
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative" ref={suggestionRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Indian foods (e.g., Roti, Biryani, Dosa...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && searchQuery && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredFoods.length > 0 ? (
                      filteredFoods.map((food) => (
                        <button
                          key={food.id}
                          onClick={() => {
                            setSelectedFood(food);
                            setSearchQuery(food.name);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-none flex items-center justify-between transition-all"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{food.name}</p>
                            <p className="text-xs text-slate-500">Serving: {food.serving_size}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                              {food.calories} kcal
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        No foods found. Create a custom food!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Food Details & Quantity Selector */}
              {selectedFood && (
                <form onSubmit={handleLogFood} className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{selectedFood.name}</h3>
                      <p className="text-xs text-slate-500">Base serving: {selectedFood.serving_size}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedFood(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Macro Grid for Selected Food */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-white p-3 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Calories</p>
                      <p className="text-sm font-extrabold text-slate-800">{selectedFood.calories} kcal</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Carbs</p>
                      <p className="text-sm font-extrabold text-amber-600">{selectedFood.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Protein</p>
                      <p className="text-sm font-extrabold text-indigo-600">{selectedFood.protein}g</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Fat</p>
                      <p className="text-sm font-extrabold text-rose-600">{selectedFood.fat}g</p>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Number of Servings</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                      />
                    </div>
                    <div className="flex-1 pt-5">
                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md shadow-emerald-100 transition-all"
                      >
                        Log Food Entry
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Popular Quick Add Section */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Popular Quick Add (1 Serving)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleQuickAdd(food)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-all"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      {food.name}
                      <span className="text-slate-400 font-normal">({food.calories} kcal)</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Daily Log History */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Daily Log History
              </h2>

              {isLoading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Loading logs...
                </div>
              ) : logs.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div key={log.id} className="py-3.5 flex items-center justify-between group">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 text-sm">{log.food_name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            Qty: {log.quantity}
                          </span>
                          <span>•</span>
                          <span>C: {log.carbs}g</span>
                          <span>•</span>
                          <span>P: {log.protein}g</span>
                          <span>•</span>
                          <span>F: {log.fat}g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-slate-700">
                          {log.calories} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteLog(log.id, log.food_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">No foods logged for this day</p>
                  <p className="text-xs text-slate-400 mt-1">Search and add foods above to start tracking!</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Custom Food Creator Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Create Custom Indian Food
            </h2>

            <form onSubmit={handleCreateCustomFood} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Homemade Paneer Bhurji"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Serving Size *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 1 bowl (150g) or 1 piece"
                  value={customFood.serving_size}
                  onChange={(e) => setCustomFood({ ...customFood, serving_size: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Calories (kcal) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Protein (g) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Carbohydrates (g) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Fats (g) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md shadow-emerald-100 transition-all"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}