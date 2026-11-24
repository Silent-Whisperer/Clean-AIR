import React, { useState, useEffect } from 'react';
import { CommunityChallenge } from '../types';
import { Users, CheckCircle2, Circle, HeartHandshake } from 'lucide-react';

// Module-level cache so challenges load instantaneously on tab switch
let cachedChallenges: CommunityChallenge[] = [];

export const CommunityMode: React.FC = () => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(cachedChallenges);
  const [loading, setLoading] = useState(cachedChallenges.length === 0);

  useEffect(() => {
    let isMounted = true;
    const fetchChallenges = async () => {
      try {
        const res = await fetch('/api/community/challenges');
        if (res.ok) {
          const data = (await res.json()) as CommunityChallenge[];
          cachedChallenges = data;
          if (isMounted) {
            setChallenges(data);
          }
        }
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChallenges();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (id: string, currentState?: boolean) => {
    const newState = !currentState;
    // Optimistic update
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isCompletedByMe: newState,
              participantsCount: newState ? c.participantsCount + 1 : Math.max(0, c.participantsCount - 1),
            }
          : c
      )
    );

    try {
      await fetch(`/api/community/challenges/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newState }),
      });
    } catch (err) {
      console.error('Failed to update toggle:', err);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 lg:p-8 mb-8">
      <div className="mb-6 pb-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Community Smog Defense & Collective Action
            </h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded uppercase">
              Active Network
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Smog is not solved in isolation. Join verified neighborhood initiatives to reduce collective emissions, report illegal waste burning, and safeguard vulnerable neighbors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-100 px-3 py-2 rounded-xl self-start sm:self-auto font-medium">
          <HeartHandshake className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Active Household Smog Network</span>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-stone-500 py-12 text-center">Loading community initiatives...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => {
            const completed = !!c.isCompletedByMe;
            return (
              <div
                key={c.id}
                onClick={() => handleToggle(c.id, completed)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  completed
                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-200 shadow-2xs'
                    : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                      {c.category.replace('_', ' ')}
                    </span>

                    <button
                      type="button"
                      aria-label={`Toggle challenge: ${c.title}`}
                      className="text-stone-400 hover:text-emerald-700 focus:outline-none transition-colors"
                    >
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-stone-900 mb-1.5">
                    {c.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    {c.participantsCount.toLocaleString()} households participating
                  </span>

                  {c.co2PreventedKg > 0 && (
                    <span className="font-semibold text-emerald-800">
                      ~{c.co2PreventedKg.toLocaleString()} kg CO2 mitigated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
