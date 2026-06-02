import React, { useState, useMemo } from 'react';
import { Food, MealType } from '../types';
import { INDIAN_FOODS_DATABASE, getFoodEmoji } from '../data/indianFoods';
import { Search, Plus, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface FoodSearchProps {
  customFoods: Food[];
  onAddLog: (food: Food, mealType: MealType, servings: number) => void;
  onOpenCustomFoodModal: () => void;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({
  customFoods,
  onAddLog,
  onOpenCustomFoodModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);
  
  // Quick add state for the currently expanded food
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Breakfast');
  const [servings, setServings] = useState<number>(1);
  const [customServingsText, setCustomServingsText] = useState<string>('');
  const [showSuccessId, setShowSuccessId] = useState<string | null>(null);

  // Combine static database with custom foods
  const allFoods = useMemo(() => {
    return [...customFoods, ...INDIAN_FOODS_DATABASE];
  }, [customFoods]);

  // Categories list
  const categories = ['All', 'Breakfast', 'Main Course', 'Snacks', 'Desserts', 'Custom'];

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return allFoods.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Custom' && food.isCustom) ||
        food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allFoods, searchQuery, selectedCategory]);

  const handleExpandFood = (foodId: string) => {
    if (expandedFoodId === foodId) {
      setExpandedFoodId(null);
    } else {
      setExpandedFoodId(foodId);
      setServings(1);
      setCustomServingsText('');
      // Default meal type based on food category
      const food = allFoods.find(f => f.id === foodId);
      if (food) {
        if (food.category === 'Breakfast') setSelectedMeal('Breakfast');
        else if (food.category === 'Snacks') setSelectedMeal('Snacks');
        else if (food.category === 'Desserts') setSelectedMeal('Snacks');
        else setSelectedMeal('Lunch');
      }
    }
  };

  const handleAddFood = (food: Food) => {
    const finalServings = customServingsText ? parseFloat(customServingsText) : servings;
    if (isNaN(finalServings) || finalServings <= 0) return;

    onAddLog(food, selectedMeal, finalServings);
    
    // Show success animation
    setShowSuccessId(food.id);
    setTimeout(() => {
      setShowSuccessId(null);
    }, 1500);

    // Reset state
    setExpandedFoodId(null);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
            <Sparkles className="text-amber-400" size={22} />
            Indian Food Bazaar
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">Search and log authentic Indian dishes</p>
        </div>
        <button
          onClick={onOpenCustomFoodModal}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Custom Food
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Biryani, Roti, Paneer, Samosa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => {
            const isExpanded = expandedFoodId === food.id;
            const isSuccess = showSuccessId === food.id;
            const emoji = getFoodEmoji(food.name, food.category);

            return (
              <div
                key={food.id}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-black/40 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-white/5 hover:bg-white/10 border-white/5'
                }`}
              >
                {/* Food Header Card */}
                <div
                  onClick={() => handleExpandFood(food.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0" role="img" aria-label={food.name}>
                      {emoji}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                        {food.name}
                        {food.isCustom && (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] font-semibold text-amber-300 uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-gray-400 truncate">
                        {food.servingSize} • {food.calories} kcal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <span className="p-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="text-gray-400 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add Drawer */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 pt-1 border-t border-white/5 bg-black/20 animate-slideDown text-xs space-y-3">
                    {/* Macronutrient Quick View */}
                    <div className="grid grid-cols-3 gap-1 text-center bg-white/5 py-1.5 rounded-lg border border-white/5 text-[10px]">
                      <div>
                        <span className="text-gray-400 block">Carbs</span>
                        <span className="font-bold text-amber-300">{food.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Protein</span>
                        <span className="font-bold text-emerald-400">{food.protein}g</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Fat</span>
                        <span className="font-bold text-rose-400">{food.fat}g</span>
                      </div>
                    </div>

                    {/* Meal Type Selector */}
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                        Select Meal
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as MealType[]).map((meal) => (
                          <button
                            key={meal}
                            type="button"
                            onClick={() => setSelectedMeal(meal)}
                            className={`py-1 rounded font-medium text-[10px] transition-all ${
                              selectedMeal === meal
                                ? 'bg-amber-500 text-black font-bold'
                                : 'bg-white/5 hover:bg-white/10 text-gray-300'
                            }`}
                          >
                            {meal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Servings Selector */}
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Servings
                        </label>
                        <div className="flex gap-1">
                          {[0.5, 1, 1.5, 2].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setServings(val);
                                setCustomServingsText('');
                              }}
                              className={`flex-1 py-1 rounded font-medium text-[10px] transition-all ${
                                servings === val && !customServingsText
                                  ? 'bg-white/20 text-white border border-white/30'
                                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-transparent'
                              }`}
                            >
                              {val}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-20">
                        <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                          Custom
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="20"
                          placeholder="e.g. 2.5"
                          value={customServingsText}
                          onChange={(e) => {
                            setCustomServingsText(e.target.value);
                            setServings(0);
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500 text-center text-xs"
                        />
                      </div>
                    </div>

                    {/* Summary & Add Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-[11px]">
                        <span className="text-gray-400">Total: </span>
                        <strong className="text-amber-400 text-sm">
                          {Math.round(
                            food.calories * (customServingsText ? parseFloat(customServingsText) || 0 : servings)
                          )}{' '}
                          kcal
                        </strong>
                      </div>
                      <button
                        onClick={() => handleAddFood(food)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg flex items-center gap-1 transition-all shadow-md shadow-amber-500/10"
                      >
                        <Plus size={14} />
                        Log Meal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-8 text-center text-gray-400">
            <p className="text-sm">No foods found matching your search.</p>
            <button
              onClick={onOpenCustomFoodModal}
              className="mt-2 text-xs text-amber-400 hover:underline font-semibold"
            >
              Create a custom food item instead!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};