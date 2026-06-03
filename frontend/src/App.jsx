import React, { useState, useEffect } from 'react';
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
  Apple, 
  Droplet, 
  PlusCircle, 
  TrendingUp, 
  X, 
  Check,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    targets: { calories: 2000, protein: 60, carbs: 250, fat: 70 }
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modals & Forms
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [preselectedMealType, setPreselectedMealType] = useState('Breakfast');
  
  // Log Food Form State
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('Breakfast');

  // Custom Food Form State
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
    category: 'Curry'
  });
  const [customFoodSuccess, setCustomFoodSuccess] = useState(false);

  const categories = ['Breakfast', 'Curry', 'Starter', 'Bread', 'Rice', 'Snack', 'Dessert', 'Beverage', 'Main Course', 'General'];

  useEffect(() => {
    fetchLogs();
    fetchStats();
    fetchWeeklyStats();
  }, [selectedDate]);

  useEffect(() => {
    fetchFoods();
  }, [searchQuery, selectedCategory]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs?date=${selectedDate}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats?date=${selectedDate}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(getLocalDateString(d));
      }
      const promises = dates.map(date => 
        fetch(`${API_BASE}/stats?date=${date}`).then(res => res.json())
      );
      const results = await Promise.all(promises);
      setWeeklyData(results);
    } catch (err) {
      console.error('Error fetching weekly stats:', err);
    }
  };

  const fetchFoods = async () => {
    try {
      const url = new URL(`${API_BASE}/foods`);
      if (searchQuery) url.searchParams.append('q', searchQuery);
      if (selectedCategory) url.searchParams.append('category', selectedCategory);
      const res = await fetch(url);
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error('Error fetching foods:', err);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;

    try {
      const res = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId: selectedFood.id,
          quantity: Number(quantity),
          mealType,
          date: selectedDate
        })
      });
      if (res.ok) {
        fetchLogs();
        fetchStats();
        fetchWeeklyStats();
        setIsLogModalOpen(false);
        setSelectedFood(null);
        setQuantity(1);
      }
    } catch (err) {
      console.error('Error logging food:', err);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/logs/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLogs();
        fetchStats();
        fetchWeeklyStats();
      }
    } catch (err) {
      console.error('Error deleting log:', err);
    }
  };

  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customFood)
      });
      if (res.ok) {
        setCustomFoodSuccess(true);
        setCustomFood({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          servingSize: '',
          category: 'Curry'
        });
        fetchFoods();
        setTimeout(() => {
          setCustomFoodSuccess(false);
          setIsCustomFoodModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating custom food:', err);
    }
  };

  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(getLocalDateString(current));
  };

  const openLogModalForMeal = (type) => {
    setPreselectedMealType(type);
    setMealType(type);
    setIsLogModalOpen(true);
  };

  // Calculate progress percentages
  const calPercent = Math.min(Math.round((stats.consumed.calories / stats.targets.calories) * 100), 100);
  const proteinPercent = Math.min(Math.round((stats.consumed.protein / stats.targets.protein) * 100), 100);
  const carbsPercent = Math.min(Math.round((stats.consumed.carbs / stats.targets.carbs) * 100), 100);
  const fatPercent = Math.min(Math.round((stats.consumed.fat / stats.targets.fat) * 100), 100);

  // Group logs by meal type
  const mealGroups = {
    Breakfast: logs.filter(l => l.mealType === 'Breakfast'),
    Lunch: logs.filter(l => l.mealType === 'Lunch'),
    Dinner: logs.filter(l => l.mealType === 'Dinner'),
    Snacks: logs.filter(l => l.mealType === 'Snacks')
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Aahar</h1>
              <p className="text-xs text-slate-500 font-medium">Indian Calorie Tracker</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-2">
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
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCustomFoodModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Custom Food</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left & Middle Column: Dashboard & Meals */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Progress Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daily Summary</h2>
                <p className="text-xs text-slate-500">Your nutritional intake for today</p>
              </div>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Target: {stats.targets.calories} kcal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Calorie Ring */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="stroke-slate-100"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="stroke-emerald-500 transition-all duration-500 ease-out"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={314.16}
                      strokeDashoffset={314.16 - (calPercent / 100) * 314.16}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-slate-900">{stats.consumed.calories}</span>
                    <span className="text-xs text-slate-400 font-medium">/ {stats.targets.calories} kcal</span>
                    <span className="text-[10px] font-bold text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {calPercent}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 font-medium">
                  {stats.targets.calories - stats.consumed.calories > 0 
                    ? `${stats.targets.calories - stats.consumed.calories} kcal remaining`
                    : 'Daily calorie goal achieved! 🎉'}
                </p>
              </div>

              {/* Macronutrients */}
              <div className="md:col-span-7 space-y-5">
                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Carbs
                    </span>
                    <span>{stats.consumed.carbs}g / {stats.targets.carbs}g</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${carbsPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      Protein
                    </span>
                    <span>{stats.consumed.protein}g / {stats.targets.protein}g</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${proteinPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Fat
                    </span>
                    <span>{stats.consumed.fat}g / {stats.targets.fat}g</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${fatPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meal Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Meals Today</h3>
            
            {Object.entries(mealGroups).map(([mealName, items]) => {
              const totalMealCalories = items.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
              return (
                <div key={mealName} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="p-4 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{mealName}</h4>
                        <p className="text-xs text-slate-400">{items.length} {items.length === 1 ? 'item' : 'items'} logged</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-700">{Math.round(totalMealCalories)} kcal</span>
                      <button
                        onClick={() => openLogModalForMeal(mealName)}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No food logged for {mealName} yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-all">
                          <div>
                            <h5 className="font-semibold text-slate-800 text-sm">{item.name}</h5>
                            <p className="text-xs text-slate-400">
                              {item.quantity} serving{item.quantity > 1 ? 's' : ''} ({item.servingSize})
                            </p>
                            <div className="flex gap-3 mt-1 text-[10px] font-medium text-slate-500">
                              <span>C: {Math.round(item.carbs * item.quantity)}g</span>
                              <span>P: {Math.round(item.protein * item.quantity)}g</span>
                              <span>F: {Math.round(item.fat * item.quantity)}g</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-700">{Math.round(item.calories * item.quantity)} kcal</span>
                            <button
                              onClick={() => handleDeleteLog(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Analytics & Quick Actions */}
        <div className="space-y-8">
          
          {/* Weekly Analytics Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekly Intake</h3>
                <p className="text-xs text-slate-500">Last 7 days vs target</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-4">
              {weeklyData.map((day, idx) => {
                const heightPercent = Math.min((day.consumed?.calories / day.targets?.calories) * 100, 100) || 0;
                const isToday = day.date === selectedDate;
                const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg z-10 pointer-events-none whitespace-nowrap">
                      <span className="font-bold">{day.consumed?.calories} kcal</span>
                      <span>{day.date}</span>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isToday ? 'bg-emerald-500' : 'bg-emerald-300 group-hover:bg-emerald-400'
                        }`}
                        style={{ height: `${heightPercent || 5}%` }}
                      ></div>
                    </div>

                    {/* Label */}
                    <span className={`text-[10px] font-bold mt-2 ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Food Search & Log Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Log Food</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Indian foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === '' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {foods.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No foods found. Try adding a custom food!</p>
              ) : (
                foods.map(food => (
                  <div 
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setIsLogModalOpen(true);
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-100 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs group-hover:text-emerald-700 transition-colors">{food.name}</h4>
                      <p className="text-[10px] text-slate-400">{food.servingSize} • {food.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{food.calories} kcal</span>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Log Food Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Log Food Consumption</h3>
              <button 
                onClick={() => {
                  setIsLogModalOpen(false);
                  setSelectedFood(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Food Selector if not pre-selected */}
            {!selectedFood ? (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">Select Food</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search food to log..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {foods.map(food => (
                    <div 
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{food.name}</h4>
                        <p className="text-[10px] text-slate-400">{food.servingSize}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{food.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddLog} className="space-y-5">
                {/* Selected Food Info */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <h4 className="font-bold text-emerald-800 text-sm">{selectedFood.name}</h4>
                  <p className="text-xs text-emerald-600/80 mb-3">Base serving: {selectedFood.servingSize}</p>
                  
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      <span className="block text-[10px] text-slate-400 font-medium">Calories</span>
                      <span className="text-xs font-bold text-slate-700">{Math.round(selectedFood.calories * quantity)}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      <span className="block text-[10px] text-slate-400 font-medium">Carbs</span>
                      <span className="text-xs font-bold text-slate-700">{Math.round(selectedFood.carbs * quantity)}g</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      <span className="block text-[10px] text-slate-400 font-medium">Protein</span>
                      <span className="text-xs font-bold text-slate-700">{Math.round(selectedFood.protein * quantity)}g</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100">
                      <span className="block text-[10px] text-slate-400 font-medium">Fat</span>
                      <span className="text-xs font-bold text-slate-700">{Math.round(selectedFood.fat * quantity)}g</span>
                    </div>
                  </div>
                </div>

                {/* Servings Slider / Input */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <label>Number of Servings</label>
                    <span className="text-emerald-600">{quantity} serving{quantity > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <input
                      type="number"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Meal Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Meal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          mealType === type 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="flex-1 py-2.5 border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 transition-all"
                  >
                    Log Food
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Custom Food Creator Modal */}
      {isCustomFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Create Custom Food</h3>
              <button 
                onClick={() => setIsCustomFoodModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {customFoodSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800">Food Created Successfully!</h4>
                <p className="text-xs text-slate-400">It is now available in your food database.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateCustomFood} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Food Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Paneer Bhurji"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Serving Size</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 1 bowl (200g)"
                      value={customFood.servingSize}
                      onChange={(e) => setCustomFood({ ...customFood, servingSize: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                    <select
                      value={customFood.category}
                      onChange={(e) => setCustomFood({ ...customFood, category: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Calories (kcal)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      value={customFood.calories}
                      onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Protein (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={customFood.protein}
                      onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Carbs (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={customFood.carbs}
                      onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Fat (g)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={customFood.fat}
                      onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all mt-2"
                >
                  Create Food Item
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}