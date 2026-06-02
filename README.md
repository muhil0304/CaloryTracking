# CaloryTracking — Indian Food Calorie & Macro Tracker

CaloryTracking is a modern, highly responsive calorie and macronutrient tracking web application tailored specifically for Indian diets. 

Indian cuisine features unique portion sizes, ingredients, and preparation styles (e.g., rotis, dals, subzis, and rice-based dishes). Standard global tracking apps often lack accurate data for these items. This application features a pre-populated database of common Indian foods with precise calorie, protein, carbohydrate, and fat metrics. Users can set daily goals, log meals across categories (Breakfast, Lunch, Dinner, Snacks), adjust portion sizes, and visualize their daily intake using intuitive progress rings and charts.

---

## Features

- **Dashboard**: View daily calorie goal, total calories consumed, remaining calories, and macronutrient breakdown (protein, carbs, fat) with visual progress rings and bars.
- **Food Database**: Search, filter, and view Indian foods. Ability to add new custom foods to the database.
- **Meal Logging**: Log food consumption for different meal types (Breakfast, Lunch, Dinner, Snacks) with custom portion sizes (e.g., number of servings or grams).
- **Daily Logs**: View, edit, and delete logged meals for the current day or select previous days.
- **Goal Setting**: Set and update daily calorie and macronutrient goals.

---

## Tech Stack

### Backend
- **Node.js** (v20.x or later recommended)
- **TypeScript**
- **Express** - Fast, unopinionated web framework
- **sqlite3** - SQLite driver
- **sqlite** - Promise-based wrapper for sqlite3
- **cors** - Cross-Origin Resource Sharing middleware
- **dotenv** - Environment variable management

### Frontend
- **React** - UI Library
- **TypeScript**
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Clean, modern icon library

### Development & Tooling
- **concurrently** - Run backend and frontend simultaneously with a single command

---

## Getting Started

### Prerequisites
- **Node.js** (v18.x or later)
- **npm** (v9.x or later)

### Installation

1. Clone the repository or extract the files.
2. Install all dependencies for the root, backend, and frontend with a single command:
   ```bash
   npm run install-all
   ```

### Running the Application

To start both the backend server and the frontend development server concurrently, run:
```bash
npm run dev
```

This will start:
- The **Backend API** on [http://localhost:5000](http://localhost:5000)
- The **Frontend App** on [http://localhost:3000](http://localhost:3000)

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

---

## Database Seeding

On the first startup, the backend automatically creates an SQLite database file (`backend/calorie_tracker.db`) and seeds it with a comprehensive list of common Indian foods, including:
- Roti (Whole Wheat)
- White Basmati Rice
- Brown Rice
- Dal Tadka (Yellow Lentils)
- Paneer Butter Masala
- Chicken Tikka Masala
- Samosa
- Idli
- Masala Dosa
- Chicken Biryani
- Chole Bhature
- Aloo Paratha
- Gulab Jamun
- Tandoori Chicken
- Palak Paneer
- Mixed Vegetable Sabzi
- Masala Chai
- Mango Lassi
- Cucumber Raita
- Papad (Roasted)
- Upma
- Medhu Vada
- Butter Naan
- Moong Dal Halwa
- Fish Curry (Bengali Style)

---

## Architecture

The application is structured as a monorepo containing a decoupled backend and frontend, orchestrated from the root directory for a seamless developer experience.

```
.
├── .env.example                  # Environment variable template
├── package.json                  # Root package.json for concurrent execution
├── README.md                     # Setup and running instructions
├── backend/
│   ├── package.json              # Backend dependencies & scripts
│   ├── tsconfig.json             # Backend TypeScript configuration
│   └── src/
│       ├── db.ts                 # SQLite database initialization & seeding
│       ├── routes.ts             # Express API endpoints
│       └── server.ts             # Express server entry point
└── frontend/
    ├── index.html                # Vite HTML entry point
    ├── package.json              # Frontend dependencies & scripts
    ├── postcss.config.js         # PostCSS configuration
    ├── tailwind.config.js        # Tailwind CSS configuration
    ├── tsconfig.json             # Frontend TypeScript configuration
    ├── vite.config.ts            # Vite configuration (with backend proxy)
    └── src/
        ├── main.tsx              # React entry point
        ├── index.css             # Tailwind directives & global styles
        ├── types.ts              # Shared TypeScript interfaces
        ├── api.ts                # API client service
        ├── App.tsx               # App layout, navigation, and state
        └── components/
            ├── Dashboard.tsx     # Calorie & macro visualization
            ├── FoodDatabase.tsx  # Food search, filter, and custom food creation
            ├── MealLogger.tsx    # Meal logging, editing, and deletion
            └── GoalSettings.tsx  # Calorie & macro goal configuration
```