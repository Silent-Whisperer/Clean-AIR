import React from 'react';
import { HouseholdProfile, CommuteMode } from '../types';

interface HouseholdFormFieldsProps {
  formData: HouseholdProfile;
  setFormData: React.Dispatch<React.SetStateAction<HouseholdProfile>>;
}

export const HouseholdFormFields: React.FC<HouseholdFormFieldsProps> = ({
  formData,
  setFormData,
}) => {
  const activeLocation =
    formData.locations.find((l) => l.id === formData.activeLocationId) ||
    formData.locations[0];

  return (
    <>
      {/* Active Monitored Location in Profile */}
      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
        <span className="font-bold text-emerald-950 block">Active Monitored Location</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">City</label>
            <input
              type="text"
              required
              value={activeLocation?.cityName || ''}
              onChange={(e) => {
                const newCity = e.target.value;
                const updatedLocs = formData.locations.map((loc) =>
                  loc.id === formData.activeLocationId ? { ...loc, cityName: newCity } : loc
                );
                setFormData({ ...formData, locations: updatedLocs });
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-700 bg-white"
              placeholder="e.g. Kolkata, Delhi"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Locality / Area</label>
            <input
              type="text"
              value={activeLocation?.locality || ''}
              onChange={(e) => {
                const newLocality = e.target.value;
                const updatedLocs = formData.locations.map((loc) =>
                  loc.id === formData.activeLocationId ? { ...loc, locality: newLocality } : loc
                );
                setFormData({ ...formData, locations: updatedLocs });
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-700 bg-white"
              placeholder="e.g. Salt Lake, Ballygunge"
            />
          </div>
        </div>
        <p className="text-[11px] text-emerald-900/80">
          Modifying city or area updates continuous station telemetry, forecast curves, and recommendations.
        </p>
      </div>

      {/* Household Label & Occupants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Household Label</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Total Family Occupants</label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.householdMembers.totalOccupants}
            onChange={(e) =>
              setFormData({
                ...formData,
                householdMembers: {
                  ...formData.householdMembers,
                  totalOccupants: parseInt(e.target.value, 10) || 1,
                },
              })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Vulnerabilities */}
      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
        <span className="font-bold text-stone-800 block">Vulnerable Household Demographics</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.householdMembers.hasElderly}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  householdMembers: {
                    ...formData.householdMembers,
                    hasElderly: e.target.checked,
                  },
                })
              }
              className="rounded text-emerald-800 w-4 h-4"
            />
            <span>Elderly (60+)</span>
          </label>

          <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.householdMembers.hasInfantsOrChildren}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  householdMembers: {
                    ...formData.householdMembers,
                    hasInfantsOrChildren: e.target.checked,
                  },
                })
              }
              className="rounded text-emerald-800 w-4 h-4"
            />
            <span>Children / Infants</span>
          </label>

          <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.householdMembers.hasAsthmaOrRespiratory}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  householdMembers: {
                    ...formData.householdMembers,
                    hasAsthmaOrRespiratory: e.target.checked,
                  },
                })
              }
              className="rounded text-emerald-800 w-4 h-4"
            />
            <span>Asthma / Respiratory</span>
          </label>
        </div>
      </div>

      {/* Commute */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Commute Method</label>
          <select
            value={formData.commute.mode}
            onChange={(e) =>
              setFormData({
                ...formData,
                commute: { ...formData.commute, mode: e.target.value as CommuteMode },
              })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
          >
            <option value="public_transit">Public Bus</option>
            <option value="metro">Metro Rail</option>
            <option value="bicycle">Bicycle</option>
            <option value="walking">Walking</option>
            <option value="car_gas">Private Petrol/Diesel Car</option>
            <option value="car_ev">Electric Car / EV</option>
            <option value="work_from_home">Work From Home (Full Remote)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Round-trip Distance (km)</label>
          <input
            type="number"
            min="0"
            max="200"
            value={formData.commute.roundTripKm}
            onChange={(e) =>
              setFormData({
                ...formData,
                commute: {
                  ...formData.commute,
                  roundTripKm: parseFloat(e.target.value) || 0,
                },
              })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.commute.canWorkRemotely}
          onChange={(e) =>
            setFormData({
              ...formData,
              commute: { ...formData.commute, canWorkRemotely: e.target.checked },
            })
          }
          className="rounded text-emerald-800 w-4 h-4"
        />
        <span>Can Work Remotely When Winter Smog Reaches Severe Levels</span>
      </label>

      {/* Home Features */}
      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
        <span className="font-bold text-stone-800 block">Home Infrastructure</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.homeFeatures.hasAirPurifier}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  homeFeatures: {
                    ...formData.homeFeatures,
                    hasAirPurifier: e.target.checked,
                  },
                })
              }
              className="rounded text-emerald-800 w-4 h-4"
            />
            <span>Has Air Purifier (HEPA)</span>
          </label>

          <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.homeFeatures.hasExhaustKitchenFan}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  homeFeatures: {
                    ...formData.homeFeatures,
                    hasExhaustKitchenFan: e.target.checked,
                  },
                })
              }
              className="rounded text-emerald-800 w-4 h-4"
            />
            <span>Has Kitchen Exhaust Hood/Fan</span>
          </label>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Cooking Fuel</label>
          <select
            value={formData.homeFeatures.cookingFuel}
            onChange={(e) =>
              setFormData({
                ...formData,
                homeFeatures: {
                  ...formData.homeFeatures,
                  cookingFuel: e.target.value as HouseholdProfile['homeFeatures']['cookingFuel'],
                },
              })
            }
            className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:ring-1 focus:ring-emerald-700"
          >
            <option value="lpg_gas">LPG Gas (Combustion produces NO2)</option>
            <option value="induction_electric">Induction / Electric (Zero combustion emissions)</option>
            <option value="wood_biomass">Biomass / Wood</option>
          </select>
        </div>
      </div>
    </>
  );
};
