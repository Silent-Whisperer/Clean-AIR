import React, { useState, useEffect, useCallback } from 'react';
import { CommunityChallenge } from '../types';
import { Users, CheckCircle2, Circle, HeartHandshake, AlertCircle, RefreshCw } from 'lucide-react';

// Module-level cache so challenges load instantaneously on tab switch
let cachedChallenges: CommunityChallenge[] = [];

/**
 * Community Smog Mitigation Challenges
 * @description Collective neighborhood pledges for indoor clean zones and zero open burning
 */
export const CommunityMode: React.FC = () => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(cachedChallenges);
  const [loading, setLoading] = useState(cachedChallenges.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/community/challenges');
      if (!res.ok) {
        throw new Error(`Community service returned HTTP ${res.status}`);
      }
      const data = (await res.json()) as CommunityChallenge[];
      cachedChallenges = data;
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setFetchError('Unable to load community initiatives. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/community/challenges')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Community service returned HTTP ${res.status}`);
        }
        return (await res.json()) as CommunityChallenge[];
      })
      .then((data) => {
        cachedChallenges = data;
        if (active) {
          setChallenges(data);
          setFetchError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load challenges:', err);
        if (active) {
          setFetchError('Unable to load community initiatives. Please check your connection and retry.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
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
      ) : fetchError ? (
        <div className="py-10 px-4 text-center bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-rose-700 mx-auto mb-2" />
          <p className="text-xs font-medium text-rose-900 mb-3">{fetchError}</p>
          <button
            type="button"
            onClick={() => void loadChallenges()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Initiatives</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => {
            const completed = !!c.isCompletedByMe;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={completed}
                aria-label={`Toggle challenge: ${c.title}`}
                onClick={() => handleToggle(c.id, completed)}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  completed
                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-200 shadow-2xs'
                    : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                      {c.category.replace('_', ' ')}
                    </span>

                    <span className="text-stone-400">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-400" aria-hidden="true" />
                      )}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-stone-900 mb-1.5">
                    {c.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {c.description}
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <Users className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
                    {c.participantsCount.toLocaleString()} households participating
                  </span>

                  {c.co2PreventedKg > 0 && (
                    <span className="font-semibold text-emerald-800">
                      ~{c.co2PreventedKg.toLocaleString()} kg CO2 mitigated
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
