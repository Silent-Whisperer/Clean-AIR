import React from 'react';
import { IndoorAirAdvice } from '../types';
import { Flame, Fan, Wrench, Check, AlertTriangle, Home } from 'lucide-react';

interface IndoorAirCoachProps {
  guidance: IndoorAirAdvice[];
  hasPurifier: boolean;
  cookingFuel: string;
}

export const IndoorAirCoach: React.FC<IndoorAirCoachProps> = ({
  guidance,
  hasPurifier,
  cookingFuel: _cookingFuel,
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'cooking':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'ventilation':
        return <Fan className="w-4 h-4 text-blue-600" />;
      case 'diy_purification':
        return <Wrench className="w-4 h-4 text-emerald-700" />;
      default:
        return <Home className="w-4 h-4 text-stone-700" />;
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 lg:p-8 mb-8">
      <div className="mb-6 pb-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif font-black text-stone-900">
            Indoor Air Quality Coach & Practical Checklist
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Over 80% of human pollution exposure occurs indoors. Actionable, room-by-room interventions that do not require costly appliances.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 font-semibold border border-stone-200">
            Setup: <strong>{hasPurifier ? 'HEPA Purifier Equipped' : 'Zero-Purifier Strategy (DIY Priority)'}</strong>
          </span>
        </div>
      </div>

      {/* Room by Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guidance.map((card) => (
          <div
            key={card.id}
            className="rounded-3xl border border-stone-200 bg-[#FAF8F5] p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs">
                    {getCategoryIcon(card.category)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {card.category.replace('_', ' ')}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    card.costEstimate === 'free'
                      ? 'bg-emerald-100 text-emerald-800'
                      : card.costEstimate === 'low_cost'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {card.costEstimate.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-stone-950 mb-3">
                {card.title}
              </h3>

              <ul className="space-y-2.5 mb-5">
                {card.practicalSteps.map((step, sIdx) => (
                  <li key={sIdx} className="text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-stone-200/60 space-y-2">
              <div className="text-[11px] text-stone-500">
                <strong className="text-stone-700">Physical Limitation: </strong>
                {card.limitations}
              </div>

              {card.safetyWarning && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{card.safetyWarning}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
