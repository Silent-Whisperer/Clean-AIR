import React from 'react';

/**
 * Editorial Public Health Footer Component
 */
export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 bg-white py-8 mt-12 text-xs text-stone-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-serif font-black text-stone-900">ClearAir</span> — Severe Smog & Public Health Technology Platform.
          <span className="block sm:inline sm:ml-2 text-stone-400">
            Telemetry powered by CPCB CAAQMS & Copernicus Atmospheric Monitoring.
          </span>
        </div>

        <div className="flex items-center gap-4 text-stone-400">
          <span>CPCB NAQI Standards</span>
          <span>•</span>
          <span>Zero Data Fabrication</span>
        </div>
      </div>
    </footer>
  );
};
