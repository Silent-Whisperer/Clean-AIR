import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MonitoringStation } from '../types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getAqiBadgeColor } from '../utils/aqiColors';
import { StationDetailCard } from './subcomponents/StationDetailCard';

interface StationExplorerProps {
  currentCity: string;
  onSelectStationLocation: (cityName: string, lat: number, lon: number, stationName: string) => void;
  onViewDashboard?: () => void;
}

// Module-level cache so stations load instantaneously across tab clicks
let cachedStations: MonitoringStation[] = [];

/**
 * Verified CAAQMS Monitoring Station Explorer
 * @description Lists continuous monitoring stations with city filtering, keyboard-accessible selection, and map view
 */
export const StationExplorer: React.FC<StationExplorerProps> = ({
  currentCity,
  onSelectStationLocation,
  onViewDashboard,
}) => {
  const [stations, setStations] = useState<MonitoringStation[]>(cachedStations);
  const [userSelectedStation, setUserSelectedStation] = useState<MonitoringStation | null>(null);
  const [filterCity, setFilterCity] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(cachedStations.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [justActivated, setJustActivated] = useState<string | null>(null);

  const loadStations = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/stations');
      if (!res.ok) {
        throw new Error(`Station service returned HTTP ${res.status}`);
      }
      const data = (await res.json()) as MonitoringStation[];
      cachedStations = data;
      setStations(data);
    } catch (err) {
      console.error('Failed to load stations:', err);
      setFetchError('Unable to load CAAQMS station telemetry. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/stations')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Station service returned HTTP ${res.status}`);
        }
        return (await res.json()) as MonitoringStation[];
      })
      .then((data) => {
        cachedStations = data;
        if (active) {
          setStations(data);
          setFetchError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load stations:', err);
        if (active) {
          setFetchError('Unable to load CAAQMS station telemetry. Please check your connection and retry.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedStation = useMemo(() => {
    if (userSelectedStation) return userSelectedStation;
    if (stations.length === 0) return null;
    const match = stations.find((s) => s.city.toLowerCase().includes(currentCity.toLowerCase()));
    return match || stations[0];
  }, [userSelectedStation, stations, currentCity]);

  const cities = ['All', 'Delhi', 'Kolkata', 'Howrah', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Lucknow', 'Patna', 'Chennai'];

  const filtered = filterCity === 'All'
    ? stations
    : stations.filter((s) => s.city.toLowerCase().includes(filterCity.toLowerCase()));

  const handleActivate = (st: MonitoringStation) => {
    setJustActivated(st.id);
    onSelectStationLocation(st.city, st.latitude, st.longitude, st.name);
    setTimeout(() => setJustActivated(null), 3000);
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 lg:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-stone-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              Verified CAAQMS Continuous Monitoring Network
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              17 Verified Stations
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Physical continuous stations operated by CPCB and State PCBs. Telemetry updates continuously across all cities.
          </p>
        </div>

        {/* City Filter Pills */}
        <div
          role="group"
          aria-label="Filter monitoring stations by city"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0"
        >
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              aria-pressed={filterCity === city}
              onClick={() => setFilterCity(city)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[34px] ${
                filterCity === city
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">Connecting to verified continuous monitoring telemetry...</div>
      ) : fetchError ? (
        <div className="py-10 px-4 text-center bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-rose-700 mx-auto mb-2" />
          <p className="text-xs font-medium text-rose-900 mb-3">{fetchError}</p>
          <button
            type="button"
            onClick={() => void loadStations()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Stations</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Station List (Col 1-5) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[360px] sm:max-h-[520px] overflow-y-auto pr-1">
            {filtered.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              const isMatchCity = st.city.toLowerCase().includes(currentCity.toLowerCase());
              return (
                <button
                  key={st.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setUserSelectedStation(st)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300 shadow-xs'
                      : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{st.name}</span>
                      {isMatchCity && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                          Nearest
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {st.city}, {st.state} • Operator: <span className="text-stone-700 font-medium">{st.agency}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`px-2 py-0.5 rounded text-xs font-bold border ${getAqiBadgeColor(st.aqi)}`}>
                      {st.aqi} NAQI
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{st.category}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <StationDetailCard
            station={selectedStation}
            justActivated={justActivated}
            onActivate={handleActivate}
            onViewDashboard={onViewDashboard}
          />
        </div>
      )}
    </section>
  );
};
