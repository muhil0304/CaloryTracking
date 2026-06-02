import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Filter, 
  Sparkles, 
  Utensils, 
  X,
  Check
} from 'lucide-react';
import { Food, MealType } from '../types';

interface FoodDatabaseProps {
  foods: Food[];
  onAddCustomFood: (food: Omit<Food, 'id'>) => Promise<void>;
  onDeleteFood: (id: number) => Promise<void>;
  onLogFoodDirectly?: (foodId: number, mealType: MealType) => void;
}

export const FoodDatabase: React.FC<FoodDatabaseProps> = ({
  foods,
  onAddCustomFood,
  onDeleteFood,
  onLogFoodDirectly,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedFoodForLog, setSelectedFoodForLog] = useState<Food | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Breakfast');

  // Form state for custom food
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Curries');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [formError, setFormError] = useState('');

  // Categories list
  const categories = ['All', 'Breads', 'Rice', 'Curries', 'Snacks', 'Desserts', 'Custom'];

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || 
        (selectedCategory === 'Custom' && food.isCustom) ||
        (selectedCategory !== 'Custom' && food.category === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [foods, searchQuery, selectedCategory]);

  const handleSubmitCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Food name is required');
      return;
    }

    const calVal = parseFloat(calories);
    const protVal = parseFloat(protein);
    const carbVal = parseFloat(carbs);
    const fatVal = parseFloat(fat);
    const sizeVal = parseFloat(servingSize);

    if (isNaN(calVal) || calVal < 0 ||
        isNaN(protVal) || protVal < 0 ||
        isNaN(carbVal) || carbVal < 0 ||
        isNaN(fatVal) || fatVal < 0 ||
        isNaN(sizeVal) || sizeVal <= 0) {
      setFormError('Please enter valid positive numbers for all nutritional values');
      return;
    }

    try {
      await onAddCustomFood({
        name: name.trim(),
        category,
        calories: calVal,
        protein: protVal,
        carbs: carbVal,
        fat: fatVal,
        servingSize: sizeVal,
        servingUnit: servingUnit.trim() || 'g',
        isCustom: true
      });

      // Reset form
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setServingSize('100');
      setServingUnit('g');
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save custom food');
    }
  };

  const handleOpenLogModal = (food: Food) => {
    setSelectedFoodForLog(food);
    setIsLogModalOpen(true);
  };

  const handleConfirmLog = () => {
    if (selectedFoodForLog && onLogFoodDirectly) {
      onLogFoodDirectly(selectedFoodForLog.id, selectedMealType);
      setIsLogModalOpen(false);
      setSelectedFoodForLog(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Indian Food Database</h2>
          <p className="text-slate-500 text-sm">Search, filter, and log traditional Indian foods or add your own custom recipes.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-100 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Custom Food</span>
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Indian foods (e.g., Paneer Butter Masala, Roti, Biryani...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center text-slate-400 mr-2 text-xs font-bold uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span>Filter:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      {filteredFoods.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No foods found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            We couldn't find any food matching "{searchQuery}" in this category. Try adding it as a custom food!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => (
            <div 
              key={food.id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              {food.isCustom && (
                <span className="absolute top-3 right-3 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Custom
                </span>
              )}

              <div>
                <div className="flex items-start justify-between mb-1 pr-12">
                  <h4 className="font-bold text-slate-800 text-base leading-snug">{food.name}</h4>
                </div>
                <span className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {food.category} • Per {food.servingSize}{food.servingUnit}
                </span>

                {/* Calories Display */}
                <div className="flex items-baseline space-x-1 mb-4">
                  <span className="text-2xl font-extrabold text-slate-800">{Math.round(food.calories)}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">kcal</span>
                </div>

                {/* Macros Row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 text-center mb-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Protein</span>
                    <span className="text-xs font-extrabold text-emerald-600">{food.protein}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Carbs</span>
                    <span className="text-xs font-extrabold text-amber-600">{food.carbs}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Fat</span>
                    <span className="text-xs font-extrabold text-rose-600">{food.fat}g</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                {onLogFoodDirectly && (
                  <button
                    onClick={() => handleOpenLogModal(food)}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Utensils className="h-3.5 w-3.5" />
                    <span>Log Food</span>
                  </button>
                )}
                {food.isCustom && (
                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all"
                    title="Delete Custom Food"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Add Custom Indian Food</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomFood} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Homemade Paneer Bhurji"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                  >
                    <option value="Breads">Breads</option>
                    <option value="Rice">Rice</option>
                    <option value="Curries">Curries</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serving Size</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={servingSize}
                      onChange={(e) => setServingSize(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="g, piece"
                      value={servingUnit}
                      onChange={(e) => setServingUnit(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Calories (kcal) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Protein (g) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carbs (g) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fat (g) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-100 transition-all"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Log Modal */}
      {isLogModalOpen && selectedFoodForLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Log to Daily Diary</h3>
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Selected Food</span>
                <span className="font-bold text-slate-800 text-base block">{selectedFoodForLog.name}</span>
                <span className="text-xs text-slate-500">
                  {selectedFoodForLog.calories} kcal per {selectedFoodForLog.servingSize} {selectedFoodForLog.servingUnit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Meal Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMealType(meal)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        selectedMealType === meal
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLog}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-100 transition-all flex items-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Log 1 Serving</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};