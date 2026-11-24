import React from 'react';
import { HouseholdProfile } from '../../types';
import { ShieldCheck } from 'lucide-react';

interface OnboardingStep1Props {
  profile: HouseholdProfile;
  setProfile: React.Dispatch<React.SetStateAction<HouseholdProfile>>;
}

/**
 * Step 1: Location & Region Selection Subcomponent
 */
export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ profile, setProfile }) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-stone-900">
          1. Primary City & Monitored Location
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          ClearAir synchronizes live CAAQMS telemetry for your neighborhood.
        </p>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label htmlFor="onboarding-city" className="block font-semibold text-stone-700 mb-1">
            City / Region
          </label>
          <input
            id="onboarding-city"
            type="text"
            value={profile.locations[0]?.cityName || 'Delhi'}
            onChange={(e) => {
              const updatedLocs = [...profile.locations];
              updatedLocs[0] = { ...updatedLocs[0], cityName: e.target.value };
              setProfile({ ...profile, locations: updatedLocs });
            }}
            placeholder="e.g. Delhi, Kolkata, Mumbai"
            className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-800 text-stone-900"
          />
        </div>

        <div>
          <label htmlFor="onboarding-locality" className="block font-semibold text-stone-700 mb-1">
            Locality / Neighborhood (Optional)
          </label>
          <input
            id="onboarding-locality"
            type="text"
            value={profile.locations[0]?.locality || ''}
            onChange={(e) => {
              const updatedLocs = [...profile.locations];
              updatedLocs[0] = { ...updatedLocs[0], locality: e.target.value };
              setProfile({ ...profile, locations: updatedLocs });
            }}
            placeholder="e.g. Anand Vihar, Ballygunge, BKC"
            className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-800 text-stone-900"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <span>
          Your location is processed locally in your browser and used only to fetch environmental monitoring feeds.
        </span>
      </div>
    </div>
  );
};
