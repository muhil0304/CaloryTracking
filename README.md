# CaloRoti 🍛 — Indian Food Calorie Tracker

CaloRoti is a sleek, modern, single-page React application designed specifically for tracking calories and macronutrients based on popular Indian foods. Built with a vibrant food-themed glassmorphism UI, it features a comprehensive pre-populated database of classic Indian dishes, dynamic serving size adjustments, and persistent local storage.

## Features

1. **Rich Indian Food Database**: 30+ pre-populated popular Indian dishes (Biryani, Paneer Butter Masala, Roti, Dal Tadka, Idli, Dosa, Samosa, etc.) with accurate calorie, protein, carb, and fat details.
2. **Search & Category Filters**: Easily filter foods by category (Breakfast, Main Course, Snacks, Desserts) or search by name.
3. **Dynamic Daily Log**: Log meals across Breakfast, Lunch, Dinner, and Snacks. Adjust serving sizes dynamically with instant calorie and macronutrient recalculations.
4. **Interactive Dashboard**:
   - Beautiful SVG circular progress ring for daily calorie goal.
   - Real-time remaining calorie counter.
   - Macronutrient breakdown (Carbs, Protein, Fat) with progress bars and percentage targets.
5. **Custom Food Creator**: Add your own custom recipes or foods to the database with custom serving units and macronutrients.
6. **LocalStorage Persistence**: All logs, custom foods, and daily calorie goals are saved automatically and persist across browser reloads.
7. **Delightful Celebrations**: Triggers a confetti explosion when you hit or stay within your daily calorie goal!
8. **Responsive Glassmorphism Design**: Optimized for both mobile and desktop screens with smooth transitions and touch-friendly targets.

## Tech Stack

- **React 19**: Modern component architecture and state management.
- **Vite 6**: Ultra-fast development server and build tool.
- **TypeScript**: Strict type safety.
- **Tailwind CSS**: Utility-first styling with custom glassmorphism and warm food-themed gradients.
- **Lucide React**: Clean, modern iconography.
- **Canvas Confetti**: Delightful goal-completion celebrations.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone or extract the project files.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To build the optimized production assets:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

## Architecture & State Flow

- **`App.tsx`**: Serves as the central state coordinator. It manages the daily log entries, custom foods list, and daily calorie goal.
- **`useLocalStorage`**: Custom hook that synchronizes state with the browser's `localStorage` seamlessly.
- **`indianFoods.ts`**: Static database of popular Indian foods.
- **`Dashboard.tsx`**: Renders the SVG progress ring and macronutrient progress bars.
- **`FoodSearch.tsx`**: Handles searching, filtering, and adding foods to the daily log.
- **`DailyLog.tsx`**: Displays logged meals, allows inline serving size adjustments, and item deletion.
- **`CustomFoodModal.tsx`**: Modal form to add custom foods to the user's database.