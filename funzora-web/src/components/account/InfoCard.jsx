import React from 'react';
import { Pencil } from 'lucide-react';
import { ICON_STROKE, ICON_SIZES } from '../../constants/appIconTokens';

/**
 * Read-only info tile with optional edit affordance.
 */
export default function InfoCard({ label, value, onEdit, editLabel = 'Edit' }) {
  return (
    <div className="group relative rounded-xl border border-[var(--color-ui-border)] bg-white p-4 shadow-sm transition-shadow duration-200 hover:border-[var(--color-primary-light)] hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="text-base font-medium text-[var(--color-ui-heading)]">{value ?? '—'}</p>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100"
            aria-label={`${editLabel} ${label}`}
          >
            <Pencil size={ICON_SIZES.sm} strokeWidth={ICON_STROKE} aria-hidden />
            <span className="hidden sm:inline">{editLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
