// Pre-populated Indian Food Database
const INDIAN_FOOD_DATABASE = [
    { id: 'roti', name: 'Roti (Whole Wheat)', category: 'Breads', calories: 85, protein: 3, carbs: 18, fats: 0.5, serving: '1 piece' },
    { id: 'butter_naan', name: 'Butter Naan', category: 'Breads', calories: 290, protein: 8, carbs: 45, fats: 9, serving: '1 piece' },
    { id: 'aloo_paratha', name: 'Aloo Paratha', category: 'Breads', calories: 210, protein: 4, carbs: 32, fats: 7, serving: '1 piece' },
    { id: 'white_rice', name: 'White Rice (Cooked)', category: 'Rice/Biryani', calories: 205, protein: 4.2, carbs: 44.5, fats: 0.4, serving: '1 cup (150g)' },
    { id: 'chicken_biryani', name: 'Chicken Biryani', category: 'Rice/Biryani', calories: 480, protein: 22, carbs: 54, fats: 16, serving: '1 plate (350g)' },
    { id: 'paneer_butter_masala', name: 'Paneer Butter Masala', category: 'Curries', calories: 320, protein: 12, carbs: 14, fats: 24, serving: '1 cup (200g)' },
    { id: 'dal_tadka', name: 'Dal Tadka', category: 'Curries', calories: 150, protein: 7, carbs: 20, fats: 4, serving: '1 cup (200g)' },
    { id: 'palak_paneer', name: 'Palak Paneer', category: 'Curries', calories: 250, protein: 11, carbs: 10, fats: 18, serving: '1 cup (200g)' },
    { id: 'mixed_veg', name: 'Mixed Vegetable Sabzi', category: 'Curries', calories: 120, protein: 3, carbs: 15, fats: 5, serving: '1 cup (200g)' },
    { id: 'samosa', name: 'Samosa', category: 'Snacks/Breakfast', calories: 260, protein: 3.5, carbs: 32, fats: 13, serving: '1 piece' },
    { id: 'masala_dosa', name: 'Masala Dosa', category: 'Snacks/Breakfast', calories: 315, protein: 6, carbs: 52, fats: 9, serving: '1 piece' },
    { id: 'idli', name: 'Idli', category: 'Snacks/Breakfast', calories: 120, protein: 4, carbs: 24, fats: 0.5, serving: '2 pieces' },
    { id: 'chole_bhature', name: 'Chole Bhature', category: 'Snacks/Breakfast', calories: 450, protein: 12, carbs: 58, fats: 19, serving: '1 plate' },
    { id: 'dhokla', name: 'Dhokla', category: 'Snacks/Breakfast', calories: 140, protein: 5, carbs: 22, fats: 3, serving: '2 pieces' },
    { id: 'medu_vada', name: 'Medu Vada', category: 'Snacks/Breakfast', calories: 190, protein: 6, carbs: 24, fats: 8, serving: '2 pieces' },
    { id: 'poha', name: 'Poha', category: 'Snacks/Breakfast', calories: 180, protein: 3.5, carbs: 33, fats: 3, serving: '1 plate' },
    { id: 'upma', name: 'Upma', category: 'Snacks/Breakfast', calories: 210, protein: 4.5, carbs: 38, fats: 4.5, serving: '1 plate' },
    { id: 'cucumber_raita', name: 'Cucumber Raita', category: 'Snacks/Breakfast', calories: 80, protein: 4, carbs: 6, fats: 4, serving: '1 cup (150g)' },
    { id: 'gulab_jamun', name: 'Gulab Jamun', category: 'Desserts', calories: 300, protein: 4, carbs: 50, fats: 10, serving: '2 pieces' },
    { id: 'gajar_halwa', name: 'Gajar ka Halwa', category: 'Desserts', calories: 280, protein: 5, carbs: 42, fats: 10, serving: '1 cup (150g)' },
    { id: 'rasgulla', name: 'Rasgulla', category: 'Desserts', calories: 180, protein: 3, carbs: 38, fats: 2, serving: '2 pieces' },
    { id: 'masala_chai', name: 'Masala Chai (with Sugar)', category: 'Drinks', calories: 90, protein: 2, carbs: 14, fats: 2.5, serving: '1 cup (150ml)' },
    { id: 'mango_lassi', name: 'Mango Lassi', category: 'Drinks', calories: 240, protein: 6, carbs: 40, fats: 6, serving: '1 glass (250ml)' }
];

