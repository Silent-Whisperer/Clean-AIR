import { useEffect, RefObject } from 'react';

/**
 * Accessible Modal Focus Trap & Escape Handler Hook
 * @description Traps keyboard Tab navigation inside the modal, auto-focuses the first control on open,
 * restores focus to the previously active element on close, and closes on Escape.
 * @param isOpen - Whether the modal dialog is currently visible
 * @param modalRef - Ref pointing to the modal dialog container
 * @param onClose - Callback invoked when Escape is pressed
 */
export function useModalFocusTrap(
  isOpen: boolean,
  modalRef: RefObject<HTMLDivElement | null>,
  onClose: () => void
): void {
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Auto-focus first focusable element inside the modal
    const container = modalRef.current;
    if (container) {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

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
        } else if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, modalRef, onClose]);
}
