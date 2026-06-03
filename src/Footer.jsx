import React from 'react';
import { Apple, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto w-full order-last">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">AaharCal</span>
              <p className="text-xs text-slate-500 font-medium">Indian Food Calorie Tracker</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
            <a href="#privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact Us</a>
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Copyright & Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AaharCal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for a healthier lifestyle.
          </p>
        </div>
      </div>
    </footer>
  );
}