// Application State
let state = {
    date: new Date().toISOString().split('T')[0],
    goals: {
        calories: 2000,
        protein: 120,
        carbs: 230,
        fats: 65,
        water: 8
    },
    logs: {}, // Format: { "YYYY-MM-DD": { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, water: 0 } }
    customFoods: [],
    activeCategory: 'all',
    searchQuery: '',
    selectedFoodForModal: null
};

// Chart.js Instance
let macroChartInstance = null;

// DOM Elements
const datePicker = document.getElementById('datePicker');
const prevDateBtn = document.getElementById('prevDateBtn');
const nextDateBtn = document.getElementById('nextDateBtn');

const openGoalsBtn = document.getElementById('openGoalsBtn');
const openCustomFoodBtn = document.getElementById('openCustomFoodBtn');

const goalModal = document.getElementById('goalModal');
const customFoodModal = document.getElementById('customFoodModal');
const addFoodModal = document.getElementById('addFoodModal');

const goalForm = document.getElementById('goalForm');
const customFoodForm = document.getElementById('customFoodForm');
const addFoodForm = document.getElementById('addFoodForm');

const foodSearchInput = document.getElementById('foodSearchInput');
const categoryFilters = document.getElementById('categoryFilters');
const foodDatabaseList = document.getElementById('foodDatabaseList');

const waterGlassesGrid = document.getElementById('waterGlassesGrid');
const addWaterBtn = document.getElementById('addWaterBtn');
const resetWaterBtn = document.getElementById('resetWaterBtn');
const waterCountText = document.getElementById('waterCountText');
const waterLiquidBar = document.getElementById('waterLiquidBar');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromLocalStorage();
    initDatePicker();
    initEventListeners();
    initChart();
    renderAll();
    lucide.createIcons();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// Load State from LocalStorage
function loadStateFromLocalStorage() {
    const savedGoals = localStorage.getItem('indical_goals');
    if (savedGoals) {
        state.goals = JSON.parse(savedGoals);
    }

    const savedLogs = localStorage.getItem('indical_logs');
    if (savedLogs) {
        state.logs = JSON.parse(savedLogs);
    }

    const savedCustomFoods = localStorage.getItem('indical_custom_foods');
    if (savedCustomFoods) {
        state.customFoods = JSON.parse(savedCustomFoods);
    }
}

// Save State to LocalStorage
function saveStateToLocalStorage() {
    localStorage.setItem('indical_goals', JSON.stringify(state.goals));
    localStorage.setItem('indical_logs', JSON.stringify(state.logs));
    localStorage.setItem('indical_custom_foods', JSON.stringify(state.customFoods));
}

// Initialize Date Picker
function initDatePicker() {
    datePicker.value = state.date;
    datePicker.addEventListener('change', (e) => {
        state.date = e.target.value;
        renderAll();
    });

    prevDateBtn.addEventListener('click', () => {
        changeDate(-1);
    });

    nextDateBtn.addEventListener('click', () => {
        changeDate(1);
    });
}

function changeDate(days) {
    const currentDate = new Date(state.date);
    currentDate.setDate(currentDate.getDate() + days);
    state.date = currentDate.toISOString().split('T')[0];
    datePicker.value = state.date;
    renderAll();
}

// Get Log for Current Date
function getCurrentDateLog() {
    if (!state.logs[state.date]) {
        state.logs[state.date] = {
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            },
            water: 0
        };
    }
    return state.logs[state.date];
}

