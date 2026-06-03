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
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login/Signup Form State
  const [isLoginView, setIsLoginView] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
    if (user) {
      fetchFoods();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLogsAndStats();
    }
  }, [selectedDate, user]);

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

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setLogs([]);
    setStats({
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      goals: { calories: 2000, protein: 120, carbs: 250, fat: 65 }
    });
    showToast('Logged out successfully.');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLoginView) {
        handleLoginSuccess(data);
        showToast(`Welcome back, ${data.username}!`);
      } else {
        // Automatically log in after successful signup
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authUsername, password: authPassword })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || 'Login failed after signup');
        handleLoginSuccess(loginData);
        showToast(`Account created! Welcome, ${loginData.username}!`);
      }
      setAuthUsername('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
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
        fetch(`/api/logs?date=${selectedDate}`, {
          headers: { 'x-user-id': user.id.toString() }
        }),
        fetch(`/api/stats?date=${selectedDate}`, {
          headers: { 'x-user-id': user.id.toString() }
        })
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
        fat: food.fat
      };

      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
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
    if (!selectedFood || !user) return;

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
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
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
    if (!user) return;
    try {
      const res = await fetch(`/api/logs/${id}`, { 
        method: 'DELETE',
        headers: { 'x-user-id': user.id.toString() }
      });
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
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
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
  const calorieGoal = stats.goals?.calories || 2000;
  const caloriesConsumed = Math.round(stats.total_calories || 0);
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

  const carbsProgress = getMacroProgress(stats.total_carbs || 0, stats.goals?.carbs || 250);
  const proteinProgress = getMacroProgress(stats.total_protein || 0, stats.goals?.protein || 120);
  const fatProgress = getMacroProgress(stats.total_fat || 0, stats.goals?.fat || 65);

  // Popular quick-add foods list
  const popularFoods = foods.filter(f => 
    ['Roti', 'Rice', 'Dal Tadka', 'Masala Chai', 'Idli'].includes(f.name)
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all duration-300 transform translate-y-0 ${
            toast.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <Check className="w-5 h-5 text-emerald-500" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 mb-4">
            <Flame className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Colory
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Track your daily calories and macros with ease
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-md rounded-2xl sm:px-10 border border-slate-100">
            <div className="flex justify-center mb-6 border-b border-slate-100 pb-4">
              <button
                onClick={() => { setIsLoginView(true); setAuthError(''); }}
                className={`flex-1 pb-2 text-center font-semibold text-sm transition-colors ${
                  isLoginView ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLoginView(false); setAuthError(''); }}
                className={`flex-1 pb-2 text-center font-semibold text-sm transition-colors ${
                  !isLoginView ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-800 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleAuthSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Enter username"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={isLoginView ? "••••••••" : "At least 6 characters"}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isLoginView ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100">
              <Flame className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Colory</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-700">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={setToday}
              className="px-3 py-1.5 hover:bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm sm:text-base">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date(selectedDate).toLocaleDateString('en