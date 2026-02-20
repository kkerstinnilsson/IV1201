/**
 * Reusable modal dialog component.
 * Renders a centered dialog with backdrop.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is visible
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {() => void} props.onClose - Close callback
 * @param {React.ReactNode} [props.footer] - Optional footer actions
 *
 * @returns {JSX.Element|null}
 */

import { useEffect } from 'react';

export default function Modal({open, title, children, onClose, footer,}) {

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 w-full h-full bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative mx-auto mt-24 w-[min(92vw,520px)]">
        <div className="container">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>

          <div className="mt-4">
            {children}
          </div>

          {footer && (
            <div className="mt-6 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
