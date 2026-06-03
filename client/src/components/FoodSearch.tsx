import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, PlusCircle, Check, Loader2 } from 'lucide-react';

interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: string;
  is_custom: number;
}

interface FoodSearchProps {
  foods: Food[];
  onAddLog: (log: { food_id: number; meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'; quantity: number }) => Promise<void>;
  onCreateCustomFood: (food: Omit<Food, 'id' | 'is_custom'>) => Promise<Food>;
  defaultMealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
}

export const FoodSearch: React.FC<FoodSearchProps> = ({
  foods,
  onAddLog,
  onCreateCustomFood,
  defaultMealType = 'Breakfast',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>(defaultMealType);
  const [isAdding, setIsAdding] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Custom Food Form State
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customServingSize, setCustomServingSize] = useState('1');
  const [customServingUnit, setCustomServingUnit] = useState('serving');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Sync defaultMealType when it changes from parent
  useEffect(() => {
    setMealType(defaultMealType);
  }, [defaultMealType]);

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = async () => {
    if (!selectedFood) return;
    setIsAdding(true);
    try {
      await onAddLog({
        food_id: selectedFood.id,
        meal_type: mealType,
        quantity: quantity,
      });
      setSuccessMessage(`Successfully added ${selectedFood.name} to ${mealType}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedFood(null);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add food log', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;
    setIsCreatingCustom(true);
    try {
      const newFood = await onCreateCustomFood({
        name: customName,
        calories: parseFloat(customCalories),
        protein: parseFloat(customProtein) || 0,
        carbs: parseFloat(customCarbs) || 0,
        fat: parseFloat(customFat) || 0,
        serving_size: parseFloat(customServingSize) || 1,
        serving_unit: customServingUnit || 'serving',
      });
      setSelectedFood(newFood);
      setShowCustomForm(false);
      // Reset form
      setCustomName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setCustomServingSize('1');
      setCustomServingUnit('serving');
    } catch (error) {
      console.error('Failed to create custom food', error);
    } finally {
      setIsCreatingCustom(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left/Middle Column: Search & List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <h2 className="text-xl font-bold text-slate-800">Search Indian Foods</h2>
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {showCustomForm ? 'Search Database' : 'Add Custom Food'}
          </button>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </div>
        )}

        {showCustomForm ? (
          /* Custom Food Form */
          <form onSubmit={handleCreateCustom} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Create Custom Indian Dish
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Dish Name (e.g., Homemade Roti)</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter food name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  required
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  placeholder="Calories"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  placeholder="Protein"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Carbohydrates (g)</label>
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  placeholder="Carbs"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fats (g)</label>
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  placeholder="Fats"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Serving Size</label>
                  <input
                    type="number"
                    value={customServingSize}
                    onChange={(e) => setCustomServingSize(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Unit</label>
                  <input
                    type="text"
                    value={customServingUnit}
                    onChange={(e) => setCustomServingUnit(e.target.value)}
                    placeholder="piece/bowl"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingCustom}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                {isCreatingCustom && <Loader2 className="w-4 h-4 animate-spin" />}
                Save & Select
              </button>
            </div>
          </form>
        ) : (
          /* Search & Results List */
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Biryani, Roti, Paneer, Dosa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm max-h-[450px] overflow-y-auto divide-y divide-slate-100">
              {filteredFoods.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No foods found matching "{searchQuery}". Try adding a custom food!
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setQuantity(1);
                    }}
                    className={`w-full text-left p-4 flex items-center justify-between transition-colors ${
                      selectedFood?.id === food.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">{food.name}</span>
                        {food.is_custom === 1 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Per {food.serving_size} {food.serving_unit} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{food.calories} kcal</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Log Food Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
        <h3 className="font-bold text-slate-800 text-base">Log Selected Food</h3>
        {selectedFood ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">{selectedFood.name}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Base: {selectedFood.calories} kcal per {selectedFood.serving_size} {selectedFood.serving_unit}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                <div className="bg-white p-1.5 rounded border border-slate-100">
                  <span className="text-slate-400 block">Carbs</span>
                  <span className="font-semibold text-slate-700">{Math.round(selectedFood.carbs * quantity * 10) / 10}g</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-100">
                  <span className="text-slate-400 block">Protein</span>
                  <span className="font-semibold text-slate-700">{Math.round(selectedFood.protein * quantity * 10) / 10}g</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-100">
                  <span className="text-slate-400 block">Fat</span>
                  <span className="font-semibold text-slate-700">{Math.round(selectedFood.fat * quantity * 10) / 10}g</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Meal Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      mealType === type
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Quantity ({selectedFood.serving_unit}s)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(0.25, quantity - 0.25))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.25, parseFloat(e.target.value) || 1))}
                  className="flex-1 text-center py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 0.25)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Total Calories</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  {Math.round(selectedFood.calories * quantity)} kcal
                </span>
              </div>
              <button
                onClick={handleAddFood}
                disabled={isAdding}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Log Meal
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            Select a food item from the search results or create a custom food to log your meal.
          </div>
        )}
      </div>
    </div>
  );
};