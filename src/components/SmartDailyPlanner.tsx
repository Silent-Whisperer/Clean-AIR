import React, { useState } from 'react';
import { SmartDailyAction } from '../types';
import { Clock, Sun, Moon, Sunrise, Edit3, Check } from 'lucide-react';

interface SmartDailyPlannerProps {
  timeline: SmartDailyAction[];
  city: string;
}

/**
 * Smart Daily Diurnal Inversion Planner
 * @description Time-windowed smog schedule with editable household action notes
 */
export const SmartDailyPlanner: React.FC<SmartDailyPlannerProps> = ({ timeline, city }) => {
  const [scheduleItems, setScheduleItems] = useState<SmartDailyAction[]>(timeline);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('');

  const getIcon = (timeframe: string) => {
    switch (timeframe) {
      case 'morning':
        return <Sunrise className="w-5 h-5 text-amber-600" />;
      case 'afternoon':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'evening':
        return <Moon className="w-5 h-5 text-indigo-500" />;
      default:
        return <Clock className="w-5 h-5 text-stone-600" />;
    }
  };

  const handleStartEdit = (item: SmartDailyAction) => {
    setEditingId(item.id);
    setCustomText(item.recommendation);
  };

  const handleSaveEdit = (id: string) => {
    setScheduleItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, recommendation: customText } : it))
    );
    setEditingId(null);
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 lg:p-8 mb-8">
      <div className="mb-6 pb-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif font-black text-stone-900">
            Smart Diurnal Smog Planner ({city})
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Cold winter radiation inversions create extreme diurnal pollution swings. Adjust your ventilation and schedule accordingly.
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold self-start sm:self-auto">
          Editable Schedule
        </span>
      </div>

      <div className="space-y-6">
        {scheduleItems.map((item, idx) => {
          const isCritical = item.urgency === 'critical';
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id || idx}
              className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80"
            >
              <div className="sm:w-20 flex sm:flex-col items-center justify-center p-3 rounded-2xl bg-white border border-stone-200 text-center gap-1.5 shrink-0">
                {getIcon(item.timeframe)}
                <span className="text-[10px] uppercase font-black text-stone-700 tracking-wider">
                  {item.timeframe}
                </span>
              </div>

              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-stone-950">{item.title}</h3>
                    {item.actionWindow && (
                      <span className="text-[11px] font-semibold text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        {item.actionWindow}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-900 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isCritical ? 'Inversion Hazard' : 'Dispersal Window'}
                    </span>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1 text-stone-400 hover:text-stone-800"
                        title="Edit schedule note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full text-xs p-3 border border-stone-300 rounded-xl bg-white focus:ring-1 focus:ring-emerald-800"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs text-stone-500 hover:text-stone-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {item.recommendation}
                  </p>
                )}

                <div className="pt-2 text-[11px] text-stone-500 flex items-start gap-1.5 border-t border-stone-200/60">
                  <span className="font-bold text-stone-700">Atmospheric Science:</span>
                  <span>{item.rationale}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
