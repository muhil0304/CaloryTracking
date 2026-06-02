// Pre-populated Indian Food Database
const DEFAULT_FOOD_DATABASE = [
  { id: 'f1', name: 'Chicken Biryani', category: 'Main Course', calories: 490, protein: 22, carbs: 58, fat: 16, servingSize: '1 plate (350g)' },
  { id: 'f2', name: 'Paneer Butter Masala', category: 'Main Course', calories: 355, protein: 12, carbs: 14, fat: 28, servingSize: '1 bowl (150g)' },
  { id: 'f3', name: 'Butter Naan', category: 'Main Course', calories: 310, protein: 8, carbs: 48, fat: 10, servingSize: '1 piece (90g)' },
  { id: 'f4', name: 'Tandoori Roti', category: 'Main Course', calories: 110, protein: 4, carbs: 22, fat: 1, servingSize: '1 piece (40g)' },
  { id: 'f5', name: 'Dal Tadka', category: 'Main Course', calories: 150, protein: 7, carbs: 20, fat: 5, servingSize: '1 bowl (150g)' },
  { id: 'f6', name: 'Jeera Rice', category: 'Main Course', calories: 210, protein: 4, carbs: 44, fat: 2, servingSize: '1 plate (150g)' },
  { id: 'f7', name: 'Masala Dosa', category: 'Breakfast', calories: 315, protein: 6, carbs: 52, fat: 9, servingSize: '1 piece with chutney' },
  { id: 'f8', name: 'Idli (2 pcs)', category: 'Breakfast', calories: 150, protein: 5, carbs: 32, fat: 0.5, servingSize: '2 pieces with sambar' },
  { id: 'f9', name: 'Aloo Paratha', category: 'Breakfast', calories: 290, protein: 6, carbs: 45, fat: 10, servingSize: '1 piece with butter' },
  { id: 'f10', name: 'Poha', category: 'Breakfast', calories: 250, protein: 5, carbs: 42, fat: 7, servingSize: '1 plate (150g)' },
  { id: 'f11', name: 'Samosa', category: 'Snacks', calories: 260, protein: 4, carbs: 32, fat: 13, servingSize: '1 piece (75g)' },
  { id: 'f12', name: 'Dhokla', category: 'Snacks', calories: 160, protein: 6, carbs: 28, fat: 3, servingSize: '3 pieces (100g)' },
  { id: 'f13', name: 'Pakora (Onion)', category: 'Snacks', calories: 220, protein: 4, carbs: 21, fat: 14, servingSize: '4 pieces (100g)' },
  { id: 'f14', name: 'Gulab Jamun', category: 'Desserts', calories: 150, protein: 2, carbs: 24, fat: 5, servingSize: '1 piece (40g)' },
  { id: 'f15', name: 'Rasgulla', category: 'Desserts', calories: 120, protein: 3, carbs: 26, fat: 1, servingSize: '1 piece (50g)' },
  { id: 'f16', name: 'Mango Lassi', category: 'Beverages', calories: 240, protein: 6, carbs: 40, fat: 6, servingSize: '1 glass (250ml)' },
  { id: 'f17', name: 'Masala Chai (with milk & sugar)', category: 'Beverages', calories: 90, protein: 2, carbs: 14, fat: 3, servingSize: '1 cup (150ml)' },
  { id: 'f18', name: 'Filter Coffee', category: 'Beverages', calories: 80, protein: 2, carbs: 12, fat: 2.5, servingSize: '1 cup (150ml)' },
  { id: 'f19', name: 'Chana Masala', category: 'Main Course', calories: 240, protein: 8, carbs: 38, fat: 6, servingSize: '1 bowl (150g)' },
  { id: 'f20', name: 'Medu Vada (2 pcs)', category: 'Breakfast', calories: 195, protein: 5, carbs: 24, fat: 9, servingSize: '2 pieces' }
];

// Application State
let state = {
  dailyGoal: 2000,
  waterGoal: 2500,
  waterIntake: 0,
  loggedMeals: [],
  customFoods: [],
  currentCategoryFilter: 'All',
  searchQuery: ''
};

