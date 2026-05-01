import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconProps = { size: 18, strokeWidth: 2 };

const font = "font-['Poppins',system-ui,sans-serif]";

/**
 * Shared pastel shell for login / register: gradient, clouds, logo, centered card wrapper.
 */
export function AuthLogo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`mb-4 flex flex-col items-center gap-0.5 no-underline sm:mb-5 ${className}`}
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      <div className='flex items-center gap-2'>
        {/* <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-[#FDECEC] text-[#F17A7E] shadow-sm ring-1 ring-[#F17A7E]/15 sm:h-10 sm:w-10">
        <span className="sr-only">FunZora home</span>
      </span> */}
      <span className="mt-2 text-lg font-bold tracking-tight text-[#1F2937] sm:text-xl">FunZora</span>
      </div>
      <span className="text-[12px] font-normal text-[#6B7280] sm:text-[13px]">Play. Smile. Grow.</span>
    </Link>
  );
}

export function AuthTrustBar() {
  const items = [
    { title: 'Secure Shopping', sub: 'Your data is protected', Icon: ShieldCheck },
    { title: 'Fast Delivery', sub: 'Pan India delivery', Icon: Truck },
    { title: '100% Original', sub: 'Quality you can trust', Icon: BadgeCheck },
  ];
  return (
    <div
      className={`${font} w-full shrink-0 border-t border-[#E5E7EB] bg-[#FFFFFF] px-3 py-4 sm:px-4 sm:py-5`}
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {items.map(({ title, sub, Icon }) => (
          <div key={title} className="flex min-w-0 gap-3 text-left">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-[#F17A7E] sm:h-10 sm:w-10"
              aria-hidden
            >
              <Icon {...iconProps} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-snug text-[#1F2937] sm:text-[14px]">{title}</p>
              <p className="mt-0.5 text-[12px] font-normal leading-snug text-[#6B7280] sm:text-[13px]">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthCloudBg() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-16 top-24 h-48 w-48 rounded-full bg-white/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-32 h-56 w-56 rounded-full bg-white/45 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[15%] left-[10%] h-32 w-64 rounded-full bg-white/35 blur-2xl"
        aria-hidden
      />
    </>
  );
}

/**
 * Full viewport column: main scrolls only if form is tall; trust bar stays fixed (no horizontal scroll).
 * @param {{ children: React.ReactNode; showTrustBar?: boolean }} props
 */
export default function AuthLayout({ children, showTrustBar = false }) {
  return (
    <div
      className={`${font} relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-x-hidden overflow-y-hidden bg-gradient-to-b from-[#FFF8F8] via-[#FEF3F3] to-[#FDECEC]`}
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      <AuthCloudBg />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[440px] px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
        {showTrustBar && <AuthTrustBar />}
      </div>
    </div>
  );
}
