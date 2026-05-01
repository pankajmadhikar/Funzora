import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import WhatsAppLoginModal from '../components/auth/WhatsAppLoginModal';
import { LS_USER_PHONE } from '../constants/guestPhone';

/** @returns {string | null} 10-digit */
export function normalizeStoredPhone(input) {
  let digits = String(input ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) return null;
  return digits;
}

function readLsPhone() {
  try {
    return normalizeStoredPhone(localStorage.getItem(LS_USER_PHONE));
  } catch {
    return null;
  }
}

const COPY = {
  cart: {
    title: 'View your cart',
    body:
      'Enter your WhatsApp number to view your cart.',
  },
  generic: {
    title: 'Almost there ✨',
    body: 'Enter your WhatsApp number to continue. We coordinate orders on WhatsApp.',
  },
};

const GuestPhoneContext = createContext(null);

export function GuestPhoneProvider({ children }) {
  const [phone, setPhoneState] = useState(() => readLsPhone());
  const [modalOpen, setModalOpen] = useState(false);
  const [intent, setIntent] = useState(/** @type {GuestPhoneIntent} */ ('cart'));
  const pendingRef = useRef(null);

  const persistPhone = useCallback((digits) => {
    try {
      localStorage.setItem(LS_USER_PHONE, digits);
    } catch {
      /* ignore */
    }
    setPhoneState(digits);
  }, []);

  /** Ensure a 10-digit phone exists locally (shows modal only when missing). */
  const ensureGuestPhone = useCallback(
    ({ intent: nextIntent } = {}) => {
      const fromLs = readLsPhone();
      if (fromLs) {
        persistPhone(fromLs);
        return Promise.resolve(fromLs);
      }
      if (phone && normalizeStoredPhone(phone)) {
        persistPhone(phone);
        return Promise.resolve(phone);
      }
      const useIntent = nextIntent === 'generic' ? 'generic' : 'cart';
      setIntent(useIntent);
      setModalOpen(true);
      return new Promise((resolve, reject) => {
        pendingRef.current = { resolve, reject };
      });
    },
    [phone, persistPhone]
  );

  const dismissPending = useCallback(() => {
    pendingRef.current?.reject?.(new Error('cancelled'));
    pendingRef.current = null;
    setModalOpen(false);
  }, []);

  const fulfillPending = useCallback(
    (digits) => {
      persistPhone(digits);
      pendingRef.current?.resolve?.(digits);
      pendingRef.current = null;
      setModalOpen(false);
    },
    [persistPhone]
  );

  const value = useMemo(
    () => ({
      phone,
      persistPhone,
      ensureGuestPhone,
    }),
    [phone, persistPhone, ensureGuestPhone]
  );

  const copy = COPY[intent];

  return (
    <GuestPhoneContext.Provider value={value}>
      {children}
      <WhatsAppLoginModal
        open={modalOpen}
        title={copy.title}
        subtitle={copy.body}
        onClose={dismissPending}
        onSuccess={fulfillPending}
      />
    </GuestPhoneContext.Provider>
  );
}

export function useGuestPhone() {
  const ctx = useContext(GuestPhoneContext);
  if (!ctx) throw new Error('useGuestPhone must be inside GuestPhoneProvider');
  return ctx;
}

export { LS_USER_PHONE };
