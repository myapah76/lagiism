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
  onNavigate: (view: ActiveView, anchor?: string) => void;
  onOpenBag: () => void;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  bagCount,
  searchQuery,
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
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.nameVi.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.colorName.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const handleNavClick = (view: ActiveView, anchor?: string) => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    onNavigate(view, anchor);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-black">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-13 flex items-center justify-between gap-4">
        {/* Left Navigation (Desktop) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6"
        >
          <button
            type="button"
            onClick={() => handleNavClick('HOME', 'drop-collection')}
            className={`text-[11px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeView === 'HOME'
                ? 'text-black underline underline-offset-4'
                : 'text-[#555555] hover:text-black'
            }`}
          >
            NEW IN
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('SHOP_ALL')}
            className={`text-[11px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeView === 'SHOP_ALL'
                ? 'text-black underline underline-offset-4'
                : 'text-[#555555] hover:text-black'
            }`}
          >
            SHOP ALL
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ABOUT')}
            className={`text-[11px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeView === 'ABOUT'
                ? 'text-black underline underline-offset-4'
                : 'text-[#555555] hover:text-black'
            }`}
          >
            ABOUT
          </button>
        </nav>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="p-2 -ml-2 text-black hover:bg-[#F4F4F4] cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Center Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('HOME')}
          className="text-base md:text-lg font-black tracking-[-0.04em] uppercase text-black whitespace-nowrap shrink-0 cursor-pointer"
        >
          {BRAND_INFO.name}
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-expanded={searchOpen}
            aria-label="Toggle product search"
            className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase text-black hover:opacity-70 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search size={13} strokeWidth={2} />
            <span className="hidden sm:inline">SEARCH</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => openAccountModal('PROFILE')}
                aria-label="Open member profile and order history"
                className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-black hover:underline underline-offset-4 max-w-[140px] truncate cursor-pointer"
              >
                <UserIcon size={13} strokeWidth={2} className="shrink-0" />
                <span className="truncate">{user.fullName}</span>
              </button>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Sign out"
                title="Sign out"
                className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.06em] uppercase text-[#555555] hover:text-black cursor-pointer"
              >
                <LogOut size={13} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('LOGIN')}
              aria-label="Open sign in modal"
              className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase text-black hover:opacity-70 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserIcon size={13} strokeWidth={2} />
              <span className="hidden sm:inline">SIGN IN</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenBag}
            data-testid="header-bag-button"
            className="text-[11px] font-mono font-bold tracking-[0.04em] uppercase text-black hover:bg-black hover:text-white px-2.5 py-1.5 border border-black whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            BAG ({bagCount})
          </button>
        </div>
      </div>

      {/* Expandable Search Panel */}
      {searchOpen && (
        <div className="border-t border-black bg-white">
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
                className="flex-1 bg-[#F4F4F4] border border-black px-3 py-2.5 text-xs font-mono uppercase tracking-[0.04em] text-black placeholder:text-[#767676] focus:outline-2 focus:outline-black"
              />
              <button
                type="submit"
                className="bg-black text-white border border-black px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] hover:bg-white hover:text-black cursor-pointer whitespace-nowrap"
              >
                FILTER ALL
              </button>
              <button
                type="button"
                aria-label="Close search bar"
                onClick={() => setSearchOpen(false)}
                className="border border-black p-2.5 text-black hover:bg-[#F4F4F4] cursor-pointer"
              >
                <X size={16} />
              </button>
            </form>

            {trimmed && (
              <div className="mt-4 border-t border-[#E0E0E0] pt-4">
                {quickMatches.length === 0 ? (
                  <p className="font-mono text-xs uppercase text-[#555555]">
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
                        className="flex items-center gap-3 border border-[#E0E0E0] hover:border-black p-2 text-left bg-white cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-16 object-cover bg-[#F4F4F4] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold uppercase tracking-[-0.02em] truncate">
                            {item.name}
                          </div>
                          <div className="font-mono-tabular text-[11px] text-[#444444] mt-1">
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
          className="md:hidden border-t border-black bg-white flex flex-col divide-y divide-[#E0E0E0]"
        >
          <button
            type="button"
            onClick={() => handleNavClick('HOME', 'drop-collection')}
            className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#F4F4F4]"
          >
            NEW IN
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('SHOP_ALL')}
            className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#F4F4F4]"
          >
            SHOP ALL
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ABOUT')}
            className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#F4F4F4]"
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
                className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#F4F4F4]"
              >
                MY PROFILE &amp; ORDER HISTORY
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#F4F4F4]"
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
              className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-[0.06em] hover:bg-[#F4F4F4]"
            >
              SIGN IN / REGISTER
            </button>
          )}
        </nav>
      )}
    </header>
  );
};
