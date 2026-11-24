import React from 'react';
import { AirQualityMetrics } from '../types';
import { Clock, CheckCircle2 } from 'lucide-react';

interface LiveAqiCardProps {
  metrics: AirQualityMetrics;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const LiveAqiCard: React.FC<LiveAqiCardProps> = ({
  metrics,
  onRefresh,
  isLoading,
}) => {
  const getBadgeColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (aqi <= 100) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    if (aqi <= 150) return 'bg-amber-50 text-amber-900 border-amber-300';
    if (aqi <= 200) return 'bg-red-50 text-red-900 border-red-300';
    if (aqi <= 300) return 'bg-purple-50 text-purple-950 border-purple-300';
    return 'bg-rose-950 text-rose-50 border-rose-900';
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-stone-500">
              Verified Atmospheric Monitoring
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
              Live Copernicus Model
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Station: <span className="text-stone-800 font-medium">{metrics.source}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(metrics.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-stone-600 hover:text-stone-900 underline text-xs disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Main AQI Visual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5">
        {/* Index Display */}
        <div className="md:col-span-1 border-r border-stone-100 pr-4">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            US EPA Air Quality Index
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-5xl font-serif font-bold text-stone-900 tracking-tight">
              {metrics.aqi}
            </span>
            <span className="text-xs text-stone-500 font-medium">AQI</span>
          </div>
          <div className={`mt-2 inline-block px-2.5 py-1 rounded text-xs font-semibold border ${getBadgeColor(metrics.aqi)}`}>
            {metrics.category}
          </div>
        </div>

        {/* Particulate breakdown */}
        <div className="md:col-span-3 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700">PM2.5 Concentration (Fine Particulates)</span>
              <span className="font-mono font-medium text-stone-900">{metrics.pm25} µg/m³</span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.pm25 > 150 ? 'bg-red-700' : metrics.pm25 > 60 ? 'bg-amber-600' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (metrics.pm25 / 250) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              WHO 24-hr guideline: <span className="font-semibold">15 µg/m³</span> (Current is {(metrics.pm25 / 15).toFixed(1)}x over guideline)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-2.5 rounded bg-stone-50 border border-stone-100">
              <div className="text-[11px] text-stone-500 font-medium">PM10 (Coarse)</div>
              <div className="text-sm font-semibold text-stone-800">{metrics.pm10} µg/m³</div>
            </div>
            <div className="p-2.5 rounded bg-stone-50 border border-stone-100">
              <div className="text-[11px] text-stone-500 font-medium">Primary Pollutant</div>
              <div className="text-xs font-semibold text-stone-800 truncate">{metrics.dominantPollutant}</div>
            </div>
            <div className="p-2.5 rounded bg-stone-50 border border-stone-100 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-stone-500 font-medium">Atmospheric Inversion</div>
              <div className="text-xs font-semibold text-stone-800">
                {metrics.aqi > 200 ? 'Severe trapping layer' : 'Standard dispersal'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly forecast mini-strip */}
      {metrics.forecast && metrics.forecast.length > 0 && (
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="text-xs font-semibold text-stone-600 mb-2.5">
            Diurnal Forecast & Smog Trap Curve:
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {metrics.forecast.map((fc, idx) => (
              <div
                key={idx}
                className="p-2 rounded border border-stone-100 bg-[#FAF8F5] text-center"
              >
                <div className="text-[10px] font-semibold text-stone-500 uppercase">{fc.time}</div>
                <div className="text-sm font-serif font-bold text-stone-900 my-0.5">{fc.aqi}</div>
                <div className="text-[9px] text-stone-600 truncate">{fc.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
