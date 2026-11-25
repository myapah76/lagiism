import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AdminLoginPage } from './features/admin/AdminLoginPage';
import { UserAuthPage } from './features/auth/UserAuthPage';
import { StorefrontApp } from './features/home/StorefrontApp';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
