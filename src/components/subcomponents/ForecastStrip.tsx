import React from 'react';
import { AirQualityMetrics } from '../../types';

interface ForecastStripProps {
  forecast: NonNullable<AirQualityMetrics['forecast']>;
}

/**
 * Diurnal Smog Forecast & Outdoor Safety Windows Strip
 * @description Renders 4-hour forward atmospheric telemetry windows
 */
export const ForecastStrip: React.FC<ForecastStripProps> = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
          Diurnal Smog Forecast &amp; Outdoor Safety Windows
        </span>
        <span className="text-[11px] font-medium text-stone-600">
          Model: Copernicus Atmospheric Telemetry
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {forecast.map((fc, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-stone-200/90 bg-[#FAF8F5] flex flex-col justify-between hover:border-stone-300 hover:shadow-xs transition-all"
          >
            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase">{fc.time}</div>
              <div className="text-lg font-serif font-black text-stone-950 my-0.5 tabular-nums">{fc.aqi}</div>
              <div className="text-[10px] font-medium text-stone-800 truncate">{fc.category}</div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-stone-200/60">
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  fc.isSafeForOutdoorExercise
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {fc.isSafeForOutdoorExercise ? 'Safe Window' : 'Inversion Trap'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
