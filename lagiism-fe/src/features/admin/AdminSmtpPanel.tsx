import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { SmtpConfigDto } from '../../types/api';

interface AdminSmtpPanelProps {
  smtp: SmtpConfigDto | null;
  onUpdated: (config: SmtpConfigDto) => void;
}

export function AdminSmtpPanel({ smtp, onUpdated }: AdminSmtpPanelProps) {
  const [host, setHost] = useState(smtp?.host || 'smtp.gmail.com');
  const [port, setPort] = useState(smtp?.port || 587);
  const [username, setUsername] = useState(smtp?.username || '');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState(smtp?.fromEmail || '');
  const [fromName, setFromName] = useState(smtp?.fromName || 'LAGIISM');
  const [useTls, setUseTls] = useState(smtp?.useTls ?? true);
  const [useSsl, setUseSsl] = useState(smtp?.useSsl ?? false);
  const [enabled, setEnabled] = useState(smtp?.enabled ?? true);

  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!smtp) return;
    setHost(smtp.host);
    setPort(smtp.port);
    setUsername(smtp.username);
    setFromEmail(smtp.fromEmail);
    setFromName(smtp.fromName);
    setUseTls(smtp.useTls);
    setUseSsl(smtp.useSsl);
    setEnabled(smtp.enabled);
  }, [smtp]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setError(null);
    setSaving(true);
    try {
      const updated = await adminService.updateSmtpConfig({
        host: host.trim(),
        port: Number(port),
        username: username.trim(),
        password: password.trim() || undefined,
        fromEmail: fromEmail.trim(),
        fromName: fromName.trim(),
        useTls,
        useSsl,
        enabled,
      });
      onUpdated(updated);
      setPassword('');
      setNotice('SMTP configuration saved (password encrypted with AES-256-GCM).');
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to save SMTP settings.'
          : 'Failed to save SMTP settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setError(null);
    if (!testEmail.trim()) return;
    setTesting(true);
    try {
      await adminService.sendTestEmail(testEmail.trim());
      setNotice(`Test email sent to ${testEmail.trim()}.`);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Test email failed.'
          : 'Test email failed.'
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black uppercase tracking-[-0.03em] border-b border-black pb-3">
        DYNAMIC SMTP SETUP (AES-256-GCM)
      </h2>

      {notice && (
        <div className="mt-4 border border-black bg-[#F4F4F4] px-4 py-2.5 font-mono text-xs">
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 border border-red-700 bg-red-50 px-4 py-2.5 font-mono text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 border border-black p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-mono text-[11px] uppercase mb-1">SMTP Host</label>
            <input
              type="text"
              required
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full border border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase mb-1">Port</label>
            <input
              type="number"
              required
              min={1}
              max={65535}
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="w-full border border-black px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] uppercase mb-1">
              SMTP Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-email@gmail.com"
              className="w-full border border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase mb-1">
              App Password {smtp?.hasPassword ? '(leave blank to keep current)' : '(required)'}
            </label>
            <input
              type="password"
              required={!smtp?.hasPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={smtp?.hasPassword ? '••••••••••••' : 'Enter SMTP app password'}
              className="w-full border border-black px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] uppercase mb-1">From Email</label>
            <input
              type="email"
              required
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="no-reply@lagiism.vn"
              className="w-full border border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase mb-1">From Name</label>
            <input
              type="text"
              required
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="LAGIISM"
              className="w-full border border-black px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs uppercase">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useTls}
              onChange={(e) => setUseTls(e.target.checked)}
            />
            STARTTLS (587)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useSsl}
              onChange={(e) => setUseSsl(e.target.checked)}
            />
            SSL (465)
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-bold">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            ENABLED FOR 5-MIN OTP EMAILS
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#222222] disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'SAVING...' : 'SAVE SMTP CONFIGURATION'}
        </button>
      </form>

      {/* Send Test Email */}
      <form
        onSubmit={handleSendTest}
        className="mt-6 border border-black p-6 max-w-2xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
      >
        <div className="flex-1">
          <label className="block font-mono text-[11px] uppercase mb-1">
            Verify SMTP Connection (Send Test Email)
          </label>
          <input
            type="email"
            required
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="example@lagiism.com"
            className="w-full border border-black px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={testing || !smtp?.hasPassword}
          className="border border-black bg-white text-black hover:bg-black hover:text-white px-5 py-2.5 font-mono text-xs font-bold uppercase disabled:opacity-40 cursor-pointer transition-colors"
        >
          {testing ? 'SENDING...' : 'SEND TEST EMAIL'}
        </button>
      </form>
    </div>
  );
}
