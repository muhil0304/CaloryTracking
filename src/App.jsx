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
  Heart,
  Mail,
  Globe,
  Shield,
  FileText
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

  // Edit Goals Modal State
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalInput, setGoalInput] = useState({
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 65
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
      
      // Sync goal input state with fetched goals
      if (statsData.goals) {
        setGoalInput(statsData.goals);
      }
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
        calories: Math.round(selectedFood.calories * multiplier),
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
  const handleDeleteLog = async (id) => {
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete log');

      showToast('Log entry removed');
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Create Custom Food
  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    const { name, serving_size, calories, protein, carbs, fat } = customFood;

    if (!name || !calories) {
      showToast('Name and Calories are required', 'error');
      return;
    }

    try {
      const newFood = {
        name,
        serving_size,
        calories: parseInt(calories),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0
      };

      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFood)
      });

      if (!res.ok) throw new Error('Failed to create custom food');

      showToast(`Successfully added ${name} to food database!`);
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

  // Handle Update Goals
  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calories: parseInt(goalInput.calories),
          protein: parseFloat(goalInput.protein),
          carbs: parseFloat(goalInput.carbs),
          fat: parseFloat(goalInput.fat)
        })
      });

      if (!res.ok) throw new Error('Failed to update goals');

      showToast('Daily goals updated successfully!');
      setShowGoalsModal(false);
      fetchLogsAndStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Date navigation helpers
  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(getLocalDateString(current));
  };

  // Filter foods based on search query
  const filteredFoods = searchQuery.trim() === '' 
    ? [] 
    : foods.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Popular Indian foods for quick add
  const popularFoods = foods.slice(0, 6);

  // Progress calculations
  const calPercent = Math.min(Math.round((stats.total_calories / stats.goals.calories) * 100), 100);
  const proteinPercent = Math.min(Math.round((stats.total_protein / stats.goals.protein) * 100), 100);
  const carbsPercent = Math.min(Math.round((stats.total_carbs / stats.goals.carbs) * 100), 100);
  const fatPercent = Math.min(Math.round((stats.total_fat / stats.goals.fat) * 100), 100);

  const remainingCalories = stats.goals.calories - stats.total_calories;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md shadow-emerald-100">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                CraveFit <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Indian Diet</span>
              </h1>
              <p className="text-xs text-slate-500">Track calories & macros easily</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button 
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all"
              title="Previous Day"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="px-3 flex items-center space-x-2 text-sm font-semibold text-slate-700">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>
                {selectedDate === getLocalDateString() ? 'Today' : selectedDate}
              </span>
            </div>
            <button 
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all"
              title="Next Day"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Stats Dashboard */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" /> Daily Progress
            </h2>
            <button 
              onClick={() => setShowGoalsModal(true)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Edit Goals
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Calories Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 -z-0 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Calories</span>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-slate-800">{stats.total_calories}</span>
                  <span className="text-sm text-slate-400">/ {stats.goals.calories} kcal</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${calPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">{calPercent}% consumed</span>
                    <span className={`text-xs font-semibold ${remainingCalories >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {remainingCalories >= 0 ? `${remainingCalories} kcal left` : `${Math.abs(remainingCalories)} kcal over`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Protein Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Protein</span>
                  <Dumbbell className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-slate-800">{stats.total_protein}g</span>
                  <span className="text-xs text-slate-400">/ {stats.goals.protein}g</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${proteinPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 block mt-2">{proteinPercent}% of daily goal</span>
                </div>
              </div>
            </div>

            {/* Carbs Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Carbs</span>
                  <Apple className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-slate-800">{stats.total_carbs}g</span>
                  <span className="text-xs text-slate-400">/ {stats.goals.carbs}g</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${carbsPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 block mt-2">{carbsPercent}% of daily goal</span>
                </div>
              </div>
            </div>

            {/* Fat Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">Fat</span>
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-slate-800">{stats.total_fat}g</span>
                  <span className="text-xs text-slate-400">/ {stats.goals.fat}g</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${fatPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 block mt-2">{fatPercent}% of daily goal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Search, Quick Add, Custom Food */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Log Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-emerald-500" /> Log Indian Food
              </h3>

              <div className="relative" ref={suggestionRef}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Indian foods (e.g., Paneer, Roti, Biryani...)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedFood(null);
                      }}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredFoods.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20 divide-y divide-slate-100">
                    {filteredFoods.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => {
                          setSelectedFood(food);
                          setShowSuggestions(false);
                          setSearchQuery(food.name);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{food.name}</p>
                          <p className="text-xs text-slate-400">Serving: {food.serving_size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{food.calories} kcal</p>
                          <p className="text-xs text-slate-400">P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && searchQuery.trim() !== '' && filteredFoods.length === 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center z-20">
                    <p className="text-sm text-slate-500 mb-2">No foods found matching "{searchQuery}"</p>
                    <button
                      onClick={() => {
                        setCustomFood({ ...customFood, name: searchQuery });
                        setShowCustomModal(true);
                        setShowSuggestions(false);
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      + Add "{searchQuery}" as a custom food
                    </button>
                  </div>
                )}
              </div>

              {/* Selected Food Log Form */}
              {selectedFood && (
                <form onSubmit={handleLogFood} className="mt-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl animate-fadeIn">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{selectedFood.name}</h4>
                      <p className="text-xs text-slate-500">Base serving: {selectedFood.serving_size} ({selectedFood.calories} kcal)</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedFood(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Number of Servings</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-center">
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">Total Calories</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {Math.round(selectedFood.calories * (parseFloat(quantity) || 0))} kcal
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-md shadow-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check className="h-4 w-4" /> Log Food
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Add Popular Foods */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> Quick Add Popular Foods
                </h3>
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  + Create Custom Food
                </button>
              </div>

              {foods.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  Loading food database...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularFoods.map((food) => (
                    <div 
                      key={food.id}
                      className="p-3.5 border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/10 transition-all flex justify-between items-center group"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{food.name}</h4>
                        <p className="text-xs text-slate-400">{food.serving_size} • {food.calories} kcal</p>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(food)}
                        className="bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 p-2 rounded-lg transition-all"
                        title="Quick Add 1 Serving"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Daily Food Log */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" /> Logged for {selectedDate === getLocalDateString() ? 'Today' : selectedDate}
            </h3>

            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                <Utensils className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No food logged yet</p>
                <p className="text-xs text-slate-400 mt-1">Search above or use Quick Add to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h4 className="text-sm font-bold text-slate-700 truncate">{log.food_name}</h4>
                      <p className="text-xs text-slate-400">
                        {log.quantity} serving{log.quantity !== 1 ? 's' : ''} • {log.calories} kcal
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">P: {log.protein}g</span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">C: {log.carbs}g</span>
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-medium">F: {log.fat}g</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                      title="Delete Log"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Custom Food Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" /> Create Custom Food
              </h3>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Food Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Homemade Masala Oats"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Serving Size</label>
                  <input
                    type="text"
                    placeholder="e.g., 1 bowl"
                    value={customFood.serving_size}
                    onChange={(e) => setCustomFood({ ...customFood, serving_size: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Calories (kcal) *</label>
                  <input
                    type="number"
                    placeholder="e.g., 250"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                    required
                />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl py-2.5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-2.5 text-sm shadow-md shadow-emerald-100 transition-colors"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> Edit Daily Goals
              </h3>
              <button 
                onClick={() => setShowGoalsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGoals} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Daily Calories Goal (kcal)</label>
                <input
                  type="number"
                  value={goalInput.calories}
                  onChange={(e) => setGoalInput({ ...goalInput, calories: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Protein (g)</label>
                  <input
                    type="number"
                    value={goalInput.protein}
                    onChange={(e) => setGoalInput({ ...goalInput, protein: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Carbs (g)</label>
                  <input
                    type="number"
                    value={goalInput.carbs}
                    onChange={(e) => setGoalInput({ ...goalInput, carbs: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fat (g)</label>
                  <input
                    type="number"
                    value={goalInput.fat}
                    onChange={(e) => setGoalInput({ ...goalInput, fat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalsModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl py-2.5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-2.5 text-sm shadow-md shadow-emerald-100 transition-colors"
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
        <div className="fixed bottom-5 right-5 z-50 animate-slideIn">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
            toast.type === 'error' 
              ? 'bg-rose-50 border-rose-100 text-rose-800' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            ) : (
              <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}