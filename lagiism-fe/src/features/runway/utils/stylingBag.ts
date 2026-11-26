import { findRunwayProductById } from '../data/runwayLooks';

export const STYLING_BAG_STORAGE_KEY = 'lagiism-styling-bag-v1';
const MAX_QTY_PER_ITEM = 10;

export interface StylingBagEntry {
  variantId: string;
  productId: string;
  quantity: number;
  selectedOptions: Record<string, string>;
}

function isValidEntry(raw: unknown): raw is StylingBagEntry {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.variantId !== 'string' || !obj.variantId.trim()) return false;
  if (typeof obj.productId !== 'string' || !obj.productId.trim()) return false;
  if (typeof obj.quantity !== 'number' || !Number.isFinite(obj.quantity) || obj.quantity < 1) {
    return false;
  }
  if (!obj.selectedOptions || typeof obj.selectedOptions !== 'object') return false;
  return true;
}

export function loadStylingBag(): StylingBagEntry[] {
  try {
    const raw = window.localStorage.getItem(STYLING_BAG_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry).map((entry) => ({
      ...entry,
      quantity: Math.min(MAX_QTY_PER_ITEM, Math.max(1, Math.round(entry.quantity))),
    }));
  } catch {
    return [];
  }
}

export function saveStylingBag(entries: StylingBagEntry[]): void {
  try {
    window.localStorage.setItem(STYLING_BAG_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Gracefully ignore when storage is unavailable or full
  }
}

export function addEntriesToStylingBag(
  current: StylingBagEntry[],
  additions: StylingBagEntry[]
): StylingBagEntry[] {
  const map = new Map<string, StylingBagEntry>();
  for (const item of current) {
    map.set(item.variantId, { ...item });
  }
  for (const add of additions) {
    const existing = map.get(add.variantId);
    if (existing) {
      existing.quantity = Math.min(MAX_QTY_PER_ITEM, existing.quantity + Math.max(1, add.quantity));
    } else {
      map.set(add.variantId, {
        ...add,
        quantity: Math.min(MAX_QTY_PER_ITEM, Math.max(1, add.quantity)),
      });
    }
  }
  return Array.from(map.values());
}

export function removeEntryFromStylingBag(
  current: StylingBagEntry[],
  variantId: string
): StylingBagEntry[] {
  return current.filter((item) => item.variantId !== variantId);
}

export function getStylingBagCount(entries: StylingBagEntry[]): number {
  return entries.reduce((sum, item) => sum + item.quantity, 0);
}

export function exportStylingShortlist(entries: StylingBagEntry[]): void {
  const lines: string[] = [
    'LAGIISM — STYLING SHORTLIST',
    '========================================',
    'Note: This is a personal styling reference shortlist, not an order or payment receipt.',
    '',
  ];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  entries.forEach((entry, idx) => {
    const prod = findRunwayProductById(entry.productId);
    const name = prod ? prod.name : entry.productId;
    const opts = Object.entries(entry.selectedOptions)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    lines.push(`${idx + 1}. ${name}`);
    if (opts) lines.push(`   Options: ${opts}`);
    lines.push(`   Quantity: ${entry.quantity}`);
    if (prod?.originalUrl && prod.originalUrl.startsWith('/')) {
      lines.push(`   Product URL: ${origin}${prod.originalUrl}`);
    }
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lagiism-styling-shortlist.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
