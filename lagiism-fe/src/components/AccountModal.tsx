import axios from 'axios';
import { X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { useAuthStore } from '../stores/auth.store';
import { AccountModalTab, useUiStore } from '../stores/ui.store';
import { OrderDto } from '../types/api';
import { formatVND } from '../utils/storeLogic';

const PHONE_REGEX = /^[0-9+\-\s().]{8,20}$/;

export function AccountModal() {
  const { isAccountModalOpen, accountModalTab, closeAccountModal, openAuthModal } =
    useUiStore();
  const { user, setUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<AccountModalTab>(accountModalTab);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [defaultCity, setDefaultCity] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAccountModalOpen || !user) return;
    setActiveTab(accountModalTab);
    setStatusMessage(null);
    setErrorMessage(null);
    setPhoneError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');

    let active = true;
    setLoadingData(true);
    Promise.allSettled([
      userService.getProfile(),
      userService.getOrderHistory(),
    ]).then(([profileRes, ordersRes]) => {
      if (!active) return;
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const p = profileRes.value;
        setFullName(p.fullName || '');
        setPhone(p.phone || '');
        setDefaultAddress(p.defaultAddress || '');
        setDefaultCity(p.defaultCity || '');
        setUser(p);
      } else {
        setFullName(user.fullName || '');
        setPhone(user.phone || '');
        setDefaultAddress(user.defaultAddress || '');
        setDefaultCity(user.defaultCity || '');
      }
      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value);
      }
      setLoadingData(false);
    });

    return () => {
      active = false;
    };
  }, [isAccountModalOpen, accountModalTab, user?.id]);

  useEffect(() => {
    if (!isAccountModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAccountModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isAccountModalOpen, closeAccountModal]);

  if (!isAccountModalOpen || !user) return null;

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setPhoneError(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }
    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      setPhoneError('Enter a valid phone number (8–20 digits, e.g. 0901234567).');
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        fullName: trimmedName,
        phone: trimmedPhone,
        defaultAddress: defaultAddress.trim(),
        defaultCity: defaultCity.trim(),
      });
      setUser(updated);
      setStatusMessage('Default profile information saved.');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to update profile.'
        : 'Failed to update profile.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      await logout();
      closeAccountModal();
      openAuthModal('LOGIN');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to change password.'
        : 'Failed to change password.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAccountModal();
      }}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-2xl bg-white text-black border border-black p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeAccountModal}
          aria-label="Close account modal"
          className="absolute top-4 right-4 p-1.5 border border-transparent hover:border-black cursor-pointer"
        >
          <X size={18} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#555555]">
          LAGIISM // MEMBER ARCHIVE
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
          <h2
            id="account-modal-title"
            className="text-2xl font-black uppercase tracking-[-0.03em]"
          >
            {user.fullName}
          </h2>
          <span className="font-mono text-[11px] text-[#555555]">{user.email}</span>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('PROFILE');
              setStatusMessage(null);
              setErrorMessage(null);
            }}
            className={`py-2.5 font-mono text-xs font-bold uppercase border border-black cursor-pointer transition-colors ${
              activeTab === 'PROFILE'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
            }`}
          >
            DEFAULT INFO
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ORDERS');
              setStatusMessage(null);
              setErrorMessage(null);
            }}
            className={`py-2.5 font-mono text-xs font-bold uppercase border border-black cursor-pointer transition-colors ${
              activeTab === 'ORDERS'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
            }`}
          >
            HISTORY ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('PASSWORD');
              setStatusMessage(null);
              setErrorMessage(null);
            }}
            className={`py-2.5 font-mono text-xs font-bold uppercase border border-black cursor-pointer transition-colors ${
              activeTab === 'PASSWORD'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
            }`}
          >
            PASSWORD
          </button>
        </div>

        {loadingData ? (
          <div className="py-14 text-center font-mono text-xs uppercase text-[#555555]">
            LOADING ACCOUNT DATA...
          </div>
        ) : activeTab === 'PROFILE' ? (
          <form onSubmit={handleSaveProfile} noValidate className="mt-6 space-y-4">
            {statusMessage && (
              <div className="border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs">
                {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div className="border border-red-700 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase mb-1">
                  Default Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="0901 234 567"
                  className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${
                    phoneError ? 'border-red-700 bg-red-50/40' : 'border-black'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 font-mono text-[11px] text-red-700">{phoneError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                Default Shipping Address
              </label>
              <input
                type="text"
                value={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.value)}
                placeholder="Street number, ward, district..."
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                City / Province
              </label>
              <input
                type="text"
                value={defaultCity}
                onChange={(e) => setDefaultCity(e.target.value)}
                placeholder="TP.HCM / La Gi, Bình Thuận"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#222222] disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'SAVING...' : 'SAVE DEFAULT INFO'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  closeAccountModal();
                }}
                className="border border-black px-5 py-3 font-mono text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                SIGN OUT
              </button>
            </div>
          </form>
        ) : activeTab === 'PASSWORD' ? (
          <form onSubmit={handleChangePassword} noValidate className="mt-6 space-y-4">
            {errorMessage && (
              <div className="border border-red-700 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <p className="font-mono text-[11px] text-[#555555]">
              Updating your password revokes your current session token in Redis. You will be asked to sign in again.
            </p>

            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                Current Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#222222] disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="border border-black bg-[#F4F4F4] p-10 text-center">
                <p className="font-mono text-xs uppercase font-bold">
                  NO ORDERS IN YOUR ARCHIVE YET
                </p>
                <p className="font-mono text-[11px] text-[#555555] mt-2">
                  Completed orders will appear here with shipping details and item specs.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-black p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E0E0E0]">
                    <div>
                      <span className="font-mono text-xs font-bold uppercase">
                        {order.orderCode}
                      </span>
                      <span className="ml-3 font-mono text-[10px] uppercase text-[#555555]">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className="border border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold uppercase">{item.productName}</span>
                          <span className="font-mono text-[11px] text-[#555555] ml-2">
                            SIZE {item.size} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-mono shrink-0">
                          {formatVND(item.unitPriceVnd * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E0E0E0] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="text-[#555555]">
                      {order.recipientPhone} · {order.shippingAddress}
                      {order.shippingCity ? `, ${order.shippingCity}` : ''}
                    </span>
                    <span className="font-bold text-black">
                      TOTAL: {formatVND(order.totalVnd)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
