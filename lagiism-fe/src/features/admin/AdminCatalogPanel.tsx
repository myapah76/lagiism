import axios from 'axios';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { catalogService } from '../../services/catalog.service';
import { CategoryDto, ProductDto } from '../../types/api';

interface AdminCatalogPanelProps {
  products: ProductDto[];
  categories: CategoryDto[];
  onRefresh: () => Promise<void>;
}

const EMPTY_PRODUCT: Omit<ProductDto, 'id'> = {
  slug: '',
  sku: '',
  name: '',
  nameVi: '',
  priceVnd: 450000,
  categoryCode: 'TEES',
  setSlot: 'TOP',
  colorName: 'WASHED CHARCOAL',
  colorHex: '#2C2C2E',
  sizes: ['S', 'M', 'L', 'XL'],
  imageUrl: '',
  imagePublicId: '',
  secondaryImageUrl: '',
  secondaryImagePublicId: '',
  glbModelSlot: '',
  description: '',
  gsm: '280 GSM HEAVY JERSEY',
  fabric: '100% COTTON',
  fit: 'BOXY',
  origin: 'LA GI — TP.HCM, VN',
  coordinates: '10°39\'40"N 107°46\'22"E',
  badgeText: '',
  active: true,
  sortOrder: 0,
};

const EMPTY_CATEGORY: Omit<CategoryDto, 'id'> = {
  code: '',
  title: '',
  subtitle: '',
  imageUrl: '',
  imagePublicId: '',
  sortOrder: 0,
  active: true,
};

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'] as const;

