import React from 'react';

/**
 * Horizontal tabs for account main panel.
 * @param {{ id: string, label: string, disabled?: boolean }[]} tabs
 */
export default function AccountTabs({ tabs, value, onChange }) {
  return (
    <div
      className="mb-6 flex flex-wrap gap-1 rounded-xl border border-[var(--color-ui-border)] bg-[var(--color-ui-bg-muted)] p-1 sm:inline-flex sm:flex-nowrap"
      role="tablist"
      aria-label="Account sections"
    >
      {tabs.map((tab) => {
        const selected = value === tab.id;
        const base =
          'relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2';
        if (tab.disabled) {
          return (
            <span
              key={tab.id}
              className={`${base} cursor-not-allowed text-gray-400`}
              title="Coming soon"
            >
              {tab.label}
            </span>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={
              selected
                ? `${base} bg-white text-[var(--color-primary)] shadow-sm`
                : `${base} text-[var(--color-ui-body)] hover:bg-white/80 hover:text-[var(--color-ui-heading)]`
            }
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