// Initialize Event Listeners
function initEventListeners() {
    // Modal Openers
    openGoalsBtn.addEventListener('click', () => openModal(goalModal, populateGoalForm));
    openCustomFoodBtn.addEventListener('click', () => openModal(customFoodModal));

    // Modal Closers
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.fixed');
            closeModal(modal);
        });
    });

    // Close modal on background click
    [goalModal, customFoodModal, addFoodModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Form Submissions
    goalForm.addEventListener('submit', handleGoalFormSubmit);
    customFoodForm.addEventListener('submit', handleCustomFoodFormSubmit);
    addFoodForm.addEventListener('submit', handleAddFoodFormSubmit);

    // Search & Filter
    foodSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        renderFoodDatabase();
    });

    categoryFilters.addEventListener('click', (e) => {
        const pill = e.target.closest('.category-pill');
        if (!pill) return;

        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        state.activeCategory = pill.dataset.category;
        renderFoodDatabase();
    });

    // Water Tracker Buttons
    addWaterBtn.addEventListener('click', () => {
        const log = getCurrentDateLog();
        if (log.water < 30) {
            log.water += 1;
            saveStateToLocalStorage();
            renderWaterTracker();
        }
    });

    resetWaterBtn.addEventListener('click', () => {
        const log = getCurrentDateLog();
        log.water = 0;
        saveStateToLocalStorage();
        renderWaterTracker();
    });

    // Clear All Meals
    document.getElementById('clearAllMealsBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all logged meals for today?')) {
            const log = getCurrentDateLog();
            log.meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            saveStateToLocalStorage();
            renderAll();
        }
    });

    // Servings Multiplier Controls in Add Food Modal
    const servingsInput = document.getElementById('servingsInput');
    const servingsValueDisplay = document.getElementById('servingsValueDisplay');
    const decreaseServingsBtn = document.getElementById('decreaseServingsBtn');
    const increaseServingsBtn = document.getElementById('increaseServingsBtn');

    const updatePreview = () => {
        const val = parseFloat(servingsInput.value) || 1;
        servingsValueDisplay.textContent = `${val.toFixed(1)} serving${val !== 1 ? 's' : ''}`;
        
        if (state.selectedFoodForModal) {
            const food = state.selectedFoodForModal;
            document.getElementById('previewCalories').textContent = Math.round(food.calories * val);
            document.getElementById('previewProtein').textContent = `${(food.protein * val).toFixed(1)}g`;
            document.getElementById('previewCarbs').textContent = `${(food.carbs * val).toFixed(1)}g`;
            document.getElementById('previewFats').textContent = `${(food.fats * val).toFixed(1)}g`;
        }
    };

    servingsInput.addEventListener('input', updatePreview);
    decreaseServingsBtn.addEventListener('click', () => {
        let val = parseFloat(servingsInput.value) || 1;
        if (val > 0.1) {
            servingsInput.value = (val - 0.1).toFixed(1);
            updatePreview();
        }
    });
    increaseServingsBtn.addEventListener('click', () => {
        let val = parseFloat(servingsInput.value) || 1;
        if (val < 20) {
            servingsInput.value = (val + 0.1).toFixed(1);
            updatePreview();
        }
    });
}

// Modal Helpers
function openModal(modal, callback) {
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('modal-active');
        if (callback) callback();
    }, 10);
}

