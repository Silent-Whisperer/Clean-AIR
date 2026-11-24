import React from 'react';
import { HouseholdProfile, CommuteMode } from '../../types';

interface OnboardingStep3Props {
  profile: HouseholdProfile;
  setProfile: React.Dispatch<React.SetStateAction<HouseholdProfile>>;
}

/**
 * Step 3: Commute Mode and Indoor Purifier Setup Subcomponent
 */
export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ profile, setProfile }) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-stone-900">
          3. Commute Routine & Home Equipment
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Helps calculate your personal exposure risk and tailors indoor advice.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label htmlFor="onboarding-commute" className="block font-semibold text-stone-700 mb-1">
            Primary Commute Mode
          </label>
          <select
            id="onboarding-commute"
            value={profile.commute.mode}
            onChange={(e) =>
              setProfile({
                ...profile,
                commute: { ...profile.commute, mode: e.target.value as CommuteMode },
              })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
          >
            <option value="public_transit">Public Bus / Shared Transit</option>
            <option value="metro">Metro Rail</option>
            <option value="bicycle">Bicycle</option>
            <option value="walking">Walking</option>
            <option value="car_gas">Private Petrol/Diesel Car</option>
            <option value="car_ev">Electric Vehicle (EV)</option>
            <option value="work_from_home">Full Remote / Telework</option>
          </select>
        </div>

        <div>
          <label htmlFor="onboarding-purifier" className="block font-semibold text-stone-700 mb-1">
            Air Purifier Availability
          </label>
          <select
            id="onboarding-purifier"
            value={profile.homeFeatures.hasAirPurifier ? 'yes' : 'no'}
            onChange={(e) =>
              setProfile({
                ...profile,
                homeFeatures: {
                  ...profile.homeFeatures,
                  hasAirPurifier: e.target.value === 'yes',
                },
              })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
          >
            <option value="yes">Yes, have HEPA air purifier</option>
            <option value="no">No, need budget / DIY solutions</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={profile.commute.canWorkRemotely}
          onChange={(e) =>
            setProfile({
              ...profile,
              commute: { ...profile.commute, canWorkRemotely: e.target.checked },
            })
          }
          className="rounded text-emerald-800"
        />
        <span>Can work from home when winter smog reaches Severe levels</span>
      </label>
    </div>
  );
};
