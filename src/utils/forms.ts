import { KeyboardEvent } from 'react';

/**
 * Prevents implicit form submission on Enter key press (HTML's default form behavior.)
 * We override this since it is unexpected/unintuitive on long forms.
 */
export function preventImplicitSubmission(e: KeyboardEvent<HTMLElement>) {
  if (
    e.key === 'Enter' &&
    // Don't override if the event target is a button. This keeps the DatePicker adornment button working correctly, among others
    e.target instanceof HTMLElement &&
    e.target.tagName !== 'BUTTON'
  ) {
    e.preventDefault();
  }
}
