import React from 'react';
import { MonitoringStation } from '../../types';
import { ExternalLink, Check, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface StationDetailCardProps {
  station: MonitoringStation | null;
  justActivated: string | null;
  onActivate: (station: MonitoringStation) => void;
  onViewDashboard?: () => void;
}

/**
 * Station Detail & Telemetry Inspection Panel
 * @description Displays CPCB/State PCB station metrics, traceability, and activation controls
 */
export const StationDetailCard: React.FC<StationDetailCardProps> = ({
  station,
  justActivated,
  onActivate,
  onViewDashboard,
}) => {
  if (!station) {
    return (
      <div className="lg:col-span-7 bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200 flex items-center justify-center text-xs text-stone-500">
        Select a monitoring station from the list to inspect real-time telemetry.
      </div>
    );
  }

  return (
    <div className="lg:col-span-7 bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200 flex flex-col justify-between">
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
              {station.agency}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {station.latitude}°N, {station.longitude}°E
            </span>
          </div>

          <h3 className="text-xl font-serif font-bold text-stone-900 mt-2">
            {station.name}
          </h3>
          <p className="text-xs text-stone-600">
            Official Continuous Ambient Air Quality Station in {station.city}, {station.state}.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[11px] text-stone-500 block font-medium">Indian NAQI</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
              {station.aqi}
            </span>
            <span className="text-[10px] font-semibold text-stone-700">{station.category}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[11px] text-stone-500 block font-medium">PM2.5 (Fine)</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
              {station.pm25}
            </span>
            <span className="text-[10px] text-stone-500">µg/m³ (CPCB Limit: 60)</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 col-span-2 sm:col-span-1 shadow-2xs">
            <span className="text-[11px] text-stone-500 block font-medium">PM10 (Coarse)</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
              {station.pm10}
            </span>
            <span className="text-[10px] text-stone-500">µg/m³ (CPCB Limit: 100)</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Station Data Quality & Traceability</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            This station feeds telemetry directly to the Central Pollution Control Board (CPCB) national portal using automated beta-attenuation particulate mass monitors.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://cpcb.nic.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 underline"
          >
            <span>View CPCB Central Air Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onActivate(station)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                justActivated === station.id
                  ? 'bg-emerald-800 text-white ring-2 ring-emerald-400'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {justActivated === station.id ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>✓ Active Monitored Station</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Set As Active Station</span>
                </>
              )}
            </button>

            {onViewDashboard && (
              <button
                type="button"
                onClick={onViewDashboard}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
