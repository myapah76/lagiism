import axios from 'axios';
import { Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { AccountDto, OrderDto, ProductDto } from '../../types/api';
import { formatVND } from '../../utils/storeLogic';

interface AdminOrdersPanelProps {
  orders: OrderDto[];
  accounts: AccountDto[];
  products: ProductDto[];
  preselectedUser?: AccountDto | null;
  onClearPreselectedUser: () => void;
  onRefresh: () => Promise<void>;
}

interface DraftOrderItem {
  productId: number;
  size: string;
  quantity: number;
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
const ORDER_SOURCES = ['INSTAGRAM', 'WEBSITE', 'FACEBOOK', 'ZALO', 'WALK_IN'];

export function AdminOrdersPanel({
  orders,
  accounts,
  products,
  preselectedUser,
  onClearPreselectedUser,
  onRefresh,
}: AdminOrdersPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [customerMode, setCustomerMode] = useState<'USER' | 'GUEST'>('GUEST');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [orderSource, setOrderSource] = useState('INSTAGRAM');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [note, setNote] = useState('');
  const [draftItems, setDraftItems] = useState<DraftOrderItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initDefaultItem = () => {
    if (products.length > 0) {
      setDraftItems([{ productId: products[0].id, size: 'L', quantity: 1 }]);
    } else {
      setDraftItems([]);
    }
  };

  // Auto-open modal when jumped from Users tab "+ ORDER"
  useEffect(() => {
    if (!preselectedUser) return;
    setCustomerMode('USER');
    setSelectedUserId(String(preselectedUser.id));
    setOrderSource('INSTAGRAM');
    setRecipientName(preselectedUser.fullName || '');
    setRecipientPhone(preselectedUser.phone || '');
    setShippingAddress(preselectedUser.defaultAddress || '');
    setShippingCity(preselectedUser.defaultCity || '');
    setNote('');
    setError(null);
    initDefaultItem();
    setShowCreateModal(true);
    onClearPreselectedUser();
  }, [preselectedUser]);

  useEffect(() => {
    if (!showCreateModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCreateModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showCreateModal]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSource =
        sourceFilter === 'ALL' || o.orderSource.toUpperCase() === sourceFilter;
      if (!matchesSource) return false;
      if (!q) return true;
      return (
        o.orderCode.toLowerCase().includes(q) ||
        o.recipientName.toLowerCase().includes(q) ||
        o.recipientPhone.toLowerCase().includes(q) ||
        (o.userEmail || '').toLowerCase().includes(q)
      );
    });
  }, [orders, searchQuery, sourceFilter]);

  const draftTotal = useMemo(() => {
    return draftItems.reduce((sum, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return sum + (p ? p.priceVnd * item.quantity : 0);
    }, 0);
  }, [draftItems, products]);

  const handleSelectUserDropdown = (userIdStr: string) => {
    setSelectedUserId(userIdStr);
    const u = accounts.find((acc) => String(acc.id) === userIdStr);
    if (u) {
      setRecipientName(u.fullName || '');
      setRecipientPhone(u.phone || '');
      setShippingAddress(u.defaultAddress || '');
      setShippingCity(u.defaultCity || '');
    }
  };

  const handleOpenNewOrder = () => {
    setCustomerMode('GUEST');
    setSelectedUserId('');
    setOrderSource('INSTAGRAM');
    setPaymentMethod('COD');
    setRecipientName('');
    setRecipientPhone('');
    setShippingAddress('');
    setShippingCity('');
    setNote('');
    setError(null);
    initDefaultItem();
    setShowCreateModal(true);
  };

  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (draftItems.length === 0) {
      setError('Add at least one product to the order.');
      return;
    }

    const mappedItems = draftItems
      .map((di) => {
        const p = products.find((prod) => prod.id === di.productId);
        if (!p) return null;
        return {
          productSlug: p.slug,
          productName: p.name,
          size: di.size,
          colorName: p.colorName,
          unitPriceVnd: p.priceVnd,
          quantity: di.quantity,
          imageUrl: p.imageUrl,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    setSaving(true);
    try {
      const created = await adminService.createOrder({
        userId: customerMode === 'USER' && selectedUserId ? Number(selectedUserId) : null,
        orderSource,
        paymentMethod,
        status: 'CONFIRMED',
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity: shippingCity.trim() || undefined,
        note: note.trim() || undefined,
        items: mappedItems,
      });
      setShowCreateModal(false);
      setNotice(`Created order ${created.orderCode} (${created.orderSource}).`);
      await onRefresh();
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to create order.'
          : 'Failed to create order.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    setError(null);
    setNotice(null);
    try {
      const updated = await adminService.updateOrderStatus(orderId, status);
      setNotice(`Order ${updated.orderCode} updated to ${updated.status}.`);
      await onRefresh();
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to update status.'
          : 'Failed to update status.'
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-black pb-3">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-[-0.03em]">
            ORDERS ({filteredOrders.length})
          </h2>
          <p className="font-mono text-[11px] uppercase text-[#555555] mt-1">
            WEBSITE CHECKOUTS, REGISTERED MEMBERS &amp; INSTAGRAM / MANUAL ORDERS
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNewOrder}
          className="bg-black text-white px-4 py-2.5 font-mono text-xs font-bold uppercase cursor-pointer self-start lg:self-auto"
        >
          + CREATE ORDER (USER / IG GUEST)
        </button>
      </div>

      {notice && (
        <div className="mt-4 border border-black bg-[#F4F4F4] px-4 py-2.5 font-mono text-xs">
          {notice}
        </div>
      )}
      {error && !showCreateModal && (
        <div className="mt-4 border border-red-700 bg-red-50 px-4 py-2.5 font-mono text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Search & Source Filter */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH ORDER CODE, NAME, PHONE..."
          className="border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs uppercase text-black placeholder:text-[#767676] w-72"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
        >
          <option value="ALL">ALL CHANNELS</option>
          {ORDER_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse border border-black text-left text-xs">
          <thead className="bg-[#F4F4F4] font-mono uppercase">
            <tr>
              <th className="border border-black p-2.5">Code</th>
              <th className="border border-black p-2.5">Channel</th>
              <th className="border border-black p-2.5">Customer / Phone</th>
              <th className="border border-black p-2.5">Items</th>
              <th className="border border-black p-2.5">Total</th>
              <th className="border border-black p-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-black p-8 text-center font-mono text-[#555555] uppercase"
                >
                  NO ORDERS FOUND
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td className="border border-black p-2.5 font-mono font-bold whitespace-nowrap">
                    <div>{o.orderCode}</div>
                    <div className="text-[10px] font-normal text-[#555555]">
                      {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="border border-black p-2.5 font-mono">
                    <div>{o.orderSource}</div>
                    <div className="text-[10px] text-[#555555]">
                      {o.userId ? 'MEMBER' : 'GUEST'} · {o.paymentMethod}
                    </div>
                  </td>
                  <td className="border border-black p-2.5">
                    <div className="font-bold">{o.recipientName}</div>
                    <div className="font-mono text-[11px] text-[#555555]">
                      {o.recipientPhone}
                    </div>
                    <div className="text-[11px] text-[#555555] truncate max-w-[220px]">
                      {o.shippingAddress}
                    </div>
                  </td>
                  <td className="border border-black p-2.5 font-mono text-[11px]">
                    {o.items.map((item) => (
                      <div key={item.id}>
                        {item.productName} ({item.size} × {item.quantity})
                      </div>
                    ))}
                  </td>
                  <td className="border border-black p-2.5 font-mono font-bold whitespace-nowrap">
                    {formatVND(o.totalVnd)}
                  </td>
                  <td className="border border-black p-2.5">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="border border-black bg-white px-2 py-1 font-mono text-[11px] font-bold uppercase cursor-pointer"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Blurred Popup Modal for Creating Order (User OR Non-User / Instagram) */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-2xl bg-white text-black border border-black p-6 md:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              aria-label="Close create order modal"
              className="absolute top-4 right-4 p-1.5 border border-transparent hover:border-black cursor-pointer"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#555555]">
              LAGIISM // MANUAL ORDER ENTRY
            </p>
            <h3 className="text-xl font-black uppercase tracking-[-0.03em] mt-1">
              CREATE ORDER
            </h3>

            {/* Toggle Registered User vs Guest / Instagram Non-User */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('GUEST');
                  setSelectedUserId('');
                }}
                className={`py-2 font-mono text-xs font-bold uppercase border border-black cursor-pointer ${
                  customerMode === 'GUEST'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                NON-USER / INSTAGRAM GUEST
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('USER')}
                className={`py-2 font-mono text-xs font-bold uppercase border border-black cursor-pointer ${
                  customerMode === 'USER'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                REGISTERED USER
              </button>
            </div>

            {error && (
              <div className="mt-4 border border-red-700 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
              {customerMode === 'USER' && (
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Select Registered User
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => handleSelectUserDropdown(e.target.value)}
                    className="w-full border border-black bg-white px-3 py-2 text-xs font-mono"
                  >
                    <option value="">-- CHOOSE USER --</option>
                    {accounts.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {u.fullName} ({u.phone || u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Order Channel
                  </label>
                  <select
                    value={orderSource}
                    onChange={(e) => setOrderSource(e.target.value)}
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  >
                    {ORDER_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'BANK')}
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  >
                    <option value="COD">COD (CASH ON DELIVERY)</option>
                    <option value="BANK">BANK TRANSFER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Recipient Name
                  </label>
                  <input
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full border border-black px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="w-full border border-black px-2.5 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Shipping Address
                  </label>
                  <input
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full border border-black px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    City / Province
                  </label>
                  <input
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="TP.HCM"
                    className="w-full border border-black px-2.5 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Order Line Items */}
              <div className="border border-black p-3 space-y-2.5 bg-[#FAFAFA]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase">
                    ORDER ITEMS
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (products.length > 0) {
                        setDraftItems((prev) => [
                          ...prev,
                          { productId: products[0].id, size: 'L', quantity: 1 },
                        ]);
                      }
                    }}
                    className="inline-flex items-center gap-1 font-mono text-[11px] uppercase underline cursor-pointer"
                  >
                    <Plus size={12} /> ADD ITEM
                  </button>
                </div>

                {draftItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const pid = Number(e.target.value);
                        setDraftItems((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, productId: pid } : row
                          )
                        );
                      }}
                      className="col-span-6 border border-black bg-white px-2 py-1.5 text-xs"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatVND(p.priceVnd)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.size}
                      onChange={(e) =>
                        setDraftItems((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, size: e.target.value } : row
                          )
                        )
                      }
                      className="col-span-2 border border-black bg-white px-2 py-1.5 font-mono text-xs"
                    >
                      {['S', 'M', 'L', 'XL'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        setDraftItems((prev) =>
                          prev.map((row, i) =>
                            i === idx
                              ? { ...row, quantity: Math.max(1, Number(e.target.value)) }
                              : row
                          )
                        )
                      }
                      className="col-span-2 border border-black bg-white px-2 py-1.5 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraftItems((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label="Remove item"
                      className="col-span-2 flex justify-center p-1.5 border border-black bg-white hover:bg-black hover:text-white cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase mb-1">
                  Note (e.g. Instagram handle @username)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="IG DM @customer_handle — express delivery"
                  className="w-full border border-black px-2.5 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black">
                <div className="font-mono text-sm font-bold">
                  TOTAL: {formatVND(draftTotal)}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="border border-black px-4 py-2.5 font-mono text-xs uppercase cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white px-6 py-2.5 font-mono text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'CREATING...' : 'CREATE ORDER'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
