import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const Shop = () => {
  const { user, updateUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: user?.city || '',
    state: '',
    zip: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    api.get('/products').then(({ data }) => { setProducts(data); setLoading(false); });
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category ? p.category === category : true;
    return matchSearch && matchCat && p.stock > 0;
  });

  const addToCart = (product) => {
    setCart(c => {
      const existing = c.find(x => x._id === product._id);
      if (existing) {
        if (existing.qty >= product.stock) return c;
        return c.map(x => x._id === product._id ? { ...x, qty: x.qty + 1 } : x);
      }
      return [...c, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(c => c.filter(x => x._id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(c => c.map(x => x._id === id ? { ...x, qty } : x));
  };

  const cartTotal = cart.reduce((a, x) => a + x.price * x.qty, 0);
  const cartCount = cart.reduce((a, x) => a + x.qty, 0);

  const getCartQty = (id) => cart.find(x => x._id === id)?.qty || 0;

  const handlePlaceOrder = async () => {
    if (!address.phone || !address.street || !address.city || !address.state || !address.zip) {
      alert('Please fill in all address fields including phone number');
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        items: cart.map(x => ({ product: x._id, name: x.name, quantity: x.qty, price: x.price, image: x.image })),
        totalAmount: cartTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        shippingAddress: address,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        trackingHistory: [{ status: 'pending', location: 'Warehouse', description: 'Order placed successfully' }]
      });

      if (address.phone && (address.phone !== user?.phone || address.street !== user?.address || address.city !== user?.city)) {
        try {
          const { data: updatedUserData } = await api.put('/auth/me', {
            phone: address.phone,
            address: address.street,
            city: address.city
          });
          updateUser(updatedUserData);
        } catch (profileErr) {
          console.warn('Failed to sync phone/address after order:', profileErr);
        }
      }

      setOrderSuccess(data);
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Layout title="Shop">
      <div className="space-y-4">

        {/* Order Success Banner */}
        {orderSuccess && (
          <div className="card bg-gradient-to-r from-green-900/40 to-slate-800 border-green-600/40 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🎉</span>
                  <h3 className="text-green-400 font-bold text-lg">Order Placed Successfully!</h3>
                </div>
                <p className="text-slate-300 text-sm">Your order ID: <span className="text-blue-400 font-mono font-semibold">{orderSuccess.orderId}</span></p>
                {orderSuccess.shippingAddress?.phone && (
                  <p className="text-slate-400 text-xs mt-1">
                    {orderSuccess.smsNotification?.sent
                      ? `SMS sent to ${orderSuccess.shippingAddress.phone}`
                      : orderSuccess.smsNotification?.reason === 'sms-not-configured'
                        ? 'SMS is not configured on the server yet.'
                        : orderSuccess.smsNotification?.reason === 'sms-failed'
                          ? `SMS failed for ${orderSuccess.shippingAddress.phone}. Check Twilio settings.`
                          : `SMS status unavailable for ${orderSuccess.shippingAddress.phone}`}
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-1">Track your order in <a href="/user/orders" className="text-blue-400 underline">My Orders</a></p>
              </div>
              <button onClick={() => setOrderSuccess(null)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
          </div>
        )}

        {/* Search + Filter + Cart Button */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="input w-56"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="input w-44" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-slate-400 text-sm">{filtered.length} items</span>
          <button
            onClick={() => setShowCart(true)}
            className="ml-auto relative btn-primary flex items-center gap-2"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Products Grid */}
        {loading && <div className="text-center text-slate-500 py-16">Loading products...</div>}

        {!loading && !filtered.length && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3">🛍️</div>
            <p className="text-white font-bold">No products available</p>
            <p className="text-slate-400 text-sm mt-1">Check back later or clear your filters</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(product => {
            const inCart = getCartQty(product._id);
            return (
              <div key={product._id} className="card hover:border-teal-500/40 transition-all duration-200 flex flex-col">
                {/* Image */}
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-700 mb-4 flex items-center justify-center flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span className="text-5xl">🛍️</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-start justify-between mb-1">
                  <span className="badge bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs">{product.category}</span>
                  <span className={`text-xs font-medium ${product.stock <= 5 ? 'text-red-400' : 'text-slate-400'}`}>
                    {product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                  </span>
                </div>

                <h3 className="text-white font-bold mt-1">{product.name}</h3>
                {product.description && (
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2 flex-1">{product.description}</p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-green-400 font-black text-xl">{formatCurrency(product.price)}</span>

                  {inCart === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      + Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(product._id, inCart - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center">−</button>
                      <span className="text-white font-bold w-6 text-center">{inCart}</span>
                      <button onClick={() => updateQty(product._id, inCart + 1)}
                        className="w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center">+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <div className="bg-slate-900 border-l border-slate-700 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">🛒 Your Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="text-slate-400">Your cart is empty</p>
                </div>
              )}
              {cart.map(item => (
                <div key={item._id} className="bg-slate-800 rounded-xl p-4 flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <span className="text-xl">🛍️</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-green-400 font-bold text-sm">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item._id, item.qty - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm flex items-center justify-center">−</button>
                      <span className="text-white font-bold text-sm w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center">+</button>
                      <button onClick={() => removeFromCart(item._id)}
                        className="ml-auto text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Subtotal ({cartCount} items)</span>
                  <span className="text-white font-black text-xl">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  className="btn-primary w-full text-base py-3"
                >
                  Proceed to Checkout →
                </button>
                <button onClick={() => setCart([])} className="w-full text-red-400 hover:text-red-300 text-sm text-center">
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCheckout(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex justify-between">
              <h2 className="text-white font-bold text-lg">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Order Summary */}
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Order Summary</h3>
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 truncate max-w-[200px]">{item.name} × {item.qty}</span>
                    <span className="text-white font-medium">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-700 mt-3 pt-3 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-green-400 font-black text-lg">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3">Shipping Address</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="input" placeholder="Full Name *" value={address.name}
                      onChange={e => setAddress({ ...address, name: e.target.value })} />
                    <input className="input" placeholder="Phone Number *" value={address.phone}
                      onChange={e => setAddress({ ...address, phone: e.target.value })} />
                  </div>
                  <p className="text-slate-400 text-xs -mt-1">We'll use this number for order SMS updates.</p>
                  <input className="input" placeholder="Street Address *" value={address.street}
                    onChange={e => setAddress({ ...address, street: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input" placeholder="City *" value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })} />
                    <input className="input" placeholder="State *" value={address.state}
                      onChange={e => setAddress({ ...address, state: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input" placeholder="PIN Code *" value={address.zip}
                      onChange={e => setAddress({ ...address, zip: e.target.value })} />
                    <input className="input" placeholder="Country" value={address.country}
                      onChange={e => setAddress({ ...address, country: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI', icon: '📱' },
                    { id: 'card', label: 'Card', icon: '💳' },
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        paymentMethod === pm.id
                          ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                          : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-xl mb-1">{pm.icon}</div>
                      <div className="text-xs font-medium">{pm.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-primary w-full py-3 text-base"
              >
                {placing ? 'Placing Order...' : `Place Order · ${formatCurrency(cartTotal)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Shop;
