import React, { useState, useEffect, useRef } from 'react';
import { SavedLocation } from '../types';
import { Plus } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: SavedLocation[];
  activeLocationId: string;
  onSelectLocation: (loc: SavedLocation) => void;
  onAddLocation: (loc: SavedLocation) => void;
  onDeleteLocation: (id: string) => void;
  getLabelIcon: (label: string) => React.ReactNode;
}

/**
 * Monitored Locations Management Dropdown / Modal
 * @description Accessible dialog with Escape key dismiss and Tab focus trapping
 */
export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  locations,
  activeLocationId,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  getLabelIcon,
}) => {
  const [addingNew, setAddingNew] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'College' | 'Custom'>('Custom');
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation: Escape key listener and Tab focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    let targetLat = 22.5726;
    let targetLon = 88.3639;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${newCity.trim()}${newLocality.trim() ? `, ${newLocality.trim()}` : ''}`
        )}&limit=1`
      );
      if (res.ok) {
        const data = (await res.json()) as any[];
        if (Array.isArray(data) && data.length > 0) {
          targetLat = parseFloat(data[0].lat);
          targetLon = parseFloat(data[0].lon);
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed, using default coordinate resolution:', err);
    }

    const created: SavedLocation = {
      id: `loc-${Date.now()}`,
      label: newLabel,
      cityName: newCity.trim(),
      locality: newLocality.trim() || undefined,
      latitude: targetLat,
      longitude: targetLon,
    };

    onAddLocation(created);
    onSelectLocation(created);
    setNewCity('');
    setNewLocality('');
    setAddingNew(false);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Manage Monitored Locations"
      className="absolute top-full left-0 right-0 mt-2 z-30 bg-white rounded-2xl border border-stone-200 shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Manage Monitored Locations
        </span>
        <button
          onClick={() => setAddingNew(!addingNew)}
          aria-label={addingNew ? 'Cancel adding location' : 'Add new location'}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{addingNew ? 'Close Form' : 'Add Location'}</span>
        </button>
      </div>

      {addingNew && (
        <form onSubmit={handleCreate} className="p-3 bg-stone-50 rounded-xl mb-4 border border-stone-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label htmlFor="modal-city-input" className="block text-[11px] font-semibold text-stone-700 mb-1">
                City
              </label>
              <input
                id="modal-city-input"
                type="text"
                required
                placeholder="e.g. Kolkata, Mumbai"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label htmlFor="modal-locality-input" className="block text-[11px] font-semibold text-stone-700 mb-1">
                Locality (Optional)
              </label>
              <input
                id="modal-locality-input"
                type="text"
                placeholder="e.g. Salt Lake, Bandra"
                value={newLocality}
                onChange={(e) => setNewLocality(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label htmlFor="modal-label-select" className="block text-[11px] font-semibold text-stone-700 mb-1">
                Label
              </label>
              <select
                id="modal-label-select"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="College">College</option>
                <option value="Custom">Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAddingNew(false)}
              className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
            >
              Save & Switch
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {locations.map((loc) => {
          const isSelected = loc.id === activeLocationId;
          return (
            <div
              key={loc.id}
              role="button"
              tabIndex={0}
              aria-label={`Select location ${loc.cityName}${loc.locality ? ` ${loc.locality}` : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectLocation(loc);
                  onClose();
                }
              }}
              onClick={() => {
                onSelectLocation(loc);
                onClose();
              }}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                  {getLabelIcon(loc.label)}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <span>{loc.cityName}</span>
                    {loc.locality && (
                      <span className="text-[11px] text-stone-500 font-normal">
                        ({loc.locality})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                    {loc.customName || loc.label}
                  </span>
                </div>
              </div>

              {locations.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove location ${loc.cityName}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLocation(loc.id);
                  }}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
