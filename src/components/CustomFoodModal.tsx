import React, { useState } from 'react';
import { Food, FoodCategory } from '../types';
import { X, Sparkles } from 'lucide-react';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomFood: (food: Omit<Food, 'id' | 'isCustom'>) => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  isOpen,
  onClose,
  onAddCustomFood,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Main Course');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [servingUnit, setServingUnit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Food name is required';
    if (!servingUnit.trim()) newErrors.servingUnit = 'Serving unit is required (e.g., 1 bowl, 1 piece)';
    
    const calNum = Number(calories);
    if (calories === '' || isNaN(calNum) || calNum < 0) {
      newErrors.calories = 'Calories must be a positive number';
    }
    
    const protNum = Number(protein);
    if (protein === '' || isNaN(protNum) || protNum < 0) {
      newErrors.protein = 'Protein must be a positive number';
    }

    const carbNum = Number(carbs);
    if (carbs === '' || isNaN(carbNum) || carbNum < 0) {
      newErrors.carbs = 'Carbs must be a positive number';
    }

    const fatNum = Number(fat);
    if (fat === '' || isNaN(fatNum) || fatNum < 0) {
      newErrors.fat = 'Fat must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onAddCustomFood({
      name: name.trim(),
      category,
      calories: Math.round(Number(calories)),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      servingUnit: servingUnit.trim(),
    });

    setName('');
    setCategory('Main Course');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setServingUnit('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl"></div>

        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 relative z-10">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Add Custom Indian Food
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Food Name</label>
            <input
              type="text"
              placeholder="e.g., Homemade Paneer Bhurji"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Main Course">Main Course</option>
                <option value="Snacks">Snacks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serving Unit</label>
              <input
                type="text"
                placeholder="e.g., 1 bowl (150g)"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              {errors.servingUnit && <p className="text-[10px] text-rose-400 mt-1">{errors.servingUnit}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Calories (kcal)</label>
              <input
                type="number"
                placeholder="e.g., 250"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              {errors.calories && <p className="text-[10px] text-rose-400 mt-1">{errors.calories}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 12"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              {errors.protein && <p className="text-[10px] text-rose-400 mt-1">{errors.protein}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 15"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              {errors.carbs && <p className="text-[10px] text-rose-400 mt-1">{errors.carbs}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 10"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              {errors.fat && <p className="text-[10px] text-rose-400 mt-1">{errors.fat}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all"
            >
              Add Food
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};