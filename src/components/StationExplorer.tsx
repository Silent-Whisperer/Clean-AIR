import React, { useState, useEffect } from 'react';
import { MonitoringStation } from '../types';
import { ExternalLink, Check, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface StationExplorerProps {
  currentCity: string;
  onSelectStationLocation: (cityName: string, lat: number, lon: number, stationName: string) => void;
  onViewDashboard?: () => void;
}

// Module-level cache so stations load instantaneously across tab clicks
let cachedStations: MonitoringStation[] = [];

export const StationExplorer: React.FC<StationExplorerProps> = ({
  currentCity,
  onSelectStationLocation,
  onViewDashboard,
}) => {
  const [stations, setStations] = useState<MonitoringStation[]>(cachedStations);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(
    cachedStations.length > 0 ? cachedStations[0] : null
  );
  const [filterCity, setFilterCity] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(cachedStations.length === 0);
  const [justActivated, setJustActivated] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStations = async () => {
      try {
        const res = await fetch('/api/stations');
        if (res.ok) {
          const data = (await res.json()) as MonitoringStation[];
          cachedStations = data;
          if (isMounted) {
            setStations(data);
            if (!selectedStation && data.length > 0) {
              const match = data.find((s) => s.city.toLowerCase().includes(currentCity.toLowerCase()));
              setSelectedStation(match || data[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load stations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected station when currentCity changes if not already set by user
  useEffect(() => {
    if (stations.length > 0) {
      const match = stations.find((s) => s.city.toLowerCase().includes(currentCity.toLowerCase()));
      if (match && (!selectedStation || selectedStation.city.toLowerCase() !== currentCity.toLowerCase())) {
        setSelectedStation(match);
      }
    }
  }, [currentCity, stations]);

  const cities = ['All', 'Delhi', 'Kolkata', 'Howrah', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Lucknow', 'Patna', 'Chennai'];

  const filtered = filterCity === 'All'
    ? stations
    : stations.filter((s) => s.city.toLowerCase().includes(filterCity.toLowerCase()));

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (aqi <= 100) return 'text-lime-800 bg-lime-50 border-lime-200';
    if (aqi <= 200) return 'text-yellow-800 bg-yellow-50 border-yellow-200';
    if (aqi <= 300) return 'text-orange-800 bg-orange-50 border-orange-200';
    if (aqi <= 400) return 'text-red-800 bg-red-50 border-red-200';
    return 'text-rose-950 bg-rose-100 border-rose-300';
  };

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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
          {cities.map((city) => (
            <button
              key={city}
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Station List (Col 1-5) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[360px] sm:max-h-[520px] overflow-y-auto pr-1">
            {filtered.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              const isMatchCity = st.city.toLowerCase().includes(currentCity.toLowerCase());
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
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
                    <div className={`px-2 py-0.5 rounded text-xs font-bold border ${getAqiColor(st.aqi)}`}>
                      {st.aqi} NAQI
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{st.category}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Station Detail & Geographic Mapping (Col 6-12) */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200 flex flex-col justify-between">
            {selectedStation ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                      {selectedStation.agency}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      {selectedStation.latitude}°N, {selectedStation.longitude}°E
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-stone-900 mt-2">
                    {selectedStation.name}
                  </h3>
                  <p className="text-xs text-stone-600">
                    Official Continuous Ambient Air Quality Station in {selectedStation.city}, {selectedStation.state}.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
                    <span className="text-[11px] text-stone-500 block font-medium">Indian NAQI</span>
                    <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
                      {selectedStation.aqi}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-700">{selectedStation.category}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
                    <span className="text-[11px] text-stone-500 block font-medium">PM2.5 (Fine)</span>
                    <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
                      {selectedStation.pm25}
                    </span>
                    <span className="text-[10px] text-stone-500">µg/m³ (CPCB Limit: 60)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 col-span-2 sm:col-span-1 shadow-2xs">
                    <span className="text-[11px] text-stone-500 block font-medium">PM10 (Coarse)</span>
                    <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
                      {selectedStation.pm10}
                    </span>
                    <span className="text-[10px] text-stone-500">µg/m³ (CPCB Limit: 100)</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-stone-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Station Data Quality & Traceability</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    This station feeds telemetry directly to the Central Pollution Control Board (CPCB) national portal using automated beta-attenuation particulate mass monitors.
                  </p>
                </div>

                {/* Action buttons with feedback */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <a
                    href="https://cpcb.nic.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 underline"
                  >
                    <span>View CPCB Central Air Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleActivate(selectedStation)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                        justActivated === selectedStation.id
                          ? 'bg-emerald-800 text-white ring-2 ring-emerald-400'
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                    >
                      {justActivated === selectedStation.id ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>✓ Active Monitored Station</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Set As Active Station</span>
                        </>
                      )}
                    </button>

                    {onViewDashboard && (
                      <button
                        onClick={onViewDashboard}
                        className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Dashboard</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-stone-500">
                Select a station from the list to view live telemetry and sensor coordinates.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
