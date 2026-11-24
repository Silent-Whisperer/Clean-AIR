import React, { useState, useEffect, useCallback } from 'react';
import { MonitoringStation } from '../types';
import { ExternalLink, Check, ShieldCheck } from 'lucide-react';

interface StationExplorerProps {
  currentCity: string;
  onSelectStationLocation: (cityName: string, lat: number, lon: number, stationName: string) => void;
}

export const StationExplorer: React.FC<StationExplorerProps> = ({
  currentCity,
  onSelectStationLocation,
}) => {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);
  const [filterCity, setFilterCity] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStations = useCallback(async () => {
    try {
      const res = await fetch('/api/stations');
      if (res.ok) {
        const data = await res.json();
        setStations(data);
        if (data.length > 0) {
          const match = data.find((s: MonitoringStation) =>
            s.city.toLowerCase().includes(currentCity.toLowerCase())
          );
          setSelectedStation(match || data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load stations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentCity]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const cities = ['All', 'Delhi', 'Kolkata', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Lucknow', 'Patna'];

  const filtered = filterCity === 'All'
    ? stations
    : stations.filter((s) => s.city.toLowerCase() === filterCity.toLowerCase());

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (aqi <= 100) return 'text-lime-800 bg-lime-50 border-lime-200';
    if (aqi <= 200) return 'text-yellow-800 bg-yellow-50 border-yellow-200';
    if (aqi <= 300) return 'text-orange-800 bg-orange-50 border-orange-200';
    if (aqi <= 400) return 'text-red-800 bg-red-50 border-red-200';
    return 'text-rose-950 bg-rose-100 border-rose-300';
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Verified CAAQMS Monitoring Network
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Zero Inventions
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Real Continuous Ambient Air Quality Monitoring Stations operated by CPCB and State Pollution Control Boards.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setFilterCity(city)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
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
        <div className="py-12 text-center text-xs text-stone-500">Loading verified monitoring telemetry...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Station List (Col 1-5) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filtered.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-400 ring-1 ring-emerald-300'
                      : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{st.name}</span>
                      <span className="text-[10px] text-stone-500 font-medium">({st.city})</span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Operator: <span className="text-stone-700 font-medium">{st.agency}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`px-2 py-0.5 rounded text-xs font-bold border ${getAqiColor(st.aqi)}`}>
                      {st.aqi} AQI
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
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                      {selectedStation.agency}
                    </span>
                    <span className="text-xs text-stone-500">
                      Coordinates: {selectedStation.latitude}°N, {selectedStation.longitude}°E
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-stone-900 mt-2">
                    {selectedStation.name}
                  </h3>
                  <p className="text-xs text-stone-600">
                    Continuous monitoring station in {selectedStation.city}, {selectedStation.state}.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="text-[11px] text-stone-400 block font-medium">Current NAQI</span>
                    <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
                      {selectedStation.aqi}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-600">{selectedStation.category}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="text-[11px] text-stone-400 block font-medium">PM2.5 (Fine)</span>
                    <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
                      {selectedStation.pm25}
                    </span>
                    <span className="text-[10px] text-stone-500">µg/m³</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-stone-400 block font-medium">PM10 (Coarse)</span>
                    <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">
                      {selectedStation.pm10}
                    </span>
                    <span className="text-[10px] text-stone-500">µg/m³</span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-stone-200 bg-white">
                  <iframe
                    title="Station Geographic Map"
                    width="100%"
                    height="180"
                    loading="lazy"
                    className="border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedStation.longitude - 0.04}%2C${selectedStation.latitude - 0.03}%2C${selectedStation.longitude + 0.04}%2C${selectedStation.latitude + 0.03}&layer=mapnik&marker=${selectedStation.latitude}%2C${selectedStation.longitude}`}
                  />
                  <div className="p-2 text-right bg-stone-50 border-t border-stone-100">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${selectedStation.latitude}&mlon=${selectedStation.longitude}#map=14/${selectedStation.latitude}/${selectedStation.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-800 hover:underline font-semibold"
                    >
                      View Full Interactive Map ↗
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Station Data Quality & Traceability</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    This station feeds telemetry directly to the Central Pollution Control Board (CPCB) national portal. Data is updated hourly with beta-attenuation particulate mass monitors.
                  </p>
                </div>

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

                  <button
                    onClick={() =>
                      onSelectStationLocation(
                        selectedStation.city,
                        selectedStation.latitude,
                        selectedStation.longitude,
                        selectedStation.name
                      )
                    }
                    className="w-full sm:w-auto px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Set As Active Monitoring Station</span>
                  </button>
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
