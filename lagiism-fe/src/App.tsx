import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StorefrontApp } from './features/home/StorefrontApp';

const AdminDashboardPage = lazy(() =>
  import('./features/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const AdminLoginPage = lazy(() =>
  import('./features/admin/AdminLoginPage').then((m) => ({
    default: m.AdminLoginPage,
  }))
);
const UserAuthPage = lazy(() =>
  import('./features/auth/UserAuthPage').then((m) => ({
    default: m.UserAuthPage,
  }))
);

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#6E6D68] flex items-center justify-center font-mono text-xs uppercase tracking-[0.14em]">
      LOADING...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<StorefrontApp />} />
          <Route path="/shop" element={<StorefrontApp />} />
          <Route path="/shop/:categorySlug" element={<StorefrontApp />} />
          <Route path="/product/:slug" element={<StorefrontApp />} />
          <Route path="/about" element={<StorefrontApp />} />
          <Route path="/login" element={<UserAuthPage initialMode="LOGIN" />} />
          <Route path="/register" element={<UserAuthPage initialMode="REGISTER" />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
