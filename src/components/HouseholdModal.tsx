import React, { useState, useEffect, useRef } from 'react';
import { HouseholdProfile } from '../types';
import { X, Check } from 'lucide-react';
import { HouseholdFormFields } from './HouseholdFormFields';

interface HouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: HouseholdProfile;
  onSave: (updated: HouseholdProfile) => void;
}

/**
 * Household Health & Exposure Profile Modal
 * @description Accessible dialog with Escape key dismiss and Tab focus trapping
 */
export const HouseholdModal: React.FC<HouseholdModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<HouseholdProfile>({ ...profile });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormData({ ...profile });
  }, [profile, isOpen]);

  // Keyboard navigation: Escape key listener and Tab focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="household-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h2 id="household-modal-title" className="font-serif font-bold text-lg text-stone-900">
              Household Health & Exposure Profile
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Personalize recommendations to your occupants, location, and equipment.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          <HouseholdFormFields formData={formData} setFormData={setFormData} />

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel changes"
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label="Save and recalculate recommendations"
              className="px-5 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Check className="w-4 h-4" />
              <span>Save & Recalculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
