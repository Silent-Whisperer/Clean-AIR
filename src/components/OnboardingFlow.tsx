import React, { useState, useRef } from 'react';
import { HouseholdProfile } from '../types';
import { ArrowRight } from 'lucide-react';
import { OnboardingStep1 } from './subcomponents/OnboardingStep1';
import { OnboardingStep2 } from './subcomponents/OnboardingStep2';
import { OnboardingStep3 } from './subcomponents/OnboardingStep3';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

interface OnboardingFlowProps {
  initialProfile: HouseholdProfile;
  onComplete: (profile: HouseholdProfile) => void;
  onSkip: () => void;
}

/**
 * Onboarding Flow Wizard
 * @description 3-step accessible setup flow with Escape key listener and Tab focus trapping
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialProfile,
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<HouseholdProfile>({ ...initialProfile });
  const modalRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap(true, modalRef, onSkip);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ ...profile, isOnboarded: true });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Progress Strip */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                ClearAir Intelligence Setup (Step {step} of 3)
              </span>
            </div>
            <h2 id="onboarding-title" className="text-xl font-serif font-bold text-stone-950 mt-1">
              Personalize Your Daily Health Shield
            </h2>
          </div>

          <button
            onClick={onSkip}
            aria-label="Skip onboarding setup for now"
            className="text-xs text-stone-400 hover:text-stone-700 font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Step Content */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && <OnboardingStep1 profile={profile} setProfile={setProfile} />}
          {step === 2 && <OnboardingStep2 profile={profile} setProfile={setProfile} />}
          {step === 3 && <OnboardingStep3 profile={profile} setProfile={setProfile} />}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-stone-100 bg-[#FAF8F5] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              aria-label="Go back to previous setup step"
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            aria-label={step === 3 ? 'Activate CleanAir Intelligence' : 'Continue to next step'}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>{step === 3 ? 'Activate Intelligence' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
