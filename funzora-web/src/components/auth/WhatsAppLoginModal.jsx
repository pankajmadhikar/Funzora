import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/apiService';
import { LS_USER_PHONE } from '../../constants/guestPhone';

/**
 * WhatsApp identity for guests (no JWT). Persists LS_USER_PHONE on success.
 */
export default function WhatsAppLoginModal({ open, title, subtitle, onClose, onSuccess }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(LS_USER_PHONE);
      setInput(raw?.replace(/\D/g, '').slice(0, 10) || '');
    } catch {
      setInput('');
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    const digits = input.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    try {
      setBusy(true);
      await apiService.whatsappLogin(digits);
    } catch (err) {
      toast.error(err.message || 'Could not continue');
      return;
    } finally {
      setBusy(false);
    }
    onSuccess(digits);
    toast.success('Your WhatsApp number is saved.');
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="wz-login-title">
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close" />
      <div className="relative z-[601] w-full max-w-[400px] rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl" style={{ fontFamily: "'Poppins',system-ui,sans-serif" }}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDECEC] text-[#F17A7E]">
          <MessageCircle size={24} strokeWidth={2} aria-hidden />
        </div>
        <h2 id="wz-login-title" className="text-center text-lg font-semibold text-[#1F2937]">
          {title || 'View your cart'}
        </h2>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-[#6B7280]">
          {subtitle || 'Enter your WhatsApp number to view your cart.'}
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label htmlFor="wz-login-phone" className="sr-only">
            WhatsApp mobile number
          </label>
          <input
            id="wz-login-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="h-12 w-full rounded-xl border border-[#E5E7EB] px-4 text-[15px] text-[#1F2937] outline-none transition-[border-color] focus:border-[#F17A7E]"
          />
          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#F17A7E] text-[15px] font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Please wait…' : 'Continue'}
          </button>
        </form>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-center text-[13px] font-medium text-[#6B7280] underline-offset-2 hover:text-[#1F2937] hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
