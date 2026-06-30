"use client";

import { useState } from "react";

type Tab = "map" | "detect" | "soil" | "stats";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isSeeding: boolean;
  onSeed: () => void;
}

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "map", label: "Outbreak Map", icon: "🗺️" },
  { id: "detect", label: "Disease Detection", icon: "🔬" },
  { id: "soil", label: "Soil Moisture", icon: "💧" },
  { id: "stats", label: "Analytics", icon: "📊" },
];

export default function Header({ activeTab, onTabChange, isSeeding, onSeed }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-lg border border-white/20">
              🌱
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">
                AgriCrop
              </h1>
              <p className="text-[10px] text-emerald-300 font-medium tracking-wider uppercase">
                Geospatial Disease Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-emerald-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSeed}
              disabled={isSeeding}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg transition border border-emerald-500 disabled:opacity-50 flex items-center gap-1"
            >
              {isSeeding ? (
                <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Seed Data
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-white/15 text-white"
                    : "text-emerald-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
