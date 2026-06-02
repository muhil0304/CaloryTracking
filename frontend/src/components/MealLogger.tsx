import React, { useState } from 'react';
import { 
  Coffee, 
  Sun, 
  Moon, 
  Cookie, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  X, 
  Check,
  Sparkles
} from 'lucide-react';
import { MealLog, Food, MealType } from '../types';

interface MealLoggerProps {
  date: string;
  logs: MealLog[];
  foods: Food[];
  onAddLog: (log: { mealType: string; foodId: number; servings: number }) => Promise<void>;
  onUpdateLog: (id: number, servings: number) => Promise<void>;
  onDeleteLog: (id: number) => Promise<void>;
}

export const MealLogger: React.FC<MealLoggerProps> = ({
  logs,
  foods,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState<number>(1);

  // Editing state
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editingServings, setEditingServings] = useState<number>(1);

  // Group logs by meal type
  const logsByMeal = {
    Breakfast: logs.filter(l => l.mealType === 'Breakfast'),
    Lunch: logs.filter(l => l.mealType === 'Lunch'),
    Dinner: logs.filter(l => l.mealType === 'Dinner'),
    Snacks: logs.filter(l => l.mealType === 'Snacks'),
  };

  // Calculate totals per meal
  const mealTotals = {
    Breakfast: Math.round(logsByMeal.Breakfast.reduce((sum, l) => sum + l.calories, 0)),
    Lunch: Math.round(logsByMeal.Lunch.reduce((sum, l) => sum + l.calories, 0)),
    Dinner: Math.round(logsByMeal.Dinner.reduce((sum, l) => sum + l.calories, 0)),
    Snacks: Math.round(logsByMeal.Snacks.reduce((sum, l) => sum + l.calories, 0)),
  };

  // Filter foods based on search query
  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = (mealType: MealType) => {
    setActiveMealType(mealType);
    setSelectedFood(null);
    setServings(1);
    setSearchQuery('');
    setIsAddModalOpen(true);
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setServings(1);
  };

  const handleSaveLog = async () => {
    if (!selectedFood) return;
    await onAddLog({
      mealType: activeMealType,
      foodId: selectedFood.id,
      servings: servings
    });
    setIsAddModalOpen(false);
  };

  const handleStartEdit = (log: MealLog) => {
    setEditingLogId(log.id);
    setEditingServings(log.servings);
  };

  const handleSaveEdit = async (id: number) => {
    if (editingServings <= 0) return;
    await onUpdateLog(id, editingServings);
    setEditingLogId(null);
  };

  const getMealIcon = (mealType: MealType) => {
    switch (mealType) {
      case 'Breakfast': return <Coffee className="h-5 w-5 text-amber-500" />;
      case 'Lunch': return <Sun className="h-5 w-5 text-emerald-500" />;
      case 'Dinner': return <Moon className="h-5 w-5 text-indigo-500" />;
      case 'Snacks': return <Cookie className="h-5 w-5 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Daily Meal Diary</h2>
        <p className="text-slate-500 text-sm">Log your meals, adjust portion sizes, and track your macronutrient intake.</p>
      </div>

      {/* Meal Sections */}
      <div className="space-y-6">
        {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((mealType) => {
          const mealLogs = logsByMeal[mealType];
          const totalKcal = mealTotals[mealType];

          return (
            <div key={mealType} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                    {getMealIcon(mealType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{mealType}</h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {mealLogs.length} {mealLogs.length === 1 ? 'item' : 'items'} logged
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {totalKcal} kcal
                  </span>
                  <button
                    onClick={() => handleOpenAddModal(mealType)}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all flex items-center space-x-1 text-xs font-bold px-3"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Food</span>
                  </button>
                </div>
              </div>

              {/* Logged Items List */}
              {mealLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No food logged for {mealType} yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {mealLogs.map((log) => {
                    const isEditing = editingLogId === log.id;

                    return (
                      <div key={log.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                        {/* Food Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800 text-sm sm:text-base">{log.foodName}</span>
                          </div>
                          
                          {isEditing ? (
                            <div className="flex items-center space-x-2 mt-2">
                              <label className="text-xs font-bold text-slate-400 uppercase">Servings:</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={editingServings}
                                onChange={(e) => setEditingServings(parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              />
                              <span className="text-xs text-slate-500">
                                x {log.servingSize} {log.servingUnit} ({Math.round(log.servingSize * editingServings)}{log.servingUnit})
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-semibold block mt-0.5">
                              {log.servings} x {log.servingSize} {log.servingUnit} ({Math.round(log.servingSize * log.servings)}{log.servingUnit})
                            </span>
                          )}
                        </div>

                        {/* Nutrition & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          {/* Nutrition Stats */}
                          <div className="flex items-center space-x-4 text-right">
                            <div>
                              <span className="block text-xs font-bold text-slate-400 uppercase">Calories</span>
                              <span className="text-sm font-extrabold text-slate-700">{Math.round(log.calories)} kcal</span>
                            </div>
                            <div className="hidden sm:block">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">P / C / F</span>
                              <span className="text-xs font-semibold text-slate-500">
                                {Math.round(log.protein)}g / {Math.round(log.carbs)}g / {Math.round(log.fat)}g
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(log.id)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all"
                                  title="Save Changes"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingLogId(null)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(log)}
                                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                                  title="Edit Portion"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteLog(log.id)}
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                                  title="Delete Log"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Add Food to {activeMealType}</h3>
                <p className="text-xs text-slate-400">Search and select from the Indian food database</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Food Selection Area */}
              {!selectedFood ? (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {filteredFoods.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No matching foods found.
                    </div>
                  ) : (
                    filteredFoods.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleSelectFood(food)}
                        className="w-full p-3 text-left hover:bg-slate-50 transition-all flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-700 text-sm block">{food.name}</span>
                          <span className="text-xs text-slate-400">
                            {food.calories} kcal per {food.servingSize} {food.servingUnit}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          Select
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                /* Portion Configuration */
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase block">Selected Food</span>
                      <span className="font-bold text-slate-800 text-base block">{selectedFood.name}</span>
                      <span className="text-xs text-slate-500">
                        Base: {selectedFood.calories} kcal per {selectedFood.servingSize} {selectedFood.servingUnit}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFood(null)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      Change Food
                    </button>
                  </div>

                  {/* Servings Input */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Number of Servings</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={servings}
                        onChange={(e) => setServings(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Weight/Portion</span>
                      <span className="text-sm font-bold text-slate-700 block py-2">
                        {Math.round(selectedFood.servingSize * servings)} {selectedFood.servingUnit}
                      </span>
                    </div>
                  </div>

                  {/* Live Preview of Nutrition */}
                  <div className="bg-white rounded-xl p-3 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                      Portion Nutrition Preview
                    </h4>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Calories</span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {Math.round(selectedFood.calories * servings)} kcal
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Protein</span>
                        <span className="text-xs font-extrabold text-emerald-600">
                          {Math.round(selectedFood.protein * servings)}g
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Carbs</span>
                        <span className="text-xs font-extrabold text-amber-600">
                          {Math.round(selectedFood.carbs * servings)}g
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Fat</span>
                        <span className="text-xs font-extrabold text-rose-600">
                          {Math.round(selectedFood.fat * servings)}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFood || servings <= 0}
                onClick={handleSaveLog}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-100 transition-all"
              >
                Log Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};