function closeModal(modal) {
    modal.classList.remove('modal-active');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Populate Goal Form with current values
function populateGoalForm() {
    document.getElementById('goalCalories').value = state.goals.calories;
    document.getElementById('goalProtein').value = state.goals.protein;
    document.getElementById('goalCarbs').value = state.goals.carbs;
    document.getElementById('goalFats').value = state.goals.fats;
    document.getElementById('goalWater').value = state.goals.water;
}

// Handle Goal Form Submit
function handleGoalFormSubmit(e) {
    e.preventDefault();
    state.goals = {
        calories: parseInt(document.getElementById('goalCalories').value),
        protein: parseFloat(document.getElementById('goalProtein').value),
        carbs: parseFloat(document.getElementById('goalCarbs').value),
        fats: parseFloat(document.getElementById('goalFats').value),
        water: parseInt(document.getElementById('goalWater').value)
    };
    saveStateToLocalStorage();
    closeModal(goalModal);
    renderAll();
}

// Handle Custom Food Form Submit
function handleCustomFoodFormSubmit(e) {
    e.preventDefault();
    const newFood = {
        id: 'custom_' + Date.now(),
        name: document.getElementById('customFoodName').value,
        category: document.getElementById('customFoodCategory').value,
        calories: parseInt(document.getElementById('customFoodCalories').value),
        protein: parseFloat(document.getElementById('customFoodProtein').value),
        carbs: parseFloat(document.getElementById('customFoodCarbs').value),
        fats: parseFloat(document.getElementById('customFoodFats').value),
        serving: document.getElementById('customFoodServing').value,
        isCustom: true
    };

    state.customFoods.push(newFood);
    saveStateToLocalStorage();
    customFoodForm.reset();
    closeModal(customFoodModal);
    renderFoodDatabase();
}

// Open Add Food Modal
function openAddFoodModal(food) {
    state.selectedFoodForModal = food;
    
    document.getElementById('modalFoodName').textContent = food.name;
    document.getElementById('modalFoodServing').textContent = `Serving: ${food.serving}`;
    document.getElementById('modalFoodBaseCalories').textContent = `${food.calories} kcal`;
    document.getElementById('modalFoodBaseProtein').textContent = `${food.protein}g`;
    document.getElementById('modalFoodBaseCarbs').textContent = `${food.carbs}g`;
    document.getElementById('modalFoodBaseFats').textContent = `${food.fats}g`;

    // Reset servings input
    const servingsInput = document.getElementById('servingsInput');
    servingsInput.value = '1';
    document.getElementById('servingsValueDisplay').textContent = '1.0 serving';

    // Set initial preview
    document.getElementById('previewCalories').textContent = food.calories;
    document.getElementById('previewProtein').textContent = `${food.protein}g`;
    document.getElementById('previewCarbs').textContent = `${food.carbs}g`;
    document.getElementById('previewFats').textContent = `${food.fats}g`;

    openModal(addFoodModal);
}

// Handle Add Food Form Submit
function handleAddFoodFormSubmit(e) {
    e.preventDefault();
    if (!state.selectedFoodForModal) return;

    const mealType = document.querySelector('input[name="mealType"]:checked').value;
    const servings = parseFloat(document.getElementById('servingsInput').value) || 1;
    const food = state.selectedFoodForModal;

    const loggedItem = {
        id: 'logged_' + Date.now(),
        foodId: food.id,
        name: food.name,
        calories: Math.round(food.calories * servings),
        protein: parseFloat((food.protein * servings).toFixed(1)),
        carbs: parseFloat((food.carbs * servings).toFixed(1)),
        fats: parseFloat((food.fats * servings).toFixed(1)),
        servings: servings,
        servingUnit: food.serving
    };

    const log = getCurrentDateLog();
    log.meals[mealType].push(loggedItem);
    
    saveStateToLocalStorage();
    closeModal(addFoodModal);
    renderAll();
}

// Delete Logged Food Item
function deleteLoggedItem(mealType, itemId) {
    const log = getCurrentDateLog();
    log.meals[mealType] = log.meals[mealType].filter(item => item.id !== itemId);
    saveStateToLocalStorage();
    renderAll();
}

// Initialize Chart.js
function initChart() {
    const ctx = document.getElementById('macroChart').getContext('2d');
    macroChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fats'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw}g`;
                        }
                    }
                }
            },
            cutout: '75%'
        }
    });
}

// Render Everything
function renderAll() {
    renderDashboard();
    renderMeals();
    renderFoodDatabase();
    renderWaterTracker();
}

