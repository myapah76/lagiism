import React, { useState } from 'react';
import { LogOut, Menu, Search, User as UserIcon, X } from 'lucide-react';
import { BRAND_INFO, PRODUCTS } from '../data/catalog';
import { useAuthStore } from '../stores/auth.store';
import { useUiStore } from '../stores/ui.store';
import { ActiveView, Product } from '../types/store';
import { formatVND } from '../utils/storeLogic';

interface HeaderProps {
  activeView: ActiveView;
  bagCount: number;
  searchQuery: string;
  products?: Product[];
  onNavigate: (view: ActiveView, anchor?: string) => void;
  onOpenBag: () => void;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  bagCount,
  searchQuery,
  products = PRODUCTS,
  onNavigate,
  onOpenBag,
  onSearchChange,
  onSelectProduct,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { openAuthModal, openAccountModal } = useUiStore();

  const trimmed = searchQuery.trim().toLowerCase();
  const quickMatches = trimmed
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(trimmed) ||
            p.nameVi.toLowerCase().includes(trimmed) ||
            p.category.toLowerCase().includes(trimmed) ||
            p.colorName.toLowerCase().includes(trimmed)
        )
        .slice(0, 4)
    : [];

  const handleNavClick = (view: ActiveView, anchor?: string) => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    onNavigate(view, anchor);
  };

  const navLinkClass = (isActive: boolean) =>
    `min-h-[44px] inline-flex items-center font-mono text-[11px] font-bold tracking-[0.08em] uppercase whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
      isActive
        ? 'text-[#111111] underline decoration-[#9E3E24] decoration-2 underline-offset-8'
        : 'text-[#6E6D68] hover:text-[#111111]'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#F4F3EF]/92 backdrop-blur-md border-b border-[#111111]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left Navigation (Desktop) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7"
        >
          <button
            type="button"
            onClick={() => handleNavClick('HOME', 'drop-collection')}
            className={navLinkClass(activeView === 'HOME')}
          >
            NEW IN
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('SHOP_ALL')}
            className={navLinkClass(activeView === 'SHOP_ALL')}
          >
            SHOP ALL
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('RUNWAY')}
            className={navLinkClass(activeView === 'RUNWAY')}
          >
            RUNWAY
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ABOUT')}
            className={navLinkClass(activeView === 'ABOUT')}
          >
            ABOUT
          </button>
        </nav>

        {/* Mobile Menu Trigger (>=44x44px hit target) */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="w-11 h-11 -ml-2 inline-flex items-center justify-center text-[#111111] hover:bg-[#EAE8E1] cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>

        {/* Center Official Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('HOME')}
          className="min-h-[44px] inline-flex items-center text-base md:text-lg font-black tracking-[-0.04em] uppercase text-[#0E0E0E] whitespace-nowrap shrink-0 cursor-pointer"
        >
          {BRAND_INFO.name}
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-expanded={searchOpen}
            aria-label="Toggle product search"
            className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-2 inline-flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.06em] uppercase text-[#111111] hover:text-[#9E3E24] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <Search size={14} strokeWidth={2} aria-hidden="true" />
            <span className="hidden sm:inline">SEARCH</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAccountModal('PROFILE')}
                aria-label="Open member profile and order history"
                className="min-h-[44px] inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-[#111111] hover:text-[#1D2B44] hover:underline underline-offset-4 max-w-[140px] truncate cursor-pointer"
              >
                <UserIcon size={13} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{user.fullName}</span>
              </button>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Sign out"
                title="Sign out"
                className="w-10 h-10 inline-flex items-center justify-center text-[#6E6D68] hover:text-[#9E3E24] cursor-pointer"
              >
                <LogOut size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('LOGIN')}
              aria-label="Open sign in modal"
              className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-2 inline-flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.06em] uppercase text-[#111111] hover:text-[#9E3E24] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <UserIcon size={14} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">SIGN IN</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenBag}
            data-testid="header-bag-button"
            className="min-h-[38px] text-[11px] font-mono font-bold tracking-[0.06em] uppercase bg-[#0E0E0E] text-[#F4F3EF] hover:bg-[#9E3E24] px-3 py-1.5 border border-[#111111] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            BAG ({bagCount})
          </button>
        </div>
      </div>

      {/* Expandable Search Panel */}
      {searchOpen && (
        <div className="border-t border-[#111111] bg-[#F4F3EF]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                onNavigate('SHOP_ALL');
              }}
              className="flex items-center gap-3"
            >
              <label htmlFor="lagiism-search-input" className="sr-only">
                Search garments by name, category, or SKU
              </label>
              <input
                id="lagiism-search-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="SEARCH GARMENTS, DENIM, TEES, SKU..."
                className="flex-1 bg-[#EAE8E1] border border-[#111111] px-3.5 py-2.5 text-xs font-mono uppercase tracking-[0.04em] text-[#111111] placeholder:text-[#6E6D68]"
              />
              <button
                type="submit"
                className="min-h-[44px] bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] hover:bg-[#9E3E24] cursor-pointer whitespace-nowrap transition-colors"
              >
                FILTER ALL
              </button>
              <button
                type="button"
                aria-label="Close search bar"
                onClick={() => setSearchOpen(false)}
                className="w-11 h-11 inline-flex items-center justify-center border border-[#111111] bg-[#EAE8E1] text-[#111111] hover:bg-[#0E0E0E] hover:text-[#F4F3EF] cursor-pointer transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </form>

            {trimmed && (
              <div className="mt-4 border-t border-[#D4D2CA] pt-4">
                {quickMatches.length === 0 ? (
                  <p className="font-mono text-xs uppercase text-[#6E6D68]">
                    NO ARCHIVE MATCHES FOR &ldquo;{searchQuery.toUpperCase()}&rdquo;
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickMatches.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          onSelectProduct(item);
                        }}
                        className="flex items-center gap-3 border border-[#D4D2CA] hover:border-[#111111] p-2 text-left bg-[#EAE8E1]/50 cursor-pointer transition-colors"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-16 object-cover bg-[#EAE8E1] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold uppercase tracking-[-0.02em] text-[#111111] truncate">
                            {item.name}
                          </div>
                          <div className="font-mono-tabular text-[11px] text-[#6E6D68] mt-1">
                            {formatVND(item.priceVnd)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#111111] bg-[#F4F3EF] flex flex-col divide-y divide-[#D4D2CA]"
        >
          <button
            type="button"
            onClick={() => handleNavClick('HOME', 'drop-collection')}
            className="min-h-[48px] px-4 py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:bg-[#EAE8E1]"
          >
            NEW IN
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('SHOP_ALL')}
            className="min-h-[48px] px-4 py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:bg-[#EAE8E1]"
          >
            SHOP ALL
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('RUNWAY')}
            className="min-h-[48px] px-4 py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:bg-[#EAE8E1]"
          >
            RUNWAY
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ABOUT')}
            className="min-h-[48px] px-4 py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:bg-[#EAE8E1]"
          >
            ABOUT
          </button>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAccountModal('PROFILE');
                }}
                className="min-h-[48px] px-4 py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:bg-[#EAE8E1]"
              >
                MY PROFILE &amp; ORDER HISTORY
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="min-h-[48px] px-4 py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#9E3E24] hover:bg-[#EAE8E1]"
              >
                SIGN OUT ({user.fullName})
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('LOGIN');
              }}
              className="min-h-[48px] px-4 py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:bg-[#EAE8E1]"
            >
              SIGN IN / REGISTER
            </button>
          )}
        </nav>
      )}
    </header>
  );
};