// Chart Instance
let macroChartInstance = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromLocalStorage();
  initializeTheme();
  initializeChart();
  renderAll();
  setupEventListeners();
  
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
});

// Load State from Local Storage
function loadStateFromLocalStorage() {
  const savedState = localStorage.getItem('aahar_tracker_state');
  if (savedState) {
    try {
      state = { ...state, ...JSON.parse(savedState) };
    } catch (e) {
      console.error('Error parsing local storage state:', e);
    }
  }
}

// Save State to Local Storage
function saveStateToLocalStorage() {
  localStorage.setItem('aahar_tracker_state', JSON.stringify({
    dailyGoal: state.dailyGoal,
    waterGoal: state.waterGoal,
    waterIntake: state.waterIntake,
    loggedMeals: state.loggedMeals,
    customFoods: state.customFoods
  }));
}

// Theme Initialization & Toggle
function initializeTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

// Initialize Chart.js for Macronutrients
function initializeChart() {
  const ctx = document.getElementById('macroChart').getContext('2d');
  
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  macroChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Carbs', 'Protein', 'Fat'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          '#f59e0b', // Amber 500
          '#f43f5e', // Rose 500
          '#6366f1'  // Indigo 500
        ],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Custom legend used in HTML
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${context.raw}g`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

// Update Chart Data
function updateChart(carbs, protein, fat) {
  if (!macroChartInstance) return;
  
  // If all macros are 0, show a placeholder equal distribution so chart doesn't look empty
  if (carbs === 0 && protein === 0 && fat === 0) {
    macroChartInstance.data.datasets[0].data = [1, 1, 1];
    macroChartInstance.data.datasets[0].backgroundColor = [
      '#e2e8f0', // Slate 200
      '#cbd5e1', // Slate 300
      '#94a3b8'  // Slate 400
    ];
  } else {
    macroChartInstance.data.datasets[0].data = [carbs, protein, fat];
    macroChartInstance.data.datasets[0].backgroundColor = [
      '#f59e0b',
      '#f43f5e',
      '#6366f1'
    ];
  }
  
  macroChartInstance.update();
}

// Setup Event Listeners
function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById('food-search');
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    renderFoodDatabase();
  });

  // Close modals on clicking outside
  window.addEventListener('click', (e) => {
    const goalModal = document.getElementById('goal-modal');
    const customFoodModal = document.getElementById('custom-food-modal');
    if (e.target === goalModal) closeGoalModal();
    if (e.target === customFoodModal) closeCustomFoodModal();
  });
}

// Render Everything
function renderAll() {
  renderGoals();
  renderFoodDatabase();
  renderLoggedMeals();
  renderWaterTracker();
  lucide.createIcons();
}

// Render Goals
function renderGoals() {
  document.getElementById('header-goal-text').textContent = state.dailyGoal;
  document.getElementById('mobile-goal-text').textContent = state.dailyGoal;
  document.getElementById('calories-target').textContent = state.dailyGoal;
  document.getElementById('water-goal-text').textContent = state.waterGoal;
}

// Render Food Database
function renderFoodDatabase() {
  const foodListContainer = document.getElementById('food-list');
  foodListContainer.innerHTML = '';

  // Combine default and custom foods
  const allFoods = [...state.customFoods, ...DEFAULT_FOOD_DATABASE];

  // Filter foods
  const filteredFoods = allFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(state.searchQuery);
    const matchesCategory = state.currentCategoryFilter === 'All' || 
                            (state.currentCategoryFilter === 'Custom' && state.customFoods.some(cf => cf.id === food.id)) ||
                            food.category === state.currentCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filteredFoods.length === 0) {
    foodListContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="p-4 bg-slate-50 dark:bg-slate-950 rounded-full text-slate-400 dark:text-slate-600 mb-3">
          <i data-lucide="search-code" class="w-8 h-8"></i>
        </div>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">No foods found</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Try searching for something else or create a custom food.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  filteredFoods.forEach(food => {
    const isCustom = state.customFoods.some(cf => cf.id === food.id);
    const foodCard = document.createElement('div');
    foodCard.className = 'p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all duration-200 flex flex-col gap-3 relative group';
    
    foodCard.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-100">${food.name}</h4>
            ${isCustom ? '<span class="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold">Custom</span>' : ''}
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">${food.servingSize} &bull; ${food.category}</span>
        </div>
        <div class="text-right">
          <span class="text-base font-extrabold text-amber-500 block">${food.calories} <span class="text-xs font-medium text-slate-400">kcal</span></span>
        </div>
      </div>

      <!-- Macros Badges -->
      <div class="flex gap-2">
        <span class="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-bold">C: ${food.carbs}g</span>
        <span class="px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-[11px] font-bold">P: ${food.protein}g</span>
        <span class="px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-bold">F: ${food.fat}g</span>
      </div>

      <!-- Log Form Controls -->
      <div class="flex items-center gap-2 mt-1 pt-3 border-t border-slate-100 dark:border-slate-800/40">
        <!-- Servings Selector -->
        <div class="flex-1">
          <select id="servings-${food.id}" class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="0.5">0.5 Serving</option>
            <option value="1" selected>1 Serving</option>
            <option value="1.5">1.5 Servings</option>
            <option value="2">2 Servings</option>
            <option value="3">3 Servings</option>
          </select>
        </div>

        <!-- Meal Type Selector -->
        <div class="flex-1">
          <select id="meal-${food.id}" class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch" selected>Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snacks">Snacks</option>
          </select>
        </div>

        <!-- Add Button -->
        <button onclick="logFood('${food.id}')" class="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200 shadow-md shadow-amber-500/10 flex items-center justify-center" title="Add to Log">
          <i data-lucide="plus" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Delete Custom Food Button (Only for custom foods) -->
      ${isCustom ? `
        <button onclick="deleteCustomFood('${food.id}')" class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded-lg" title="Delete Custom Food">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      ` : ''}
    `;
    foodListContainer.appendChild(foodCard);
  });

  lucide.createIcons();
}

// Filter Category
function filterCategory(category) {
  state.currentCategoryFilter = category;
  
  // Update active tab styles
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-category') === category) {
      tab.className = 'category-tab px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 bg-amber-500 text-white shadow-md shadow-amber-500/10';
    } else {
      tab.className = 'category-tab px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700';
    }
  });

  renderFoodDatabase();
}

// Log Food to Daily Meals
function logFood(foodId) {
  const allFoods = [...state.customFoods, ...DEFAULT_FOOD_DATABASE];
  const food = allFoods.find(f => f.id === foodId);
  if (!food) return;

  const servingsSelect = document.getElementById(`servings-${foodId}`);
  const mealSelect = document.getElementById(`meal-${foodId}`);
  
  const servings = parseFloat(servingsSelect.value);
  const mealType = mealSelect.value;

  const loggedItem = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    foodId: food.id,
    name: food.name,
    category: food.category,
    mealType: mealType,
    calories: Math.round(food.calories * servings),
    protein: parseFloat((food.protein * servings).toFixed(1)),
    carbs: parseFloat((food.carbs * servings).toFixed(1)),
    fat: parseFloat((food.fat * servings).toFixed(1)),
    servings: servings,
    timestamp: Date.now()
  };

  state.loggedMeals.push(loggedItem);
  saveStateToLocalStorage();
  renderAll();
  showToast(`Added ${servings} serving(s) of ${food.name} to ${mealType}!`, 'success');
}

// Delete Logged Meal
function deleteLoggedMeal(logId) {
  const itemIndex = state.loggedMeals.findIndex(item => item.id === logId);
  if (itemIndex > -1) {
    const itemName = state.loggedMeals[itemIndex].name;
    state.loggedMeals.splice(itemIndex, 1);
    saveStateToLocalStorage();
    renderAll();
    showToast(`Removed ${itemName} from log.`, 'info');
  }
}

// Render Logged Meals & Update Dashboard Stats
function renderLoggedMeals() {
  const mealGroups = {
    Breakfast: { container: document.querySelector('[data-meal-type="Breakfast"] .meal-items'), subtotal: 0 },
    Lunch: { container: document.querySelector('[data-meal-type="Lunch"] .meal-items'), subtotal: 0 },
    Dinner: { container: document.querySelector('[data-meal-type="Dinner"] .meal-items'), subtotal: 0 },
    Snacks: { container: document.querySelector('[data-meal-type="Snacks"] .meal-items'), subtotal: 0 }
  };

  // Clear all containers
  Object.keys(mealGroups).forEach(key => {
    mealGroups[key].container.innerHTML = '';
  });

  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;

  // Populate logged meals
  state.loggedMeals.forEach(item => {
    const group = mealGroups[item.mealType];
    if (group) {
      group.subtotal += item.calories;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl hover:border-rose-500/20 dark:hover:border-rose-500/20 transition-all duration-200 group';
      itemEl.innerHTML = `
        <div class="flex-1 min-w-0 pr-2">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">${item.name}</span>
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">x${item.servings}</span>
          </div>
          <span class="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">C: ${item.carbs}g &bull; P: ${item.protein}g &bull; F: ${item.fat}g</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-extrabold text-slate-700 dark:text-slate-300">${item.calories} kcal</span>
          <button onclick="deleteLoggedMeal('${item.id}')" class="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-colors duration-200" title="Delete Item">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
      group.container.appendChild(itemEl);
    }

    totalCalories += item.calories;
    totalCarbs += item.carbs;
    totalProtein += item.protein;
    totalFat += item.fat;
  });

  // Update subtotals and placeholders
  Object.keys(mealGroups).forEach(key => {
    const group = mealGroups[key];
    const subtotalEl = document.querySelector(`[data-meal-type="${key}"] .meal-subtotal`);
    subtotalEl.textContent = `${group.subtotal} kcal`;

    if (group.container.children.length === 0) {
      group.container.innerHTML = `
        <p class="text-xs text-slate-400 dark:text-slate-500 italic py-2 text-center">No items logged</p>
      `;
    }
  });

  // Update Dashboard Stats
  document.getElementById('calories-consumed').textContent = totalCalories;
  document.getElementById('log-total-calories').textContent = `${totalCalories} kcal logged`;

  const remaining = Math.max(0, state.dailyGoal - totalCalories);
  document.getElementById('calories-remaining').textContent = remaining;
  
  const percentage = Math.min(100, Math.round((totalCalories / state.dailyGoal) * 100));
  document.getElementById('progress-percentage').textContent = `${percentage}%`;

  // Update Circular Progress Ring
  const progressRing = document.getElementById('progress-ring');
  const radius = progressRing.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  progressRing.style.strokeDashoffset = offset;

  // Update Macro Totals & Percentages
  const totalMacrosWeight = totalCarbs + totalProtein + totalFat;
  const carbsPct = totalMacrosWeight > 0 ? Math.round((totalCarbs / totalMacrosWeight) * 100) : 0;
  const proteinPct = totalMacrosWeight > 0 ? Math.round((totalProtein / totalMacrosWeight) * 100) : 0;
  const fatPct = totalMacrosWeight > 0 ? Math.round((totalFat / totalMacrosWeight) * 100) : 0;

  document.getElementById('carbs-total').textContent = `${totalCarbs.toFixed(1)}g`;
  document.getElementById('carbs-percentage').textContent = `${carbsPct}%`;
  document.getElementById('protein-total').textContent = `${totalProtein.toFixed(1)}g`;
  document.getElementById('protein-percentage').textContent = `${proteinPct}%`;
  document.getElementById('fat-total').textContent = `${totalFat.toFixed(1)}g`;
  document.getElementById('fat-percentage').textContent = `${fatPct}%`;

  // Update Chart
  updateChart(
    parseFloat(totalCarbs.toFixed(1)),
    parseFloat(totalProtein.toFixed(1)),
    parseFloat(totalFat.toFixed(1))
  );

  lucide.createIcons();
}