// Render Dashboard Stats & Charts
function renderDashboard() {
    const log = getCurrentDateLog();
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    Object.keys(log.meals).forEach(mealType => {
        log.meals[mealType].forEach(item => {
            totalCalories += item.calories;
            totalProtein += item.protein;
            totalCarbs += item.carbs;
            totalFats += item.fats;
        });
    });

    // Round values
    totalProtein = parseFloat(totalProtein.toFixed(1));
    totalCarbs = parseFloat(totalCarbs.toFixed(1));
    totalFats = parseFloat(totalFats.toFixed(1));

    // Update Calorie Ring
    const remaining = Math.max(0, state.goals.calories - totalCalories);
    document.getElementById('remainingCalories').textContent = remaining;
    document.getElementById('targetCalorieText').textContent = `${state.goals.calories.toLocaleString()} kcal`;
    document.getElementById('consumedCalorieText').textContent = `${totalCalories.toLocaleString()} kcal`;

    // Update SVG Circle Progress
    const circle = document.getElementById('calorieProgressCircle');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const percent = Math.min(100, (totalCalories / state.goals.calories) * 100);
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Update Status Indicator
    const statusDot = document.getElementById('statusIndicatorDot');
    const statusLabel = document.getElementById('statusIndicatorLabel');
    const statusText = document.getElementById('statusIndicatorText');

    if (totalCalories > state.goals.calories) {
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
        statusText.className = 'text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md';
        statusText.textContent = 'Over Goal';
    } else if (totalCalories >= state.goals.calories * 0.9) {
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
        statusText.className = 'text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md';
        statusText.textContent = 'Near Goal';
    } else {
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
        statusText.className = 'text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md';
        statusText.textContent = 'On Track';
    }

    // Update Macro Progress Bars
    const proteinPercent = Math.min(100, (totalProtein / state.goals.protein) * 100);
    document.getElementById('proteinProgressBar').style.width = `${proteinPercent}%`;
    document.getElementById('proteinProgressText').textContent = `${totalProtein}g / ${state.goals.protein}g`;

    const carbsPercent = Math.min(100, (totalCarbs / state.goals.carbs) * 100);
    document.getElementById('carbsProgressBar').style.width = `${carbsPercent}%`;
    document.getElementById('carbsProgressText').textContent = `${totalCarbs}g / ${state.goals.carbs}g`;

    const fatsPercent = Math.min(100, (totalFats / state.goals.fats) * 100);
    document.getElementById('fatsProgressBar').style.width = `${fatsPercent}%`;
    document.getElementById('fatsProgressText').textContent = `${totalFats}g / ${state.goals.fats}g`;

    // Update Chart.js
    if (macroChartInstance) {
        macroChartInstance.data.datasets[0].data = [totalProtein, totalCarbs, totalFats];
        macroChartInstance.update();
    }
}

