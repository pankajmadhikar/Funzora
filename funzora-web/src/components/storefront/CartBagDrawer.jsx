import React, { useEffect, useCallback, useState } from 'react';
import { Drawer, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { setCartItems } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import { enrichProduct } from '../../utils/enrichProduct';
import { FREE_SHIP_AT, SHIPPING_FLAT } from '../../config/toyStore';

const ICON = { size: 18, strokeWidth: 2 };

export default function CartBagDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartPayload = useSelector((s) => s.cart.cartItems);
  const items = cartPayload?.items || [];
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getCartItems();
      if (res?.data) dispatch(setCartItems(res.data));
    } catch {
      dispatch(setCartItems({ items: [] }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const cartCount = items.reduce((a, i) => a + (i.quantity || 0), 0);
  const cartSub = items.reduce((a, i) => {
    const p = i.productId?.price ?? 0;
    return a + p * (i.quantity || 0);
  }, 0);
  const toFree = Math.max(0, FREE_SHIP_AT - cartSub);
  const ship = cartSub >= FREE_SHIP_AT ? 0 : SHIPPING_FLAT;
  const total = cartSub + ship;

  const updQty = async (item, action) => {
    const pid = item.productId?._id;
    if (!pid) return;
    try {
      setBusy(true);
      await apiService.updateCartItem(pid, action);
      await refresh();
      toast.success('Cart updated');
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    const pid = item.productId?._id;
    if (!pid) return;
    try {
      setBusy(true);
      await apiService.removeCartItem(pid);
      await refresh();
      toast.success('Removed');
    } catch (e) {
      toast.error(e.message || 'Remove failed');
    } finally {
      setBusy(false);
    }
  };

  const font = "font-['Poppins',system-ui,sans-serif]";

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className={`fixed inset-0 z-[499] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      />
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        TransitionProps={{ timeout: 320 }}
        PaperProps={{
          className: `${font} !flex !h-full !max-h-full !max-w-full !flex-col !overflow-hidden !bg-white !shadow-[-8px_0_40px_rgba(0,0,0,0.08)]`,
          sx: {
            width: { xs: '100%', sm: 400 },
            zIndex: 500,
          },
        }}
        ModalProps={{ keepMounted: true }}
        sx={{ zIndex: 500 }}
      >
        <div
          className={`${font} flex min-h-0 flex-1 flex-col bg-white text-[#1F2937]`}
          style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div className="flex items-center gap-3">
              <ShoppingBag size={ICON.size} strokeWidth={ICON.strokeWidth} className="shrink-0 text-[#F17A7E]" aria-hidden />
              <h2 className="text-[20px] font-semibold leading-tight text-[#1F2937]">
                My Bag{' '}
                <span className="text-[13px] font-normal text-[#6B7280]">({cartCount})</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#FDECEC] hover:text-[#1F2937]"
              aria-label="Close cart"
            >
              <X size={ICON.size} strokeWidth={ICON.strokeWidth} />
            </button>
          </header>

          {/* Free shipping / progress — soft pink band */}
          {cartSub > 0 && toFree > 0 && (
            <div className="shrink-0 border-b border-[#E5E7EB] bg-[#FDECEC] px-6 py-3">
              <p className="text-center text-[13px] font-normal leading-snug text-[#F17A7E]">
                Add <span className="font-semibold">{formatPrice(toFree)}</span> more for{' '}
                <span className="font-semibold text-[#22C55E]">FREE</span> shipping
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-[#F17A7E] transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.min(100, (cartSub / FREE_SHIP_AT) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {cartSub >= FREE_SHIP_AT && cartSub > 0 && (
            <div className="shrink-0 border-b border-[#E5E7EB] bg-[#FDECEC] px-6 py-3 text-center text-[13px] font-normal text-[#F17A7E]">
              You&apos;ve unlocked free shipping!
            </div>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-16">
              <CircularProgress size={32} sx={{ color: '#F17A7E' }} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center">
              <ShoppingBag size={40} strokeWidth={ICON.strokeWidth} className="text-[#F17A7E] opacity-90" aria-hidden />
              <p className="text-[20px] font-semibold text-[#1F2937]">Your bag is empty</p>
              <p className="max-w-[260px] text-[13px] font-normal leading-relaxed text-[#6B7280]">
                Explore toys curated for joy — add something special from the shop.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
                className="mt-2 h-12 rounded-full bg-[#F17A7E] px-8 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Shop now
              </button>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                <ul className="flex flex-col gap-0">
                  {items.filter((i) => i.productId).map((item, idx, arr) => {
                    const raw = item.productId;
                    const ep = enrichProduct(raw);
                    const u = ep?._ui;
                    const lineKey = item._id || raw._id;
                    return (
                      <li
                        key={lineKey}
                        className={`flex gap-4 py-4 ${idx < arr.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FDECEC]">
                          {raw.images?.[0] ? (
                            <img src={raw.images[0]} alt="" className="h-full w-full object-contain p-1" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-2xl" aria-hidden>
                              {u?.emoji || '·'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[16px] font-medium leading-snug text-[#1F2937]">{raw.name}</p>
                          <p className="mt-1 text-[16px] font-semibold text-[#F17A7E]">{formatPrice(raw.price)}</p>
                          <div className="mt-3 inline-flex h-12 items-stretch overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                            <button
                              type="button"
                              disabled={busy || item.quantity <= 1}
                              onClick={() => updQty(item, 'decrease')}
                              className="flex w-12 items-center justify-center text-[#1F2937] transition-colors hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <span className="text-lg font-medium leading-none">−</span>
                            </button>
                            <span className="flex min-w-[3rem] items-center justify-center border-x border-[#E5E7EB] text-[15px] font-semibold text-[#1F2937]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => updQty(item, 'increase')}
                              className="flex w-12 items-center justify-center text-[#1F2937] transition-colors hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <span className="text-lg font-medium leading-none">+</span>
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(item)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-full text-[#6B7280] transition-colors hover:bg-[#FDECEC] hover:text-[#F17A7E]"
                          aria-label="Remove item"
                        >
                          <Trash2 size={ICON.size} strokeWidth={ICON.strokeWidth} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sticky summary + CTAs */}
              <footer className="shrink-0 border-t border-[#E5E7EB] bg-[#FFFFFF] px-6 pb-6 pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between text-[13px] font-normal text-[#6B7280]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1F2937]">{formatPrice(cartSub)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px] font-normal text-[#6B7280]">
                  <span>Shipping</span>
                  <span className={`font-semibold ${ship === 0 ? 'text-[#22C55E]' : 'text-[#1F2937]'}`}>
                    {ship === 0 ? 'FREE' : formatPrice(ship)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#E5E7EB] pt-4">
                  <span className="text-[18px] font-bold text-[#1F2937]">Total</span>
                  <span className="text-[18px] font-bold text-[#F17A7E]">{formatPrice(total)}</span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#F17A7E] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Checkout →
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[15px] font-semibold text-[#1F2937] transition-colors hover:bg-[#F9FAFB]"
                >
                  Continue shopping
                </button>
              </footer>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
}