// Water Tracker Functions
function renderWaterTracker() {
  document.getElementById('water-display').textContent = `${state.waterIntake} ml`;
  
  const percentage = Math.min(100, Math.round((state.waterIntake / state.waterGoal) * 100));
  const waterWave = document.getElementById('water-wave');
  waterWave.style.height = `${percentage}%`;
}

function addWater(amount) {
  state.waterIntake += amount;
  saveStateToLocalStorage();
  renderWaterTracker();
  showToast(`Added ${amount}ml of water! 💧`, 'success');
}

function resetWater() {
  state.waterIntake = 0;
  saveStateToLocalStorage();
  renderWaterTracker();
  showToast('Water intake reset.', 'info');
}

// Goal Modal Functions
function openGoalModal() {
  document.getElementById('input-calorie-goal').value = state.dailyGoal;
  document.getElementById('input-water-goal').value = state.waterGoal;
  
  const modal = document.getElementById('goal-modal');
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('modal-active'), 10);
}

function closeGoalModal() {
  const modal = document.getElementById('goal-modal');
  modal.classList.remove('modal-active');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

function saveGoals(event) {
  event.preventDefault();
  const calorieGoal = parseInt(document.getElementById('input-calorie-goal').value);
  const waterGoal = parseInt(document.getElementById('input-water-goal').value);

  if (calorieGoal && waterGoal) {
    state.dailyGoal = calorieGoal;
    state.waterGoal = waterGoal;
    saveStateToLocalStorage();
    renderAll();
    closeGoalModal();
    showToast('Daily goals updated successfully!', 'success');
  }
}

// Custom Food Modal Functions
function openCustomFoodModal() {
  document.getElementById('custom-food-form').reset();
  const modal = document.getElementById('custom-food-modal');
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('modal-active'), 10);
}

