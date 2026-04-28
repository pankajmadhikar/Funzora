import React from 'react';

export default function AccountLayout({ title = 'My Account', sidebar, children }) {
  return (
    <div className="min-h-[calc(100vh-8rem)] w-full bg-[var(--color-ui-bg-muted)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ui-heading)] sm:text-[1.65rem]">
          {title}
        </h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(260px,280px)_1fr] lg:items-start">
          <aside className="min-w-0 lg:sticky lg:top-24">{sidebar}</aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
