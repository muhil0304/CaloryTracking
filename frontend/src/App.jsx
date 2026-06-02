import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Settings as SettingsIcon, 
  Calendar, 
  TrendingUp, 
  Utensils, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Apple,
  X,
  PlusCircle,
  Activity
} from 'lucide-react';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [logs, setLogs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [goals, setGoals] = useState({ calories: 2000, protein: 120, carbs: 230, fat: 65 });
  const [weeklyStats, setWeeklyStats] = useState([]);
  
  // Modals & Forms State
  const [selectedFoodForLogging, setSelectedFoodForLogging] = useState(null);
  const [logQuantity, setLogQuantity] = useState(1);
  const [logMealType, setLogMealType] = useState('Breakfast');
  
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    serving_size: '1 serving'
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // Status & Feedback
  const [backendConnected, setBackendConnected] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchGoals();
    fetchFoods('');
    fetchWeeklyStats();
  }, []);

  // Fetch logs whenever date changes
  useEffect(() => {
    fetchLogs(selectedDate);
  }, [selectedDate]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      const data = await res.json();
      if (data) {
        setGoals(data);
        setSettingsForm({
          calories: data.calories.toString(),
          protein: data.protein.toString(),
          carbs: data.carbs.toString(),
          fat: data.fat.toString()
        });
      }
      setBackendConnected(true);
    } catch (err) {
      console.error(err);
      setBackendConnected(false);
      setError('Backend server offline. Using local fallback mode.');
    }
  };

  const fetchFoods = async (query) => {
    try {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch foods');
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async (date) => {
    try {
      const res = await fetch(`/api/logs?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const res = await fetch('/api/stats/weekly');
      if (!res.ok) throw new Error('Failed to fetch weekly stats');
      const data = await res.json();
      setWeeklyStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchFoods(query);
  };

  const handleLogFoodSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFoodForLogging) return;

    const logData = {
      food_name: selectedFoodForLogging.name,
      calories: selectedFoodForLogging.calories,
      protein: selectedFoodForLogging.protein,
      carbs: selectedFoodForLogging.carbs,
      fat: selectedFoodForLogging.fat,
      meal_type: logMealType,
      quantity: parseFloat(logQuantity),
      date: selectedDate
    };

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      if (!res.ok) throw new Error('Failed to log food');
      
      showSuccess(`Successfully logged ${logData.quantity}x ${logData.food_name} to ${logData.meal_type}!`);
      setSelectedFoodForLogging(null);
      setLogQuantity(1);
      fetchLogs(selectedDate);
      fetchWeeklyStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete log');
      
      showSuccess('Log entry removed.');
      fetchLogs(selectedDate);
      fetchWeeklyStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCustomFoodSubmit = async (e) => {
    e.preventDefault();
    const foodData = {
      name: customFood.name,
      calories: parseFloat(customFood.calories),
      protein: parseFloat(customFood.protein || 0),
      carbs: parseFloat(customFood.carbs || 0),
      fat: parseFloat(customFood.fat || 0),
      serving_size: customFood.serving_size || '1 serving'
    };

    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add custom food');
      }
      
      showSuccess(`Added "${foodData.name}" to the database!`);
      setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '', serving_size: '1 serving' });
      setShowCustomFoodForm(false);
      fetchFoods(searchQuery);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const goalData = {
      calories: parseFloat(settingsForm.calories),
      protein: parseFloat(settingsForm.protein),
      carbs: parseFloat(settingsForm.carbs),
      fat: parseFloat(settingsForm.fat)
    };

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });
      if (!res.ok) throw new Error('Failed to update goals');
      
      const updated = await res.json();
      setGoals(updated);
      showSuccess('Daily goals updated successfully!');
      setShowSettings(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculations
  const totalConsumed = logs.reduce((acc, log) => {
    return {
      calories: acc.calories + (log.calories * log.quantity),
      protein: acc.protein + (log.protein * log.quantity),
      carbs: acc.carbs + (log.carbs * log.quantity),
      fat: acc.fat + (log.fat * log.quantity)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const roundedConsumed = {
    calories: Math.round(totalConsumed.calories),
    protein: Math.round(totalConsumed.protein * 10) / 10,
    carbs: Math.round(totalConsumed.carbs * 10) / 10,
    fat: Math.round(totalConsumed.fat * 10) / 10
  };

  const caloriePercentage = Math.min(Math.round((roundedConsumed.calories / goals.calories) * 100), 999) || 0;
  const proteinPercentage = Math.min(Math.round((roundedConsumed.protein / goals.protein) * 100), 999) || 0;
  const carbsPercentage = Math.min(Math.round((roundedConsumed.carbs / goals.carbs) * 100), 999) || 0;
  const fatPercentage = Math.min(Math.round((roundedConsumed.fat / goals.fat) * 100), 999) || 0;

  // Meal-wise breakdown
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const mealBreakdown = meals.reduce((acc, meal) => {
    const mealLogs = logs.filter(log => log.meal_type === meal);
    const calories = mealLogs.reduce((sum, log) => sum + (log.calories * log.quantity), 0);
    acc[meal] = {
      logs: mealLogs,
      calories: Math.round(calories)
    };
    return acc;
  }, {});

  // Date navigation
  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(getLocalDateString(current));
  };

  // SVG Circular Progress Ring calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(caloriePercentage, 100) / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                AaharCal
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Indian Food Calorie & Macro Tracker</p>
            </div>
          </div>

          {/* Date Picker & Navigation */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button 
              onClick={() => changeDate(-1)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2 px-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-slate-200 focus:outline-none focus:ring-0 cursor-pointer"
              />
            </div>
            <button 
              onClick={() => changeDate(1)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Settings Button */}
          <div className="flex items-center space-x-3">
            {!backendConnected && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" title="Offline Mode"></span>
              </span>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-sm font-medium transition border border-slate-700"
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Success/Error Banners */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm animate-fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Calorie Ring & Macros */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>Daily Summary</span>
              </h2>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                {selectedDate === getLocalDateString() ? 'Today' : selectedDate}
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-emerald-500 transition-all duration-500 ease-out"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-100">
                    {roundedConsumed.calories}
                  </span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                    / {goals.calories} kcal
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                {goals.calories - roundedConsumed.calories >= 0 ? (
                  <p className="text-sm text-slate-300">
                    You have <span className="text-emerald-400 font-bold">{goals.calories - roundedConsumed.calories} kcal</span> remaining
                  </p>
                ) : (
                  <p className="text-sm text-rose-400 font-medium">
                    You are <span className="font-bold">{Math.abs(goals.calories - roundedConsumed.calories)} kcal</span> over your goal
                  </p>
                )}
              </div>
            </div>

            {/* Macronutrient Progress Bars */}
            <div className="space-y-4 border-t border-slate-800/60 pt-6">
              {/* Carbs */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-amber-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1"></span>
                    Carbs
                  </span>
                  <span className="text-slate-300">
                    {roundedConsumed.carbs}g / <span className="text-slate-500">{goals.carbs}g</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${carbsPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>
                    Protein
                  </span>
                  <span className="text-slate-300">
                    {roundedConsumed.protein}g / <span className="text-slate-500">{goals.protein}g</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${proteinPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-rose-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1"></span>
                    Fat
                  </span>
                  <span className="text-slate-300">
                    {roundedConsumed.fat}g / <span className="text-slate-500">{goals.fat}g</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${fatPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Food Logger & Search */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col space-y-6 backdrop-blur-sm lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-emerald-400" />
                  <span>Log Indian Foods</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Search from pre-populated popular Indian dishes or add custom ones</p>
              </div>
              
              <button
                onClick={() => setShowCustomFoodForm(!showCustomFoodForm)}
                className="flex items-center justify-center space-x-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{showCustomFoodForm ? 'Search Database' : 'Create Custom Food'}</span>
              </button>
            </div>

            {showCustomFoodForm ? (
              /* Custom Food Creator Form */
              <form onSubmit={handleCustomFoodSubmit} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800/60 pb-2">
                  Create Custom Indian Food Item
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Food Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Paneer Tikka"
                      value={customFood.name}
                      onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Serving Size *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 1 plate, 100g, 1 piece"
                      value={customFood.serving_size}
                      onChange={(e) => setCustomFood({ ...customFood, serving_size: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Calories (kcal) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      value={customFood.calories}
                      onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={customFood.protein}
                      onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={customFood.carbs}
                      onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={customFood.fat}
                      onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomFoodForm(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Save Food Item
                  </button>
                </div>
              </form>
            ) : (
              /* Food Search & List */
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Indian foods (e.g., Biryani, Roti, Paneer...)"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Food Results List */}
                <div className="max-h-[280px] overflow-y-auto border border-slate-800/60 rounded-xl divide-y divide-slate-800/40 bg-slate-950/20">
                  {foods.length > 0 ? (
                    foods.map((food) => (
                      <div 
                        key={food.id} 
                        className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition group"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition">
                            {food.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Serving: {food.serving_size} • {food.calories} kcal
                          </p>
                          <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-500">
                            <span>C: {food.carbs}g</span>
                            <span>P: {food.protein}g</span>
                            <span>F: {food.fat}g</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFoodForLogging(food);
                            setLogQuantity(1);
                          }}
                          className="bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white p-2 rounded-lg transition"
                          title="Log this food"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No foods found matching "{searchQuery}". Try creating a custom food!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Log Modal/Form Overlay */}
        {selectedFoodForLogging && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <span>Log Food Entry</span>
                </h3>
                <button 
                  onClick={() => setSelectedFoodForLogging(null)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4">
                <h4 className="text-sm font-bold text-emerald-400">{selectedFoodForLogging.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Base Serving: {selectedFoodForLogging.serving_size}</p>
                
                <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/40">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Calories</span>
                    <span className="text-xs font-bold text-slate-200">
                      {Math.round(selectedFoodForLogging.calories * logQuantity)} kcal
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/40">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Carbs</span>
                    <span className="text-xs font-bold text-amber-400">
                      {Math.round(selectedFoodForLogging.carbs * logQuantity * 10) / 10}g
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/40">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Protein</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {Math.round(selectedFoodForLogging.protein * logQuantity * 10) / 10}g
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/40">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Fat</span>
                    <span className="text-xs font-bold text-rose-400">
                      {Math.round(selectedFoodForLogging.fat * logQuantity * 10) / 10}g
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogFoodSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Servings / Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={logQuantity}
                      onChange={(e) => setLogQuantity(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Meal Type</label>
                    <select
                      value={logMealType}
                      onChange={(e) => setLogMealType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFoodForLogging(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Log Food
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Daily Log List Section */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-400" />
              <span>Daily Food Log</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Your logged meals for {selectedDate}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {meals.map((meal) => {
              const mealData = mealBreakdown[meal] || { logs: [], calories: 0 };
              return (
                <div key={meal} className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
                      <span className="text-sm font-bold text-slate-300">{meal}</span>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {mealData.calories} kcal
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {mealData.logs.length > 0 ? (
                        mealData.logs.map((log) => (
                          <div key={log.id} className="group flex items-start justify-between bg-slate-900/40 p-2 rounded-lg border border-slate-800/30 hover:border-slate-700/50 transition">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-slate-200 truncate">{log.food_name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {log.quantity}x • {Math.round(log.calories * log.quantity)} kcal
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-6">No items logged</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Analytics Chart */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span>Weekly Calorie Intake</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Calorie consumption over the last 7 days compared to your goal</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
              <span>Calories</span>
              <span className="w-3 h-0.5 border-t border-dashed border-rose-500/80 ml-2"></span>
              <span>Goal ({goals.calories} kcal)</span>
            </div>
          </div>

          {/* Custom SVG/CSS Bar Chart */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-6">
            <div className="relative h-48 flex items-end justify-between pt-6">
              {/* Goal Line */}
              <div 
                className="absolute left-0 right-0 border-t border-dashed border-rose-500/50 z-10 flex items-center"
                style={{ 
                  bottom: `${Math.min((goals.calories / Math.max(...weeklyStats.map(s => s.calories), goals.calories, 1)) * 100, 100)}%` 
                }}
              >
                <span className="bg-slate-950 text-[9px] text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 -mt-2.5 ml-2 font-semibold">
                  Goal: {goals.calories}
                </span>
              </div>

              {weeklyStats.map((stat, idx) => {
                const maxCal = Math.max(...weeklyStats.map(s => s.calories), goals.calories, 1);
                const heightPercent = (stat.calories / maxCal) * 100;
                const isToday = stat.date === getLocalDateString();
                
                // Format date label (e.g., "Mon 12")
                const dateObj = new Date(stat.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.getDate();

                return (
                  <div key={stat.date} className="flex flex-col items-center flex-1 group z-20">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 border border-slate-800 text-slate-200 text-[10px] px-2.5 py-1 rounded-lg shadow-xl pointer-events-none text-center">
                      <p className="font-bold">{stat.calories} kcal</p>
                      <p className="text-slate-400 text-[9px]">{stat.date}</p>
                    </div>

                    {/* Bar */}
                    <div className="w-8 sm:w-12 bg-slate-900 rounded-t-lg overflow-hidden h-36 flex items-end border border-slate-800/40">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday 
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400' 
                            : 'bg-gradient-to-t from-slate-800 to-emerald-500/80'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>

                    {/* Label */}
                    <span className={`text-[10px] mt-2 font-medium ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      {dayName} {dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5 text-emerald-400" />
                <span>Update Daily Goals</span>
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Daily Calorie Goal (kcal)</label>
                <input
                  type="number"
                  required
                  min="500"
                  max="10000"
                  value={settingsForm.calories}
                  onChange={(e) => setSettingsForm({ ...settingsForm, calories: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Carbs Goal (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={settingsForm.carbs}
                    onChange={(e) => setSettingsForm({ ...settingsForm, carbs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Protein Goal (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={settingsForm.protein}
                    onChange={(e) => setSettingsForm({ ...settingsForm, protein: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fat Goal (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={settingsForm.fat}
                    onChange={(e) => setSettingsForm({ ...settingsForm, fat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}