function closeCustomFoodModal() {
  const modal = document.getElementById('custom-food-modal');
  modal.classList.remove('modal-active');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

function saveCustomFood(event) {
  event.preventDefault();
  
  const name = document.getElementById('custom-name').value.trim();
  const category = document.getElementById('custom-category').value;
  const servingSize = document.getElementById('custom-serving').value.trim();
  const calories = parseInt(document.getElementById('custom-calories').value);
  const protein = parseFloat(document.getElementById('custom-protein').value);
  const carbs = parseFloat(document.getElementById('custom-carbs').value);
  const fat = parseFloat(document.getElementById('custom-fat').value);

  const newFood = {
    id: 'custom_' + Date.now(),
    name,
    category,
    servingSize,
    calories,
    protein,
    carbs,
    fat
  };

  state.customFoods.unshift(newFood);
  saveStateToLocalStorage();
  renderFoodDatabase();
  closeCustomFoodModal();
  showToast(`Created custom food: ${name}!`, 'success');
}

function deleteCustomFood(foodId) {
  if (confirm('Are you sure you want to delete this custom food?')) {
    state.customFoods = state.customFoods.filter(f => f.id !== foodId);
    saveStateToLocalStorage();
    renderFoodDatabase();
    showToast('Custom food deleted.', 'info');
  }
}

// Reset Day Confirmation
function confirmResetDay() {
  if (confirm('Are you sure you want to reset today\'s logged meals and water intake? This cannot be undone.')) {
    state.loggedMeals = [];
    state.waterIntake = 0;
    saveStateToLocalStorage();
    renderAll();
    showToast('Today\'s data has been reset.', 'info');
  }
}

// Toast Notification Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  let bgClass = 'bg-emerald-500 text-white';
  let icon = 'check-circle';
  
  if (type === 'info') {
    bgClass = 'bg-blue-500 text-white';
    icon = 'info';
  } else if (type === 'error') {
    bgClass = 'bg-rose-500 text-white';
    icon = 'alert-circle';
  }

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl ${bgClass} text-sm font-bold pointer-events-auto toast-animate`;
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}