import React from 'react';
import { HouseholdProfile } from '../../types';

interface OnboardingStep2Props {
  profile: HouseholdProfile;
  setProfile: React.Dispatch<React.SetStateAction<HouseholdProfile>>;
}

/**
 * Step 2: Household Vulnerabilities & Demographic Sensitivity Subcomponent
 */
export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ profile, setProfile }) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-stone-900">
          2. Household Demographics & Sensitivity
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Enables clinical safety thresholds for vulnerable occupants.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={profile.householdMembers.hasElderly}
            onChange={(e) =>
              setProfile({
                ...profile,
                householdMembers: {
                  ...profile.householdMembers,
                  hasElderly: e.target.checked,
                },
              })
            }
            className="rounded text-emerald-800 w-4 h-4"
          />
          <div>
            <span className="font-bold text-stone-900 block">Elderly family members (60+)</span>
            <span className="text-stone-500 text-[11px]">Prioritizes cardiovascular protection and nasal hydration.</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={profile.householdMembers.hasInfantsOrChildren}
            onChange={(e) =>
              setProfile({
                ...profile,
                householdMembers: {
                  ...profile.householdMembers,
                  hasInfantsOrChildren: e.target.checked,
                },
              })
            }
            className="rounded text-emerald-800 w-4 h-4"
          />
          <div>
            <span className="font-bold text-stone-900 block">Infants or young children</span>
            <span className="text-stone-500 text-[11px]">Adjusts outdoor play alerts based on developing lung volumes.</span>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={profile.householdMembers.hasAsthmaOrRespiratory}
            onChange={(e) =>
              setProfile({
                ...profile,
                householdMembers: {
                  ...profile.householdMembers,
                  hasAsthmaOrRespiratory: e.target.checked,
                },
              })
            }
            className="rounded text-emerald-800 w-4 h-4"
          />
          <div>
            <span className="font-bold text-stone-900 block">Asthma, COPD, or chronic allergies</span>
            <span className="text-stone-500 text-[11px]">Triggers proactive bronchospasm prevention notifications.</span>
          </div>
        </label>
      </div>
    </div>
  );
};
