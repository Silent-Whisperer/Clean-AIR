import React from 'react';
import { Wind, Shield, Users, Clock, Leaf, Map, MessageSquare, Settings } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'planner' | 'stations' | 'coach' | 'alternatives' | 'community' | 'assistant';
  onSelectTab: (tab: 'dashboard' | 'planner' | 'stations' | 'coach' | 'alternatives' | 'community' | 'assistant') => void;
  onOpenSettings: () => void;
  stationName?: string;
  aqi?: number;
}

/**
 * Primary Application Navigation Bar
 * @description Sticky desktop header and mobile bottom navigation with live NAQI status pill
 */
export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  stationName,
  aqi,
}) => {
  const allTabs = [
    { id: 'dashboard', label: 'Air Intelligence', icon: Shield },
    { id: 'planner', label: 'Smart Daily Planner', icon: Clock },
    { id: 'stations', label: 'Locate & Explore Stations', icon: Map },
    { id: 'coach', label: 'Indoor Air Coach', icon: Wind },
    { id: 'alternatives', label: 'Sustainable Commute', icon: Leaf },
    { id: 'community', label: 'Community Smog Action', icon: Users },
    { id: 'assistant', label: 'Health Assistant', icon: MessageSquare },
  ] as const;

  const mobileBottomTabs = [
    { id: 'dashboard', label: 'Air Intel', icon: Shield },
    { id: 'planner', label: 'Planner', icon: Clock },
    { id: 'stations', label: 'Stations', icon: Map },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'assistant', label: 'Assistant', icon: MessageSquare },
  ] as const;

  return (
    <>
      <header className="border-b border-stone-200/90 bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Name */}
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              aria-label="ClearAir Home"
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer py-1 text-left"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-900 flex items-center justify-center text-white font-serif font-black shadow-xs shrink-0">
                C
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-stone-900">
                    ClearAir
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                    CPCB NAQI
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  Severe winter smog & environmental health intelligence
                </p>
              </div>
            </button>

            {/* Quick status pill & preferences button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {aqi !== undefined && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-stone-200 text-xs shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span className="font-medium text-stone-600 truncate max-w-[90px] sm:max-w-[150px]">
                    {stationName || 'Monitoring'}
                  </span>
                  <span className="font-serif font-bold text-stone-900 shrink-0">
                    {aqi} NAQI
                  </span>
                </div>
              )}

              <button
                onClick={onOpenSettings}
                aria-label="Open Household Profile Settings"
                className="min-h-[38px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 active:scale-95 transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 sm:hidden text-stone-500" />
                <span className="hidden sm:inline">Household Profile</span>
                <span className="sm:hidden">Profile</span>
              </button>
            </div>
          </div>

          {/* Product Navigation Bar - Scrollable tabs on mobile, full width */}
          <nav
            aria-label="Main Navigation Tabs"
            className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-medium border-t border-stone-200/60 pt-2 -mx-3 px-3 sm:mx-0 sm:px-0"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                    isActive
                      ? 'bg-stone-900 text-white font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Optimized for One-Handed Thumb Reach) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-1 px-2 flex justify-around items-center shadow-lg safe-bottom"
      >
        {mobileBottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[46px] py-1 px-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-emerald-950 bg-emerald-50/80 font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-800' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
