import React from 'react';
import { AirQualityMetrics } from '../types';
import { Clock, RotateCw, Wind, Activity } from 'lucide-react';
import { ForecastStrip } from './subcomponents/ForecastStrip';

interface HeroAqiDisplayProps {
  metrics: AirQualityMetrics;
  onRefresh?: () => void;
  isLoading?: boolean;
}

/**
 * Hero Atmospheric Telemetry Display
 * @description Primary CPCB Indian NAQI gauge, dominant pollutant, and 4-hour forecast strip
 */
export const HeroAqiDisplay: React.FC<HeroAqiDisplayProps> = ({
  metrics,
  onRefresh,
  isLoading,
}) => {
  // Official Indian CPCB NAQI Color & Semantic Mapping
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Good':
        return {
          pill: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          ring: 'ring-emerald-400/30',
          beacon: 'bg-emerald-500 ring-emerald-500/20',
          text: 'text-emerald-900',
          bar: 'bg-emerald-600',
          border: 'border-l-emerald-600',
        };
      case 'Satisfactory':
        return {
          pill: 'bg-lime-50 text-lime-950 border-lime-300',
          ring: 'ring-lime-400/30',
          beacon: 'bg-lime-500 ring-lime-500/20',
          text: 'text-lime-900',
          bar: 'bg-lime-600',
          border: 'border-l-lime-600',
        };
      case 'Moderate':
        return {
          pill: 'bg-yellow-50 text-yellow-950 border-yellow-300',
          ring: 'ring-yellow-400/30',
          beacon: 'bg-yellow-500 ring-yellow-500/20',
          text: 'text-yellow-900',
          bar: 'bg-yellow-600',
          border: 'border-l-yellow-600',
        };
      case 'Poor':
        return {
          pill: 'bg-orange-50 text-orange-950 border-orange-300',
          ring: 'ring-orange-400/30',
          beacon: 'bg-orange-500 ring-orange-500/20',
          text: 'text-orange-900',
          bar: 'bg-orange-600',
          border: 'border-l-orange-600',
        };
      case 'Very Poor':
        return {
          pill: 'bg-red-50 text-red-950 border-red-300',
          ring: 'ring-red-400/30',
          beacon: 'bg-red-600 ring-red-600/20',
          text: 'text-red-900',
          bar: 'bg-red-700',
          border: 'border-l-red-600',
        };
      case 'Severe':
      default:
        return {
          pill: 'bg-stone-900 text-rose-300 border-rose-900',
          ring: 'ring-rose-900/40',
          beacon: 'bg-rose-700 ring-rose-700/30',
          text: 'text-rose-700',
          bar: 'bg-rose-900',
          border: 'border-l-rose-800',
        };
    }
  };

  const getPm10BarColor = (pm10: number) => {
    if (pm10 <= 50) return 'bg-emerald-600';
    if (pm10 <= 100) return 'bg-lime-600';
    if (pm10 <= 250) return 'bg-yellow-600';
    if (pm10 <= 350) return 'bg-orange-600';
    if (pm10 <= 430) return 'bg-red-700';
    return 'bg-rose-900';
  };

  const theme = getCategoryTheme(metrics.category);
  const isSevere = metrics.aqi >= 300;

  return (
    <div className={`bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 lg:p-8 mb-8 relative overflow-hidden ring-1 ${theme.ring}`}>
      {/* Top Header Strip: Dynamic Station & Severity Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ring-4 ${theme.beacon} animate-pulse`} aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Verified Continuous Monitoring Telemetry
            </h3>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-800 border border-stone-200">
              {metrics.scale}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium">
            <span className="text-stone-600">CAAQMS Station:</span>
            <strong className="text-stone-900 font-serif">{metrics.stationName}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
            <span>Updated: {new Date(metrics.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh continuous telemetry data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-950 active:scale-95 transition-all border border-stone-200/90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <RotateCw className={`w-3.5 h-3.5 text-stone-600 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} aria-hidden="true" />
              <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Air Quality Impact Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-5 items-center">
        {/* Large AQI Gauge Presentation (Col 1-5) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
            <span className="text-5xl sm:text-6xl lg:text-7xl font-serif font-black text-stone-950 tracking-tighter tabular-nums">
              {metrics.aqi}
            </span>
            <div className="space-y-1">
              <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-stone-600 block">
                NAQI (CPCB)
              </span>
              <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${theme.pill}`}>
                {metrics.category}
              </span>
            </div>
          </div>

          {metrics.usEpaAqi && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-600">
                US EPA Scale Equivalent:
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                {metrics.usEpaAqi} AQI (US)
              </span>
            </div>
          )}

          {/* Editorial Public Health Impact Notice */}
          <div className={`mt-3.5 p-3 rounded-r-xl border-l-4 bg-stone-50/90 ${theme.border}`}>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {metrics.category === 'Good' && 'Air quality is considered satisfactory, and air pollution poses little or no risk.'}
              {metrics.category === 'Satisfactory' && 'Minor breathing discomfort to sensitive people; safe for general outdoor activities.'}
              {metrics.category === 'Moderate' && 'Breathing discomfort to people with asthma and lung ailments. Limit prolonged exertion.'}
              {metrics.category === 'Poor' && 'Breathing discomfort to most people on prolonged exposure. Protect children and elderly.'}
              {metrics.category === 'Very Poor' && 'Respiratory illness on prolonged exposure. Limit all non-essential outdoor travel.'}
              {metrics.category === 'Severe' && 'Emergency atmospheric condition. Healthy people experience respiratory symptoms. Outdoor aerobic exercise is hazardous.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-6 text-xs">
            <div>
              <span className="text-stone-600 text-[11px] block font-medium">Primary Hazard</span>
              <span className="font-bold text-stone-900">{metrics.dominantPollutant}</span>
            </div>
            <div>
              <span className="text-stone-600 text-[11px] block font-medium">Scale Authority</span>
              <span className="font-bold text-stone-900">CPCB India (MoEFCC)</span>
            </div>
          </div>
        </div>

        {/* Real Particulate Measurements & Calibrated Benchmarks (Col 6-12) */}
        <div className="lg:col-span-7 bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-stone-200/80 space-y-5">
          {/* PM2.5 Calibrated Bar */}
          <div>
            <div className="flex justify-between items-baseline mb-1 text-xs">
              <span className="font-bold text-stone-800">PM2.5 (Fine Respirable Particles &lt;2.5µm)</span>
              <span className="font-mono font-bold text-sm text-stone-900">{metrics.pm25} µg/m³</span>
            </div>
            <div className="w-full bg-stone-200/90 h-3 rounded-full overflow-hidden relative">
              {/* Calibrated Safe Standard Marker (60 µg/m³ / 250 µg/m³ = 24%) */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-stone-500/80 z-10"
                style={{ left: '24%' }}
                title="CPCB 24h Safe Standard: 60 µg/m³"
              />
              <div
                className={`h-full rounded-full transition-all duration-700 ${theme.bar}`}
                style={{ width: `${Math.min(100, (metrics.pm25 / 250) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-stone-600 mt-1.5 font-medium">
              <span>CPCB Safe Standard: <strong className="text-stone-800">60 µg/m³</strong> (marked)</span>
              <span className="text-stone-700 font-semibold">
                {metrics.pm25 <= 60
                  ? 'Within CPCB safe limit'
                  : `${(metrics.pm25 / 60).toFixed(1)}x over national standard`}
              </span>
            </div>
          </div>

          {/* PM10 Calibrated Bar */}
          <div>
            <div className="flex justify-between items-baseline mb-1 text-xs">
              <span className="font-bold text-stone-800">PM10 (Coarse Inhalable Particulate Matter)</span>
              <span className="font-mono font-bold text-sm text-stone-900">{metrics.pm10} µg/m³</span>
            </div>
            <div className="w-full bg-stone-200/90 h-3 rounded-full overflow-hidden relative">
              {/* Calibrated Safe Standard Marker (100 µg/m³ / 350 µg/m³ = 28.6%) */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-stone-500/80 z-10"
                style={{ left: '28.6%' }}
                title="CPCB 24h Safe Standard: 100 µg/m³"
              />
              <div
                className={`h-full rounded-full transition-all duration-700 ${getPm10BarColor(metrics.pm10)}`}
                style={{ width: `${Math.min(100, (metrics.pm10 / 350) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-stone-600 mt-1.5 font-medium">
              <span>CPCB Safe Standard: <strong className="text-stone-800">100 µg/m³</strong> (marked)</span>
              <span className="text-stone-700 font-semibold">
                {metrics.pm10 <= 100
                  ? 'Within CPCB safe limit'
                  : `${(metrics.pm10 / 100).toFixed(1)}x over standard`}
              </span>
            </div>
          </div>

          {/* Environmental Atmospheric & Lifestyle Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-colors">
              <div className="text-[11px] font-semibold text-stone-600">NO2 (Vehicular)</div>
              <div className="text-xs font-bold text-stone-900 mt-0.5">{metrics.no2 ? `${metrics.no2} µg/m³` : 'Standard'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-colors">
              <div className="text-[11px] font-semibold text-stone-600">Ozone (O3)</div>
              <div className="text-xs font-bold text-stone-900 mt-0.5">{metrics.o3 ? `${metrics.o3} µg/m³` : 'Normal'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                <Wind className="w-3 h-3 text-stone-500" aria-hidden="true" />
                <span>Inversion Trap</span>
              </div>
              <div className="text-xs font-bold text-stone-900 mt-0.5">{isSevere ? 'Severe Trapping' : 'Circulating'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                <Activity className="w-3 h-3 text-stone-500" aria-hidden="true" />
                <span>Outdoor Jogging</span>
              </div>
              <div
                className={`text-xs font-bold mt-0.5 ${
                  metrics.aqi <= 100
                    ? 'text-emerald-800'
                    : metrics.aqi <= 200
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {metrics.aqi <= 100 ? 'Safe Window' : metrics.aqi <= 200 ? 'Light Caution' : 'Not Advised'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {metrics.forecast && <ForecastStrip forecast={metrics.forecast} />}
    </div>
  );
};
