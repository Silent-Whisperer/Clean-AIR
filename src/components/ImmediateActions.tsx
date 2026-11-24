import React, { useState } from 'react';
import { SmartDailyAction } from '../types';
import { AlertCircle, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface ImmediateActionsProps {
  actions: SmartDailyAction[];
  engineUsed: string;
  isAiGenerated: boolean;
  onExploreTimeline: () => void;
}

export const ImmediateActions: React.FC<ImmediateActionsProps> = ({
  actions,
  engineUsed,
  isAiGenerated,
  onExploreTimeline,
}) => {
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const toggleActionDone = (id: string) => {
    setCompletedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="mb-10" aria-labelledby="top-actions-heading">
      {/* Editorial Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 id="top-actions-heading" className="text-2xl font-serif font-black text-stone-950 tracking-tight">
            What Should You Do Today?
          </h2>
          <p className="text-xs text-stone-700 mt-1 font-medium">
            Top 3 prioritized decisions tailored to your exact location, vulnerability profile, and commute.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-950 border border-emerald-300 font-semibold shadow-2xs flex items-center gap-1.5">
            <span>{isAiGenerated ? '✦ Grounded Gemini Agent' : '● CPCB Public Health Engine'}</span>
            <span className="text-emerald-700/60" aria-hidden="true">•</span>
            <span className="text-emerald-900 font-medium">{engineUsed}</span>
          </span>
        </div>
      </div>

      {/* 3-Column Equalized Action Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {actions.map((act, index) => {
          const isCritical = act.urgency === 'critical';
          const actionId = act.id || `action-${index}`;
          const isDone = !!completedIds[actionId];

          return (
            <div
              key={actionId}
              className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 h-full ${
                isDone
                  ? 'bg-stone-50/90 border-emerald-300 shadow-2xs opacity-90'
                  : isCritical
                  ? 'bg-white border-rose-300 shadow-sm ring-1 ring-rose-200/60 hover:shadow-md'
                  : 'bg-white border-stone-200/90 shadow-2xs hover:shadow-xs hover:border-stone-300'
              }`}
            >
              {/* Top Content: Priority Badge & Recommendation Copy */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200/80">
                    Priority {index + 1} • {act.timeframe}
                  </span>
                  {isCritical ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                      Critical Hazard
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className={`font-serif font-bold text-base leading-snug mb-2.5 ${isDone ? 'line-through text-stone-600' : 'text-stone-950'}`}>
                  {act.title}
                </h3>

                <p className="text-xs text-stone-800 leading-relaxed mb-4 font-medium flex-1">
                  {act.recommendation}
                </p>
              </div>

              {/* Bottom Metadata & Equalized Baselines */}
              <div className="mt-auto pt-4 border-t border-stone-100 space-y-2.5">
                {act.actionWindow && (
                  <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
                    <span>Action Window: <strong className="text-stone-900">{act.actionWindow}</strong></span>
                  </div>
                )}

                <div className="text-[11px] text-stone-700 leading-relaxed">
                  <strong className="text-stone-900 font-bold">Clinical Reasoning: </strong>
                  {act.rationale}
                </div>

                {act.tradeoffExplained && (
                  <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-[11px] text-amber-950">
                    <strong className="font-bold">Trade-off Examined: </strong>
                    {act.tradeoffExplained}
                  </div>
                )}

                {act.environmentalImpact?.co2eAvoidedKg && (
                  <div className="text-[11px] text-emerald-900 font-bold flex items-center gap-1.5 pt-1">
                    <span aria-hidden="true">🌱</span>
                    <span>Verified Avoidance: ~{act.environmentalImpact.co2eAvoidedKg} kg CO2e</span>
                  </div>
                )}

                {/* Tactile Action Completion Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => toggleActionDone(actionId)}
                    aria-pressed={isDone}
                    className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 active:scale-98 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/90'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-700' : 'text-stone-400'}`} aria-hidden="true" />
                    <span>{isDone ? 'Action Adopted in Daily Plan' : 'Mark as Planned Today'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Elevated Editorial Primary Call-to-Action */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onExploreTimeline}
          aria-label="View Detailed Diurnal Smog Schedule for morning, midday, and evening"
          className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-900 active:scale-[0.98] cursor-pointer"
        >
          <span>View Detailed Diurnal Smog Schedule (Morning, Midday, Evening)</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-emerald-400" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