export function AdminCatalogPanel({
  products,
  categories,
  onRefresh,
}: AdminCatalogPanelProps) {
  const [subTab, setSubTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<Omit<ProductDto, 'id'>>(EMPTY_PRODUCT);
  const [showProductModal, setShowProductModal] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<Omit<CategoryDto, 'id'>>(EMPTY_CATEGORY);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const anyModalOpen = showProductModal || showCategoryModal;

  useEffect(() => {
    if (!anyModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProductModal(false);
        setShowCategoryModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anyModalOpen]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat =
        categoryFilter === 'ALL' ||
        p.categoryCode.toUpperCase() === categoryFilter.toUpperCase();
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.nameVi || '').toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch, categoryFilter]);

  const extractErr = (err: unknown, fallback: string) =>
    axios.isAxiosError(err) ? err.response?.data?.message || fallback : fallback;

  const handleProductUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await adminService.uploadImage(
        file,
        'products',
        productForm.imagePublicId || undefined
      );
      setProductForm((prev) => ({
        ...prev,
        imageUrl: uploaded.secureUrl,
        imagePublicId: uploaded.publicId,
      }));
      setNotice('Product image uploaded to Cloudinary.');
    } catch (err) {
      setError(extractErr(err, 'Image upload failed (check Cloudinary env vars).'));
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await adminService.uploadImage(
        file,
        'categories',
        categoryForm.imagePublicId || undefined
      );
      setCategoryForm((prev) => ({
        ...prev,
        imageUrl: uploaded.secureUrl,
        imagePublicId: uploaded.publicId,
      }));
      setNotice('Category image uploaded to Cloudinary.');
    } catch (err) {
      setError(extractErr(err, 'Image upload failed (check Cloudinary env vars).'));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (editingProductId) {
        await catalogService.updateProduct(editingProductId, productForm);
        setNotice(`Updated product ${productForm.sku}.`);
      } else {
        await catalogService.createProduct(productForm);
        setNotice(`Created product ${productForm.sku}.`);
      }
      setShowProductModal(false);
      setEditingProductId(null);
      setProductForm(EMPTY_PRODUCT);
      await onRefresh();
    } catch (err) {
      setError(extractErr(err, 'Failed to save product.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (p: ProductDto) => {
    if (!window.confirm(`Delete product ${p.sku} (${p.name})?`)) return;
    setError(null);
    setNotice(null);
    try {
      await catalogService.deleteProduct(p.id);
      setNotice(`Deleted product ${p.sku}.`);
      await onRefresh();
    } catch (err) {
      setError(extractErr(err, 'Failed to delete product.'));
    }
  };

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (editingCategoryId) {
        await catalogService.updateCategory(editingCategoryId, categoryForm);
        setNotice(`Updated category ${categoryForm.code}.`);
      } else {
        await catalogService.createCategory(categoryForm);
        setNotice(`Created category ${categoryForm.code}.`);
      }
      setShowCategoryModal(false);
      setEditingCategoryId(null);
      setCategoryForm(EMPTY_CATEGORY);
      await onRefresh();
    } catch (err) {
      setError(extractErr(err, 'Failed to save category.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (c: CategoryDto) => {
    if (!window.confirm(`Delete category ${c.code} (${c.title})?`)) return;
    setError(null);
    setNotice(null);
    try {
      await catalogService.deleteCategory(c.id);
      setNotice(`Deleted category ${c.code}.`);
      await onRefresh();
    } catch (err) {
      setError(extractErr(err, 'Failed to delete category.'));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-3">
        <h2 className="text-2xl font-black uppercase tracking-[-0.03em]">
          PRODUCT &amp; CATEGORY MANAGEMENT
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSubTab('PRODUCTS')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border border-black cursor-pointer ${
              subTab === 'PRODUCTS' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            PRODUCTS ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('CATEGORIES')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border border-black cursor-pointer ${
              subTab === 'CATEGORIES' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            CATEGORIES ({categories.length})
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-4 border border-black bg-[#F4F4F4] px-4 py-2.5 font-mono text-xs">
          {notice}
        </div>
      )}
      {error && !anyModalOpen && (
        <div className="mt-4 border border-red-700 bg-red-50 px-4 py-2.5 font-mono text-xs text-red-700">
          {error}
        </div>
      )}

      {subTab === 'PRODUCTS' ? (
        <div className="mt-6">
          {/* Search by name (case-insensitive) + Category Filter + Add button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="SEARCH PRODUCT BY NAME..."
                aria-label="Search products by name"
                className="border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs uppercase text-black placeholder:text-[#767676] w-60"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter products by category"
                className="border border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
              >
                <option value="ALL">ALL CATEGORIES</option>
                {categories.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              {(productSearch || categoryFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setProductSearch('');
                    setCategoryFilter('ALL');
                  }}
                  className="border border-black px-3 py-2 font-mono text-xs uppercase hover:bg-black hover:text-white cursor-pointer"
                >
                  RESET
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingProductId(null);
                setError(null);
                setProductForm({
                  ...EMPTY_PRODUCT,
                  categoryCode: categories[0]?.code || 'TEES',
                });
                setShowProductModal(true);
              }}
              className="bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer self-start lg:self-auto"
            >
              + ADD PRODUCT
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-left text-xs">
              <thead className="bg-[#F4F4F4] font-mono uppercase">
                <tr>
                  <th className="border border-black p-2.5">SKU</th>
                  <th className="border border-black p-2.5">Name</th>
                  <th className="border border-black p-2.5">Category</th>
                  <th className="border border-black p-2.5">Sizes</th>
                  <th className="border border-black p-2.5">Price (VND)</th>
                  <th className="border border-black p-2.5">Status</th>
                  <th className="border border-black p-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="border border-black p-8 text-center font-mono text-[#555555] uppercase"
                    >
                      NO PRODUCTS MATCH CURRENT FILTER
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="border border-black p-2.5 font-mono">{p.sku}</td>
                      <td className="border border-black p-2.5 font-bold">{p.name}</td>
                      <td className="border border-black p-2.5 font-mono">{p.categoryCode}</td>
                      <td className="border border-black p-2.5 font-mono">
                        <div className="flex flex-wrap gap-1">
                          {(p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL']).map(
                            (sz) => (
                              <span
                                key={sz}
                                className="border border-black px-1.5 py-0.5 text-[10px] font-bold"
                              >
                                {sz}
                              </span>
                            )
                          )}
                        </div>
                      </td>
                      <td className="border border-black p-2.5 font-mono">
                        {p.priceVnd.toLocaleString('vi-VN')}
                      </td>
                      <td className="border border-black p-2.5 font-mono">
                        {p.active ? 'ACTIVE' : 'HIDDEN'}
                      </td>
                      <td className="border border-black p-2.5 font-mono space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            const { id, ...rest } = p;
                            setEditingProductId(id);
                            setError(null);
                            setProductForm(rest);
                            setShowProductModal(true);
                          }}
                          className="underline cursor-pointer"
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p)}
                          className="underline text-red-700 cursor-pointer"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => {
                setEditingCategoryId(null);
                setError(null);
                setCategoryForm(EMPTY_CATEGORY);
                setShowCategoryModal(true);
              }}
              className="bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
            >
              + ADD CATEGORY
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-left text-xs">
              <thead className="bg-[#F4F4F4] font-mono uppercase">
                <tr>
                  <th className="border border-black p-2.5">Code</th>
                  <th className="border border-black p-2.5">Title</th>
                  <th className="border border-black p-2.5">Subtitle</th>
                  <th className="border border-black p-2.5">Order</th>
                  <th className="border border-black p-2.5">Status</th>
                  <th className="border border-black p-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="border border-black p-2.5 font-mono font-bold">{c.code}</td>
                    <td className="border border-black p-2.5">{c.title}</td>
                    <td className="border border-black p-2.5 text-[#555555]">
                      {c.subtitle || '—'}
                    </td>
                    <td className="border border-black p-2.5 font-mono">{c.sortOrder}</td>
                    <td className="border border-black p-2.5 font-mono">
                      {c.active ? 'ACTIVE' : 'HIDDEN'}
                    </td>
                    <td className="border border-black p-2.5 font-mono space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          const { id, ...rest } = c;
                          setEditingCategoryId(id);
                          setError(null);
                          setCategoryForm(rest);
                          setShowCategoryModal(true);
                        }}
                        className="underline cursor-pointer"
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c)}
                        className="underline text-red-700 cursor-pointer"
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blurred Popup Modal for Add / Edit Product */}
      {showProductModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProductModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-2xl bg-white text-black border border-black p-6 md:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowProductModal(false)}
              aria-label="Close product editor"
              className="absolute top-4 right-4 p-1.5 border border-transparent hover:border-black cursor-pointer"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#555555]">
              LAGIISM // CATALOG
            </p>
            <h3 className="text-xl font-black uppercase tracking-[-0.03em] mt-1">
              {editingProductId ? `EDIT PRODUCT #${editingProductId}` : 'NEW PRODUCT'}
            </h3>

            {error && (
              <div className="mt-4 border border-red-700 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">SKU</label>
                  <input
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="LG-D01-T04"
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Slug</label>
                  <input
                    required
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    placeholder="lg-tee-04"
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Price (VND)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.priceVnd}
                    onChange={(e) =>
                      setProductForm({ ...productForm, priceVnd: Number(e.target.value) })
                    }
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Product Name (EN)
                  </label>
                  <input
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Product Name (VI)
                  </label>
                  <input
                    value={productForm.nameVi || ''}
                    onChange={(e) => setProductForm({ ...productForm, nameVi: e.target.value })}
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Category</label>
                  <select
                    value={productForm.categoryCode}
                    onChange={(e) =>
                      setProductForm({ ...productForm, categoryCode: e.target.value })
                    }
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Set Slot</label>
                  <select
                    value={productForm.setSlot}
                    onChange={(e) => setProductForm({ ...productForm, setSlot: e.target.value })}
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  >
                    <option value="TOP">TOP</option>
                    <option value="BOTTOM">BOTTOM</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Color Name</label>
                  <input
                    required
                    value={productForm.colorName}
                    onChange={(e) =>
                      setProductForm({ ...productForm, colorName: e.target.value })
                    }
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Color Hex</label>
                  <input
                    required
                    value={productForm.colorHex}
                    onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase mb-1.5">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_SIZES.map((sz) => {
                    const selected = productForm.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setProductForm((prev) => {
                            const exists = prev.sizes.includes(sz);
                            if (exists && prev.sizes.length === 1) {
                              return prev;
                            }
                            return {
                              ...prev,
                              sizes: exists
                                ? prev.sizes.filter((s) => s !== sz)
                                : [...prev.sizes, sz],
                            };
                          });
                        }}
                        className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border border-black cursor-pointer transition-colors ${
                          selected
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-[#F4F4F4]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase mb-1">Image URL</label>
                  <input
                    required
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://res.cloudinary.com/... or /src/assets/images/..."
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Or Upload (Cloudinary)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleProductUpload}
                    className="w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full border border-black bg-white px-2.5 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 font-mono text-xs uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.active}
                    onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                  />
                  ACTIVE ON STOREFRONT
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="border border-black px-4 py-2.5 font-mono text-xs uppercase cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="bg-black text-white px-6 py-2.5 font-mono text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'SAVING...' : editingProductId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blurred Popup Modal for Add / Edit Category */}
      {showCategoryModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCategoryModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-xl bg-white text-black border border-black p-6 md:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              aria-label="Close category editor"
              className="absolute top-4 right-4 p-1.5 border border-transparent hover:border-black cursor-pointer"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#555555]">
              LAGIISM // CATEGORIES
            </p>
            <h3 className="text-xl font-black uppercase tracking-[-0.03em] mt-1">
              {editingCategoryId ? `EDIT CATEGORY #${editingCategoryId}` : 'NEW CATEGORY'}
            </h3>

            {error && (
              <div className="mt-4 border border-red-700 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Code</label>
                  <input
                    required
                    value={categoryForm.code}
                    onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                    placeholder="FOOTWEAR"
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Title</label>
                  <input
                    required
                    value={categoryForm.title}
                    onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                    placeholder="FOOTWEAR"
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, sortOrder: Number(e.target.value) })
                    }
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase mb-1">Subtitle</label>
                <input
                  value={categoryForm.subtitle || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
                  placeholder="VULCANIZED SKATE & TECHNICAL BOOTS"
                  className="w-full border border-black bg-white px-2.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase mb-1">Image URL</label>
                  <input
                    value={categoryForm.imageUrl || ''}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, imageUrl: e.target.value })
                    }
                    className="w-full border border-black bg-white px-2.5 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase mb-1">
                    Or Upload (Cloudinary)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleCategoryUpload}
                    className="w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 font-mono text-xs uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryForm.active}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, active: e.target.checked })
                    }
                  />
                  ACTIVE
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="border border-black px-4 py-2.5 font-mono text-xs uppercase cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="bg-black text-white px-6 py-2.5 font-mono text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'SAVING...' : editingCategoryId ? 'UPDATE CATEGORY' : 'CREATE CATEGORY'}
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
