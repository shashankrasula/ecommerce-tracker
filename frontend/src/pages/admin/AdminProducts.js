import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';

const CATEGORIES = ['Electronics', 'Audio', 'Computers', 'Footwear', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Toys', 'Other'];

const emptyForm = { name: '', description: '', price: '', category: '', stock: '', sku: '', image: '' };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/products').then(({ data }) => { setProducts(data); setLoading(false); });
  }, []);

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setForm(f => ({ ...f, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrl = (e) => {
    const url = e.target.value;
    setForm(f => ({ ...f, image: url }));
    setImagePreview(url);
    setImageError('');
  };

  const clearImage = () => {
    setImagePreview('');
    setForm(f => ({ ...f, image: '' }));
    setImageError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const openAdd = () => {
    setForm(emptyForm);
    setImagePreview('');
    setImageError('');
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      sku: product.sku || '',
      image: product.image || '',
    });
    setImagePreview(product.image || '');
    setImageError('');
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, form);
        setProducts(p => p.map(x => x._id === editingId ? data : x));
      } else {
        const { data } = await api.post('/products', form);
        setProducts(p => [data, ...p]);
      }
      setShowForm(false);
      setForm(emptyForm);
      setImagePreview('');
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(p => p.filter(x => x._id !== id));
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Products">
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            className="input w-56"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="text-slate-400 text-sm">{filtered.length} products</span>
          <button onClick={openAdd} className="btn-primary ml-auto">+ Add Product</button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && <div className="col-span-3 text-center text-slate-500 py-10">Loading...</div>}
          {!loading && !filtered.length && (
            <div className="col-span-3 card text-center py-12">
              <div className="text-4xl mb-2">🛍️</div>
              <p className="text-white font-bold">No products found</p>
              <p className="text-slate-400 text-sm mt-1">Click "Add Product" to get started</p>
            </div>
          )}
          {filtered.map(p => (
            <div key={p._id} className="card hover:border-blue-500/50 transition-colors group">
              {/* Product Image */}
              <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-700 mb-4 flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`w-full h-full items-center justify-center text-5xl ${p.image ? 'hidden' : 'flex'}`}>🛍️</div>
              </div>

              <div className="flex items-start justify-between mb-2">
                <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30">{p.category}</span>
                <span className={`badge ${p.stock > 10 ? 'bg-green-500/20 text-green-400' : p.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <h3 className="text-white font-bold text-base leading-tight">{p.name}</h3>
              {p.description && <p className="text-slate-400 text-xs mt-1 mb-3 line-clamp-2">{p.description}</p>}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700">
                <span className="text-green-400 font-black text-lg">{formatCurrency(p.price)}</span>
                <span className="text-slate-500 text-xs font-mono">{p.sku}</span>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 text-center text-blue-400 hover:text-white hover:bg-blue-600 border border-blue-500/30 rounded-lg py-1.5 text-xs font-semibold transition-all"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeactivate(p._id)}
                  className="flex-1 text-center text-red-400 hover:text-white hover:bg-red-600 border border-red-500/30 rounded-lg py-1.5 text-xs font-semibold transition-all"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-slate-400 text-xs mt-0.5">Fill in the product details below</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload Section */}
              <div>
                <label className="text-slate-300 text-sm font-semibold block mb-2">Product Image</label>

                {/* Preview */}
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3 bg-slate-700">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => { setImageError('Could not load image from URL'); setImagePreview(''); }}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg"
                    >×</button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">Preview</div>
                  </div>
                )}

                {!imagePreview && (
                  <div
                    className="w-full h-36 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors mb-3 bg-slate-800/50"
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-slate-300 text-sm font-medium">Click to upload image</p>
                    <p className="text-slate-500 text-xs mt-1">JPG, PNG, GIF, WebP — max 2MB</p>
                  </div>
                )}

                {/* File input (hidden) */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFile}
                />

                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="btn-secondary text-xs px-3 py-2 flex-shrink-0"
                  >
                    📁 Choose File
                  </button>
                  <span className="text-slate-500 text-xs">or paste an image URL:</span>
                </div>

                <input
                  type="url"
                  className="input mt-2"
                  placeholder="https://example.com/product-image.jpg"
                  value={form.image.startsWith('data:') ? '' : form.image}
                  onChange={handleImageUrl}
                />

                {imageError && (
                  <p className="text-red-400 text-xs mt-1">⚠️ {imageError}</p>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Product Name *</label>
                  <input className="input" required placeholder="e.g. iPhone 15 Pro" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">SKU *</label>
                  <input className="input" required placeholder="e.g. APL-IP15P" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Category *</label>
                  <select className="input" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Price (₹) *</label>
                  <input className="input" type="number" required min="0" placeholder="e.g. 29999" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Stock Quantity *</label>
                  <input className="input" type="number" required min="0" placeholder="e.g. 50" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>

                <div className="col-span-2">
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Description</label>
                  <textarea
                    className="input resize-none h-20"
                    placeholder="Brief product description..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editingId ? '✅ Update Product' : '✅ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminProducts;
