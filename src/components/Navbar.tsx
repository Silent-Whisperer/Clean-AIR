import React from 'react';
import { Wind, Shield, Users, Clock, Leaf, Map, MessageSquare } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'planner' | 'stations' | 'coach' | 'alternatives' | 'community' | 'assistant';
  onSelectTab: (tab: 'dashboard' | 'planner' | 'stations' | 'coach' | 'alternatives' | 'community' | 'assistant') => void;
  onOpenSettings: () => void;
  stationName?: string;
  aqi?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  stationName,
  aqi,
}) => {
  return (
    <header className="border-b border-stone-200/90 bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-emerald-900 flex items-center justify-center text-white font-serif font-black shadow-xs">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg tracking-tight text-stone-900">
                  ClearAir
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  CPCB NAQI Standard
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Severe winter smog & environmental health intelligence
              </p>
            </div>
          </div>

          {/* Quick status pill & preferences button */}
          <div className="flex items-center gap-3">
            {aqi !== undefined && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-medium text-stone-600 truncate max-w-[150px]">
                  {stationName || 'Monitoring'}
                </span>
                <span className="font-serif font-bold text-stone-900">
                  {aqi} NAQI
                </span>
              </div>
            )}

            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
            >
              Household Profile
            </button>
          </div>
        </div>

        {/* Product Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-medium border-t border-stone-200/60 pt-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-stone-900 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Air Intelligence
          </button>

          <button
            onClick={() => onSelectTab('planner')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'planner'
                ? 'bg-stone-900 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Smart Daily Planner
          </button>

          <button
            onClick={() => onSelectTab('stations')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'stations'
                ? 'bg-stone-900 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Locate & Explore Stations
          </button>

          <button
            onClick={() => onSelectTab('coach')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'coach'
                ? 'bg-stone-900 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            Indoor Air Coach
          </button>

          <button
            onClick={() => onSelectTab('alternatives')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'alternatives'
                ? 'bg-stone-900 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            Sustainable Commute
          </button>

          <button
            onClick={() => onSelectTab('community')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'bg-stone-900 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Community Smog Action
          </button>

          <button
            onClick={() => onSelectTab('assistant')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-stone-900 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            Health Assistant
          </button>
        </nav>
      </div>
    </header>
  );
};
