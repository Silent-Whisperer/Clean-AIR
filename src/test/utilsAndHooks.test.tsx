import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { getAqiBadgeColor } from '../utils/aqiColors';
import { loadStoredProfile, saveStoredProfile, DEFAULT_INITIAL_PROFILE } from '../utils/profileStorage';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

function FocusTrapHarness({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, modalRef, onClose);
  if (!isOpen) return null;
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      <button type="button">First</button>
      <button type="button">Last</button>
    </div>
  );
}

describe('Frontend Utilities & Modal Focus Trap Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns distinct CPCB NAQI badge styles across all 6 thresholds', () => {
    expect(getAqiBadgeColor(30)).toContain('emerald');
    expect(getAqiBadgeColor(80)).toContain('lime');
    expect(getAqiBadgeColor(150)).toContain('yellow');
    expect(getAqiBadgeColor(250)).toContain('orange');
    expect(getAqiBadgeColor(350)).toContain('red');
    expect(getAqiBadgeColor(450)).toContain('rose');
  });

  it('persists and loads household profile from localStorage', () => {
    const initial = loadStoredProfile();
    expect(initial.id).toBe(DEFAULT_INITIAL_PROFILE.id);

    const updated = { ...DEFAULT_INITIAL_PROFILE, name: 'Patel Family' };
    saveStoredProfile(updated);
    expect(loadStoredProfile().name).toBe('Patel Family');
  });

  it('auto-focuses first modal button, wraps Tab focus, and closes on Escape', () => {
    const onClose = vi.fn();
    render(<FocusTrapHarness isOpen={true} onClose={onClose} />);

    const first = screen.getByText('First');
    const last = screen.getByText('Last');
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
