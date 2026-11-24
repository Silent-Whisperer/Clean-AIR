import React from 'react';
import { SustainableComparison, ImpactEngineReport } from '../types';
import { ShieldAlert, Leaf } from 'lucide-react';

interface SustainableAlternativesProps {
  comparison: SustainableComparison;
  impact: ImpactEngineReport;
}

export const SustainableAlternatives: React.FC<SustainableAlternativesProps> = ({
  comparison,
  impact,
}) => {
  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 lg:p-8 mb-8">
      <div className="mb-6 pb-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif font-black text-stone-900">
            Sustainable Commute & Inhalation Exposure Evaluator
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Balancing tailpipe emissions, respiratory deposition risk, financial cost, and transit duration under Indian winter smog.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 text-amber-950 font-bold border border-amber-200">
            Priority Rule: <strong>{comparison.primaryConsideration}</strong>
          </span>
        </div>
      </div>

      {/* Agent Verdict Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 mb-8 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
            ClearAir Clinical Commute Verdict
          </h3>
          <p className="text-xs text-amber-900 mt-1 leading-relaxed font-medium">
            {comparison.agentVerdict}
          </p>
        </div>
      </div>

      {/* Commute Alternatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {comparison.options.map((opt, idx) => {
          const isRecommended = opt.commuteMode === comparison.recommendedMode;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isRecommended
                  ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-300'
                  : 'bg-[#FAF8F5] border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-900">{opt.name}</span>
                  {isRecommended && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-800 text-white">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-xs pt-2">
                  <div className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Inhalation Hazard:</span>
                    <span
                      className={`font-bold ${
                        opt.inhalationExposureRisk === 'Severe' || opt.inhalationExposureRisk === 'High'
                          ? 'text-rose-700'
                          : 'text-stone-800'
                      }`}
                    >
                      {opt.inhalationExposureRisk} Risk
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Trip Carbon Footprint:</span>
                    <span className="font-semibold text-stone-800 font-mono">
                      {opt.emissionGramsCO2} g CO2
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500">Estimated Cost:</span>
                    <span className="font-semibold text-stone-900">{opt.estimatedCostFormatted}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Transit Duration:</span>
                    <span className="font-semibold text-stone-900">~{opt.travelDurationMinutes} mins</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between text-[11px]">
                <span className="text-stone-500">Respiratory Safety:</span>
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <div className="w-16 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        opt.safetyScore >= 80 ? 'bg-emerald-600' : opt.safetyScore >= 50 ? 'bg-amber-600' : 'bg-rose-600'
                      }`}
                      style={{ width: `${opt.safetyScore}%` }}
                    />
                  </div>
                  <span>{opt.safetyScore}/100</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Engine Report */}
      <div className="border-t border-stone-200 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 text-emerald-800" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Verified Environmental & Personal Mitigation Engine
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 font-medium">Personal Exposure Mitigation Score</span>
            <div className="text-3xl font-serif font-black text-stone-900 mt-1">
              {impact.personalExposureMitigationScore} / 100
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-700 h-1.5 rounded-full"
                style={{ width: `${impact.personalExposureMitigationScore}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 font-medium">Verified Avoided Weekly Emissions</span>
            <div className="text-3xl font-serif font-black text-emerald-900 mt-1">
              ~{impact.potentialWeeklyEmissionSavingsKgCO2e} kg
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              CO2e mitigated by replacing single-occupancy driving with electric Metro transit.
            </p>
          </div>
        </div>

        <ul className="text-xs text-stone-600 space-y-1.5 mb-3">
          {impact.calculationBreakdown.map((item, bIdx) => (
            <li key={bIdx} className="flex items-start gap-2">
              <span className="text-stone-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="text-[11px] text-stone-400 italic">
          {impact.disclaimer}
        </p>
      </div>
    </section>
  );
};
