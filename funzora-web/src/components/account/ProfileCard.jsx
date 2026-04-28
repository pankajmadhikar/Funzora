import React from 'react';

export default function ProfileCard({ initials, name, email, onEditProfile }) {
  return (
    <div className="rounded-2xl border border-[var(--color-ui-border)] bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-xl font-bold text-[var(--color-primary)]"
          style={{ background: 'var(--color-primary-light)' }}
          aria-hidden
        >
          {initials}
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[var(--color-ui-heading)]">{name}</h2>
        <p className="mt-1 text-sm text-[var(--color-ui-body)]">{email}</p>
        <button
          type="button"
          onClick={onEditProfile}
          className="mt-5 w-full rounded-xl border border-[var(--color-ui-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-ui-heading)] transition-colors duration-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Edit profile
        </button>
      </div>
    </div>
  );
}
