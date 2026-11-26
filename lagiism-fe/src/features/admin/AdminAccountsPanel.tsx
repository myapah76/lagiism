import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { AccountDto, OrderDto } from '../../types/api';
import { formatVND } from '../../utils/storeLogic';

interface AdminAccountsPanelProps {
  accounts: AccountDto[];
  onCreateOrderForUser: (user: AccountDto) => void;
}

export function AdminAccountsPanel({
  accounts,
  onCreateOrderForUser,
}: AdminAccountsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AccountDto | null>(null);
  const [userOrders, setUserOrders] = useState<OrderDto[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (u) =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  useEffect(() => {
    if (!selectedUser) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedUser(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedUser]);

  const handleViewOrders = async (user: AccountDto) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    try {
      const list = await adminService.listUserOrders(user.id);
      setUserOrders(list);
    } catch {
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black pb-3">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-[-0.03em]">
            USERS ({filteredUsers.length})
          </h2>
          <p className="font-mono text-[11px] uppercase text-[#555555] mt-1">
            SEARCH BY NAME OR PHONE TO VIEW ORDER HISTORY
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY NAME OR PHONE..."
            aria-label="Search users by name or phone number"
            className="border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs uppercase text-black placeholder:text-[#767676] w-64"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="border border-black px-3 py-2 font-mono text-xs uppercase hover:bg-black hover:text-white cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-black text-left text-xs">
          <thead className="bg-[#F4F4F4] font-mono uppercase">
            <tr>
              <th className="border border-black p-2.5">Name</th>
              <th className="border border-black p-2.5">Phone</th>
              <th className="border border-black p-2.5">Email</th>
              <th className="border border-black p-2.5">Role</th>
              <th className="border border-black p-2.5">Provider</th>
              <th className="border border-black p-2.5">Orders</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-black p-8 text-center font-mono text-[#555555] uppercase"
                >
                  NO USERS MATCH &ldquo;{searchQuery}&rdquo;
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="border border-black p-2.5 font-bold">{u.fullName}</td>
                  <td className="border border-black p-2.5 font-mono">
                    {u.phone || '—'}
                  </td>
                  <td className="border border-black p-2.5 font-mono">{u.email}</td>
                  <td className="border border-black p-2.5 font-mono">
                    {(u.roles && u.roles.length > 0 ? u.roles : [u.role]).join(', ')}
                  </td>
                  <td className="border border-black p-2.5 font-mono">
                    {u.authProvider || 'LOCAL'}
                  </td>
                  <td className="border border-black p-2.5 font-mono space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleViewOrders(u)}
                      className="underline font-bold cursor-pointer"
                    >
                      VIEW ORDERS
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateOrderForUser(u)}
                      className="underline text-[#555555] hover:text-black cursor-pointer"
                    >
                      + ORDER
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Blurred Popup Modal for Viewing Selected User's Orders */}
      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUser(null);
          }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-2xl bg-white text-black border border-black p-6 md:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              aria-label="Close user orders modal"
              className="absolute top-4 right-4 p-1.5 border border-transparent hover:border-black cursor-pointer"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#555555]">
              USER ORDER HISTORY
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-1 pb-3 border-b border-black">
              <div>
                <h3 className="text-xl font-black uppercase tracking-[-0.03em]">
                  {selectedUser.fullName}
                </h3>
                <p className="font-mono text-[11px] text-[#555555]">
                  {selectedUser.email} {selectedUser.phone ? `· ${selectedUser.phone}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = selectedUser;
                  setSelectedUser(null);
                  onCreateOrderForUser(target);
                }}
                className="bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
              >
                + CREATE ORDER
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center font-mono text-xs uppercase text-[#555555]">
                LOADING ORDERS...
              </div>
            ) : userOrders.length === 0 ? (
              <div className="mt-5 border border-black bg-[#F4F4F4] p-8 text-center font-mono text-xs uppercase text-[#555555]">
                NO ORDERS FOUND FOR THIS USER
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {userOrders.map((order) => (
                  <div key={order.id} className="border border-black p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E0E0E0]">
                      <div>
                        <span className="font-mono text-xs font-bold">{order.orderCode}</span>
                        <span className="ml-2 font-mono text-[10px] uppercase border border-[#E0E0E0] px-1.5 py-0.5">
                          {order.orderSource}
                        </span>
                        <span className="ml-2 font-mono text-[10px] text-[#555555]">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <span className="border border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span>
                            <strong>{item.productName}</strong>{' '}
                            <span className="font-mono text-[11px] text-[#555555]">
                              ({item.size} × {item.quantity})
                            </span>
                          </span>
                          <span className="font-mono">
                            {formatVND(item.unitPriceVnd * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-[#E0E0E0] flex flex-wrap justify-between gap-2 font-mono text-[11px]">
                      <span className="text-[#555555]">
                        {order.recipientPhone} · {order.shippingAddress}
                      </span>
                      <span className="font-bold">
                        {order.paymentMethod} · {formatVND(order.totalVnd)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