// Render Logged Meals
function renderMeals() {
    const log = getCurrentDateLog();
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

    mealTypes.forEach(mealType => {
        const listContainer = document.getElementById(`${mealType}List`);
        const countContainer = document.getElementById(`${mealType}Count`);
        const caloriesContainer = document.getElementById(`${mealType}Calories`);
        const items = log.meals[mealType];

        // Update count and calories
        const totalMealCalories = items.reduce((sum, item) => sum + item.calories, 0);
        countContainer.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
        caloriesContainer.textContent = `${totalMealCalories} kcal`;

        if (items.length === 0) {
            listContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-3 italic">No items logged for ${mealType} yet.</p>`;
            return;
        }

        listContainer.innerHTML = items.map(item => `
            <div class="flex items-center justify-between py-2.5 group">
                <div class="flex-1 min-w-0 pr-4">
                    <div class="flex items-baseline space-x-1.5">
                        <h4 class="text-sm font-bold text-slate-700 truncate">${item.name}</h4>
                        <span class="text-[10px] font-semibold text-slate-400">x${item.servings}</span>
                    </div>
                    <div class="flex space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>${item.calories} kcal</span>
                        <span>•</span>
                        <span>P: ${item.protein}g</span>
                        <span>•</span>
                        <span>C: ${item.carbs}g</span>
                        <span>•</span>
                        <span>F: ${item.fats}g</span>
                    </div>
                </div>
                <button onclick="deleteLoggedItem('${mealType}', '${item.id}')" class="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');

        // Re-initialize icons for newly added delete buttons
        lucide.createIcons();
    });
}

// Render Food Database
function renderFoodDatabase() {
    const combinedDatabase = [...state.customFoods, ...INDIAN_FOOD_DATABASE];
    
    // Filter database
    const filtered = combinedDatabase.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(state.searchQuery);
        const matchesCategory = state.activeCategory === 'all' || 
            (state.activeCategory === 'Custom' && food.isCustom) ||
            food.category === state.activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        foodDatabaseList.innerHTML = `
            <div class="col-span-full text-center py-8 text-slate-400">
                <i data-lucide="search-code" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
                <p class="text-sm font-semibold">No food items found</p>
                <p class="text-xs mt-1">Try searching for something else or create a custom food item.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    foodDatabaseList.innerHTML = filtered.map(food => `
        <div class="bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-white rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group relative hover:shadow-md hover:shadow-slate-100">
            ${food.isCustom ? '<span class="absolute top-2.5 right-2.5 text-[9px] font-extrabold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Custom</span>' : ''}
            <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${food.category}</span>
                <h4 class="font-bold text-slate-800 text-sm mt-0.5 truncate pr-12">${food.name}</h4>
                <p class="text-xs text-slate-400 mt-0.5">Serving: ${food.serving}</p>
            </div>
            
            <div class="mt-4 pt-3 border-t border-slate-200/40 flex items-center justify-between">
                <div>
                    <span class="text-base font-extrabold text-slate-700">${food.calories}</span>
                    <span class="text-[10px] font-bold text-slate-400"> kcal</span>
                </div>
                <div class="flex space-x-2 text-[10px] font-bold text-slate-500">
                    <span title="Protein">P: <span class="text-emerald-600">${food.protein}g</span></span>
                    <span title="Carbs">C: <span class="text-amber-600">${food.carbs}g</span></span>
                    <span title="Fats">F: <span class="text-rose-600">${food.fats}g</span></span>
                </div>
                <button onclick="handleFoodAddClick('${food.id}')" class="p-1.5 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded-xl transition-all duration-200 shadow-sm">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Handle Food Add Click from Database
function handleFoodAddClick(foodId) {
    const combinedDatabase = [...state.customFoods, ...INDIAN_FOOD_DATABASE];
    const food = combinedDatabase.find(f => f.id === foodId);
    if (food) {
        openAddFoodModal(food);
    }
}

// Render Water Tracker
function renderWaterTracker() {
    const log = getCurrentDateLog();
    const waterGoal = state.goals.water;
    const currentWater = log.water;

    // Update text and progress bar
    waterCountText.textContent = `${currentWater} / ${waterGoal} glass${waterGoal !== 1 ? 'es' : ''}`;
    const percent = Math.min(100, (currentWater / waterGoal) * 100);
    waterLiquidBar.style.width = `${percent}%`;

    // Render interactive glasses
    let glassesHTML = '';
    const totalGlassesToShow = Math.max(waterGoal, currentWater, 8);

    for (let i = 1; i <= totalGlassesToShow; i++) {
        const isFilled = i <= currentWater;
        glassesHTML += `
            <button onclick="toggleWaterGlass(${i})" class="water-glass ${isFilled ? 'filled' : ''}" title="Glass ${i}">
                <i data-lucide="droplet" class="w-5 h-5 ${isFilled ? 'fill-blue-500' : ''}"></i>
            </button>
        `;
    }

    waterGlassesGrid.innerHTML = glassesHTML;
    lucide.createIcons();
}

// Toggle Water Glass Click
function toggleWaterGlass(index) {
    const log = getCurrentDateLog();
    if (log.water >= index) {
        log.water = index - 1;
    } else {
        log.water = index;
    }
    saveStateToLocalStorage();
    renderWaterTracker();
}