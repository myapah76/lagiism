import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { catalogService } from '../../services/catalog.service';
import { cmsService } from '../../services/cms.service';
import { databaseService } from '../../services/database.service';
import { useAuthStore } from '../../stores/auth.store';
import {
  AccountDto,
  CategoryDto,
  DatabaseStatusDto,
  HomepageAggregateDto,
  OrderDto,
  ProductDto,
  SmtpConfigDto,
} from '../../types/api';
import { AdminAccountsPanel } from './AdminAccountsPanel';
import { AdminCatalogPanel } from './AdminCatalogPanel';
import { AdminOrdersPanel } from './AdminOrdersPanel';
import { AdminSmtpPanel } from './AdminSmtpPanel';

type AdminTab = 'OVERVIEW' | 'ORDERS' | 'CATALOG' | 'CMS' | 'ACCOUNTS' | 'SMTP' | 'DATABASE';

export function AdminDashboardPage() {
  const { user, initialized, checkSession, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [homepage, setHomepage] = useState<HomepageAggregateDto | null>(null);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [smtp, setSmtp] = useState<SmtpConfigDto | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatusDto | null>(null);
  const [orderForUser, setOrderForUser] = useState<AccountDto | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      checkSession();
    }
  }, [initialized, checkSession]);

  const loadCatalog = useCallback(async () => {
    const [prodRes, catRes] = await Promise.allSettled([
      catalogService.listAdminProducts(),
      catalogService.listAdminCategories(),
    ]);
    if (prodRes.status === 'fulfilled') setProducts(prodRes.value);
    if (catRes.status === 'fulfilled') setCategories(catRes.value);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await adminService.listOrders());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      catalogService.listAdminProducts(),
      catalogService.listAdminCategories(),
      adminService.listOrders(),
      cmsService.getPublicHomepage(),
      adminService.listAccounts(),
      adminService.getSmtpConfig(),
      databaseService.getStatus(),
    ]).then(([prodRes, catRes, ordRes, cmsRes, accRes, smtpRes, dbRes]) => {
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value);
      if (catRes.status === 'fulfilled') setCategories(catRes.value);
      if (ordRes.status === 'fulfilled') setOrders(ordRes.value);
      if (cmsRes.status === 'fulfilled') setHomepage(cmsRes.value);
      if (accRes.status === 'fulfilled') setAccounts(accRes.value);
      if (smtpRes.status === 'fulfilled') setSmtp(smtpRes.value);
      if (dbRes.status === 'fulfilled') setDbStatus(dbRes.value);
    });
  }, [user]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase">
        VERIFYING SESSION...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const hasAdminAccess =
    user.role === 'ADMIN' ||
    user.role === 'STAFF' ||
    (user.roles || []).some((r) => r === 'ADMIN' || r === 'STAFF');

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  const handleExportDb = async () => {
    setNotice(null);
    try {
      const blob = await databaseService.exportSqlDump();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lagiism-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice('Database SQL dump exported.');
    } catch {
      setNotice('SQL export requires PostgreSQL runtime with pg_dump.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-black p-6 flex flex-col justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#555555]">
            LAGIISM // ADMIN
          </p>
          <h1 className="text-xl font-black uppercase tracking-[-0.03em] mt-1">
            CONTROL PANEL
          </h1>
          <p className="font-mono text-[11px] text-[#555555] mt-2 break-all">
            {user.email} ({user.role})
          </p>

          <nav className="mt-6 flex flex-col gap-1.5">
            {(
              ['OVERVIEW', 'ORDERS', 'CATALOG', 'ACCOUNTS', 'CMS', 'SMTP', 'DATABASE'] as AdminTab[]
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`text-left px-3 py-2 font-mono text-xs uppercase border cursor-pointer transition-colors ${
                  activeTab === tab
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-[#E0E0E0] hover:border-black'
                }`}
              >
                {tab === 'CATALOG'
                  ? 'PRODUCTS & CATEGORIES'
                  : tab === 'ACCOUNTS'
                    ? 'USERS'
                    : tab}
              </button>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="mt-8 w-full border border-black py-2.5 font-mono text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          SIGN OUT
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {notice && (
          <div className="mb-6 border border-black bg-[#F4F4F4] px-4 py-2.5 font-mono text-xs">
            {notice}
          </div>
        )}

        {activeTab === 'OVERVIEW' && (
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[-0.03em] border-b border-black pb-3">
              SYSTEM OVERVIEW
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="border border-black p-5">
                <p className="font-mono text-[11px] uppercase text-[#555555]">ORDERS</p>
                <p className="text-3xl font-black mt-2">{orders.length}</p>
              </div>
              <div className="border border-black p-5">
                <p className="font-mono text-[11px] uppercase text-[#555555]">PRODUCTS</p>
                <p className="text-3xl font-black mt-2">{products.length}</p>
              </div>
              <div className="border border-black p-5">
                <p className="font-mono text-[11px] uppercase text-[#555555]">USERS</p>
                <p className="text-3xl font-black mt-2">{accounts.length}</p>
              </div>
              <div className="border border-black p-5">
                <p className="font-mono text-[11px] uppercase text-[#555555]">DATABASE ENGINE</p>
                <p className="text-lg font-black mt-2">
                  {dbStatus?.databaseProduct || 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <AdminOrdersPanel
            orders={orders}
            accounts={accounts}
            products={products}
            preselectedUser={orderForUser}
            onClearPreselectedUser={() => setOrderForUser(null)}
            onRefresh={loadOrders}
          />
        )}

        {activeTab === 'CATALOG' && (
          <AdminCatalogPanel
            products={products}
            categories={categories}
            onRefresh={loadCatalog}
          />
        )}

        {activeTab === 'ACCOUNTS' && (
          <AdminAccountsPanel
            accounts={accounts}
            onCreateOrderForUser={(targetUser) => {
              setOrderForUser(targetUser);
              setActiveTab('ORDERS');
            }}
          />
        )}

        {activeTab === 'CMS' && (
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[-0.03em] border-b border-black pb-3">
              CMS HOMEPAGE AGGREGATE
            </h2>
            <div className="mt-6 space-y-4 font-mono text-xs">
              <div className="border border-black p-4">
                <p className="text-[#555555] uppercase">HERO HEADLINE</p>
                <p className="text-base font-bold mt-1">{homepage?.hero?.headline || 'N/A'}</p>
              </div>
              <div className="border border-black p-4">
                <p className="text-[#555555] uppercase">
                  SECTIONS ({homepage?.sections.length || 0}) &amp; REVIEWS (
                  {homepage?.reviews.length || 0})
                </p>
                <p className="mt-1">
                  Settings keys loaded: {Object.keys(homepage?.settings || {}).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SMTP' && <AdminSmtpPanel smtp={smtp} onUpdated={setSmtp} />}

        {activeTab === 'DATABASE' && (
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[-0.03em] border-b border-black pb-3">
              DATABASE OPERATIONS
            </h2>
            <div className="mt-6 border border-black p-5 font-mono text-xs space-y-3">
              <p>
                Engine: <strong>{dbStatus?.databaseProduct}</strong> ({dbStatus?.databaseVersion})
              </p>
              <p>Healthy: {dbStatus?.healthy ? 'UP' : 'DOWN'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {Object.entries(dbStatus?.tableCounts || {}).map(([table, count]) => (
                  <div key={table} className="border border-[#E0E0E0] p-2">
                    <div className="text-[10px] text-[#555555]">{table}</div>
                    <div className="text-sm font-bold">{count}</div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleExportDb}
                className="mt-4 bg-black text-white px-5 py-2.5 font-mono text-xs font-bold uppercase cursor-pointer"
              >
                EXPORT PG_DUMP (.SQL)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
