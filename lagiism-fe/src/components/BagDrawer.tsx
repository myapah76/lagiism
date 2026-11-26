import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { userService } from '../services/user.service';
import { useAuthStore } from '../stores/auth.store';
import { BagItem } from '../types/store';
import { calculateBagSubtotal, formatVND } from '../utils/storeLogic';

interface BagDrawerProps {
  isOpen: boolean;
  items: BagItem[];
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearBag: () => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
}) => {
  const { user } = useAuthStore();
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmedOrderCode, setConfirmedOrderCode] = useState<string | null>(
    null
  );

  // Auto-prefill shipping manifest from signed-in member's default profile
  useEffect(() => {
    if (isOpen && user) {
      setCustomerName((prev) => prev || user.fullName || '');
      setPhone((prev) => prev || user.phone || '');
      setAddress((prev) =>
        prev ||
        [user.defaultAddress, user.defaultCity].filter(Boolean).join(', ')
      );
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const subtotal = calculateBagSubtotal(items);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setFormError('REQUIRED: ENTER FULL NAME, PHONE, AND SHIPPING ADDRESS.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        recipientName: customerName.trim(),
        recipientPhone: phone.trim(),
        shippingAddress: address.trim(),
        shippingCity: user?.defaultCity || undefined,
        paymentMethod,
        items: items.map((item) => ({
          productSlug: item.productId,
          productName: item.name,
          size: item.size,
          colorName: item.colorName,
          unitPriceVnd: item.priceVnd,
          quantity: item.quantity,
          imageUrl: item.image,
        })),
      };
      const created = user
        ? await userService.placeOrder(payload)
        : await userService.placeGuestOrder(payload);
      setConfirmedOrderCode(created.orderCode);
      onClearBag();
      setCheckoutMode(false);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'UNABLE TO PLACE ORDER. PLEASE CHECK YOUR DETAILS.'
        : 'UNABLE TO PLACE ORDER. PLEASE TRY AGAIN.';
      setFormError(msg.toUpperCase());
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrderCode(null);
    setCheckoutMode(false);
    setFormError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      {/* Solid 85% Black Scrim — Zero Backdrop Blur */}
      <div
        className="fixed inset-0 bg-black/85"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sharp 1px Bordered Slide-Over Drawer */}
      <aside className="relative z-10 w-full max-w-md bg-white border-l border-black h-full flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-black flex items-center justify-between bg-white">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-black">
            SHOPPING BAG ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close shopping bag"
            className="p-1.5 border border-black text-black hover:bg-black hover:text-white cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {confirmedOrderCode ? (
            <div className="border border-black p-5 bg-[#F4F4F4] space-y-3">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#555555]">
                ORDER CONFIRMED
              </div>
              <div className="font-mono-tabular text-lg font-bold text-black">
                #{confirmedOrderCode}
              </div>
              <p className="text-xs leading-relaxed text-black">
                Thank you, {customerName.toUpperCase()}. Your LAGIISM Drop 01
                manifest is queued for dispatch from TP.HCM Atelier.
              </p>
              <div className="border-t border-black pt-3 font-mono text-[11px] uppercase text-[#444444]">
                PAYMENT: {paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'BANK TRANSFER'}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-full mt-2 bg-black text-white border border-black py-3 text-xs font-bold uppercase tracking-[0.08em] cursor-pointer"
              >
                CONTINUE BROWSING
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center border border-[#E0E0E0] bg-[#F4F4F4]">
              <p className="font-mono text-xs uppercase text-[#555555]">
                YOUR SHOPPING BAG IS EMPTY
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 bg-black text-white px-5 py-2.5 font-mono text-[11px] font-bold uppercase cursor-pointer"
              >
                EXPLORE DROP 01
              </button>
            </div>
          ) : checkoutMode ? (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black">
                <span className="font-mono text-xs font-bold uppercase">
                  SHIPPING MANIFEST
                </span>
                <button
                  type="button"
                  onClick={() => setCheckoutMode(false)}
                  className="font-mono text-[10px] uppercase underline cursor-pointer"
                >
                  EDIT BAG
                </button>
              </div>

              {formError && (
                <div className="border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-[11px] font-bold text-[#BA1A1A]">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block font-mono text-[10px] font-bold uppercase mb-1"
                >
                  FULL NAME
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-black bg-[#F4F4F4] px-3 py-2.5 text-xs uppercase text-black"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block font-mono text-[10px] font-bold uppercase mb-1"
                >
                  PHONE NUMBER (VN)
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901 234 567"
                  className="w-full border border-black bg-[#F4F4F4] px-3 py-2.5 font-mono text-xs text-black"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block font-mono text-[10px] font-bold uppercase mb-1"
                >
                  DELIVERY ADDRESS
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="QUAN 1, TP.HCM / LA GI, BINH THUAN"
                  className="w-full border border-black bg-[#F4F4F4] px-3 py-2.5 text-xs uppercase text-black"
                />
              </div>

              <div>
                <div className="font-mono text-[10px] font-bold uppercase mb-1.5">
                  PAYMENT METHOD
                </div>
                <div className="grid grid-cols-2 border border-black">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`py-2.5 font-mono text-[10px] font-bold uppercase cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    CASH ON DELIVERY
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK')}
                    className={`py-2.5 font-mono text-[10px] font-bold uppercase border-l border-black cursor-pointer ${
                      paymentMethod === 'BANK'
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    BANK TRANSFER
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white border border-black py-3.5 text-xs font-bold uppercase tracking-[0.08em] hover:bg-white hover:text-black disabled:opacity-50 cursor-pointer transition-colors"
              >
                {submitting ? 'PLACING ORDER...' : `CONFIRM ORDER — ${formatVND(subtotal)}`}
              </button>
            </form>
          ) : (
            <ul className="divide-y divide-[#E0E0E0] border-b border-[#E0E0E0]">
              {items.map((item) => (
                <li key={item.key} className="py-4 flex gap-3.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover bg-[#F4F4F4] border border-[#E0E0E0] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-[-0.02em] text-black leading-tight">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          aria-label={`Remove ${item.name} size ${item.size}`}
                          className="font-mono text-[10px] uppercase text-[#555555] hover:text-black underline shrink-0 cursor-pointer"
                        >
                          REMOVE
                        </button>
                      </div>
                      <div className="font-mono text-[10px] uppercase text-[#555555] mt-1">
                        SIZE: {item.size} // {item.colorName}
                        {item.setTag ? ` // ${item.setTag}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-black">
                        <button
                          type="button"
                          aria-label={`Decrease quantity for ${item.name}`}
                          onClick={() => onUpdateQty(item.key, -1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-[#F4F4F4] cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-mono-tabular text-xs font-bold px-2.5">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity for ${item.name}`}
                          onClick={() => onUpdateQty(item.key, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-[#F4F4F4] cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-mono-tabular text-xs font-bold text-black">
                        {formatVND(item.priceVnd * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && !checkoutMode && !confirmedOrderCode && (
          <div className="border-t border-black p-5 bg-white space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#555555]">
                SUBTOTAL (VND)
              </span>
              <span
                data-testid="bag-subtotal"
                className="font-mono-tabular text-lg font-bold text-black"
              >
                {formatVND(subtotal)}
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase text-[#555555]">
              FREE NATIONWIDE SHIPPING ON ORDERS OVER 1.000.000₫
            </p>
            <button
              type="button"
              onClick={() => setCheckoutMode(true)}
              className="w-full bg-black text-white border border-black py-3.5 text-xs font-bold uppercase tracking-[0.08em] hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
