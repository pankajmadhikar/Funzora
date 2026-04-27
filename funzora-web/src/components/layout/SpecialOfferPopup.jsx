import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const OFFER_KEY = 'offerPopupShown';
const COUPON = 'FUN10';
const SCROLL_THRESHOLD = 0.4;
const DELAY_MS = 40_000;

function readOfferDismissed() {
  try {
    return localStorage.getItem(OFFER_KEY) === '1';
  } catch {
    return false;
  }
}

function persistOfferDismissed() {
  try {
    localStorage.setItem(OFFER_KEY, '1');
  } catch {
    /* ignore */
  }
}

function scrollProgress() {
  const el = document.documentElement;
  const max = el.scrollHeight - window.innerHeight;
  if (max <= 0) return 1;
  return (window.scrollY || el.scrollTop) / max;
}

/**
 * Floating first-order offer — once per session (localStorage), 40s or 40% scroll.
 * @param {number} insetLeftPx — desktop: offset for fixed sidebar so card clears chrome
 */
export default function SpecialOfferPopup({ insetLeftPx = 0 }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const openFiredRef = useRef(false);
  const closeTimerRef = useRef(null);
  const dismissingRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    persistOfferDismissed();
    setLeaving(true);
    setAnimateIn(false);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      setLeaving(false);
      dismissingRef.current = false;
    }, 420);
  }, []);

  const fireOpen = useCallback(() => {
    if (openFiredRef.current || readOfferDismissed()) return;
    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/checkout')) {
      return;
    }
    openFiredRef.current = true;
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
  }, [location.pathname]);

  useEffect(() => {
    if (readOfferDismissed()) return undefined;

    const path = location.pathname;
    if (path === '/login' || path === '/register' || path.startsWith('/checkout')) {
      return undefined;
    }

    const onScroll = () => {
      if (scrollProgress() >= SCROLL_THRESHOLD) {
        fireOpen();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const t = window.setTimeout(() => fireOpen(), DELAY_MS);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(t);
    };
  }, [location.pathname, fireOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (location.pathname.startsWith('/checkout')) dismiss();
  }, [location.pathname, mounted, dismiss]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON);
      toast.success(`Copied ${COUPON}`);
    } catch {
      toast.error('Could not copy — try selecting the code');
    }
  };

  const onShop = () => {
    dismiss();
    navigate('/shop');
  };

  if (!mounted && !leaving) return null;

  const visible = animateIn && !leaving;

  const card = (
    <div
      className={[
        'pointer-events-auto relative w-full max-w-[300px] overflow-hidden rounded-[18px] border border-[#f5e6e0]',
        'bg-gradient-to-b from-[#fffbf7] to-[#fff0eb]',
        'shadow-[0_8px_28px_rgba(0,0,0,0.06)]',
        'transition-all duration-[420ms] ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        isDesktop ? 'w-[300px]' : '',
      ].join(' ')}
      style={{ fontFamily: 'var(--font-body, Nunito, system-ui, sans-serif)' }}
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-[#b0a8a4] transition hover:bg-white/80 hover:text-[#666]"
        aria-label="Close offer"
      >
        ✕
      </button>

      <div className="px-5 pb-4 pt-5">
        <div className="mb-1 flex items-center gap-2 text-[13px] font-extrabold tracking-tight text-[#e85d5f]">
          <span className="text-base" aria-hidden="true">🎁</span>
          Special Offer
        </div>

        <p className="text-[22px] font-extrabold leading-tight tracking-tight text-[#d94a52]">
          Get 10% OFF
        </p>
        <p className="mt-1 text-[13px] font-semibold text-[#7a726e]">On your first order</p>

        <button
          type="button"
          onClick={onCopy}
          className="mt-4 flex w-full flex-wrap items-center justify-center gap-x-1 rounded-xl border border-[#f5d4d0] bg-white/90 px-2 py-2.5 text-[13px] font-bold text-[#444] transition hover:border-[#f17a7e] hover:bg-white"
        >
          <span>Use code:</span>
          <span className="font-mono tracking-wider text-[#d94a52]">{COUPON}</span>
          <span className="text-[11px] font-extrabold uppercase text-[#f17a7e]">Tap to copy</span>
        </button>

        <button
          type="button"
          onClick={onShop}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#ff8a6a] to-[#f17a7e] py-3 text-[14px] font-extrabold text-white shadow-sm transition hover:brightness-[1.03] active:scale-[0.99]"
        >
          Shop Now →
        </button>

        <p className="mt-3 text-center text-[11px] font-semibold text-[#a89e9a]">Limited time offer</p>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div
        className="pointer-events-none fixed z-[210]"
        style={{ left: insetLeftPx + 20, bottom: 20 }}
        aria-live="polite"
      >
        {card}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[210] flex justify-center px-4"
      aria-live="polite"
    >
      {card}
    </div>
  );
}
