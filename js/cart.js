/* ============================================================
   PawCare — Cart / Wishlist / Orders / Voucher state
============================================================ */

const Store = (function () {
  const KEYS = {
    cart: "pawcare_cart",
    wishlist: "pawcare_wishlist",
    orders: "pawcare_orders",
    prefs: "pawcare_prefs",
    recent: "pawcare_recent",
    address: "pawcare_address",
    voucher: "pawcare_voucher"
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* ignore quota errors */ }
  }

  const state = {
    cart: read(KEYS.cart, []),          // [{id, qty}]
    wishlist: read(KEYS.wishlist, []),   // [id]
    orders: read(KEYS.orders, []),       // [{no, date, items, subtotal, shipping, discount, total, status, payment}]
    prefs: read(KEYS.prefs, { pet: "dog" }),
    recent: read(KEYS.recent, []),       // [id]
    address: read(KEYS.address, { name: "", phone: "", address: "" }),
    voucher: read(KEYS.voucher, null)    // {code}
  };

  function save() {
    write(KEYS.cart, state.cart);
    write(KEYS.wishlist, state.wishlist);
    write(KEYS.orders, state.orders);
    write(KEYS.prefs, state.prefs);
    write(KEYS.recent, state.recent);
    write(KEYS.address, state.address);
    write(KEYS.voucher, state.voucher);
  }

  // ---- Cart ----
  function cartCount() {
    return state.cart.reduce((sum, it) => sum + it.qty, 0);
  }

  function addToCart(id, qty) {
    qty = qty || 1;
    const item = state.cart.find(i => i.id === id);
    if (item) item.qty += qty;
    else state.cart.push({ id, qty });
    save();
  }

  function setQty(id, qty) {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;
    if (qty <= 0) removeFromCart(id);
    else { item.qty = qty; save(); }
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(i => i.id !== id);
    save();
  }

  function clearCart() {
    state.cart = [];
    state.voucher = null;
    save();
  }

  function cartDetailed() {
    return state.cart.map(i => {
      const p = getProduct(i.id);
      return { ...i, product: p };
    }).filter(i => i.product);
  }

  // ---- Wishlist ----
  function isWishlisted(id) {
    return state.wishlist.includes(id);
  }

  function toggleWishlist(id) {
    const idx = state.wishlist.indexOf(id);
    if (idx >= 0) state.wishlist.splice(idx, 1);
    else state.wishlist.unshift(id);
    save();
    return idx < 0; // returns true if now wishlisted
  }

  function removeFromWishlist(id) {
    state.wishlist = state.wishlist.filter(w => w !== id);
    save();
  }

  // ---- Recently viewed ----
  function addRecent(id) {
    state.recent = [id, ...state.recent.filter(r => r !== id)].slice(0, 12);
    save();
  }

  // ---- Voucher ----
  function applyVoucher(code) {
    const v = VOUCHERS.find(v => v.code.toLowerCase() === String(code).toLowerCase().trim());
    if (!v) return { ok: false, message: "Mã giảm giá không hợp lệ" };
    state.voucher = { code: v.code };
    save();
    return { ok: true, voucher: v };
  }

  function clearVoucher() {
    state.voucher = null;
    save();
  }

  function activeVoucher() {
    if (!state.voucher) return null;
    return VOUCHERS.find(v => v.code === state.voucher.code) || null;
  }

  // ---- Totals ----
  function totals(shippingMethod) {
    const subtotal = cartDetailed().reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const voucher = activeVoucher();
    let discount = 0;
    let shipping = subtotal > 0 ? (shippingMethod === "express" ? 45000 : 20000) : 0;
    if (voucher) {
      if (voucher.type === "percent") discount = Math.round(subtotal * voucher.value / 100);
      else if (voucher.type === "fixed") discount = Math.min(voucher.value, subtotal);
      else if (voucher.type === "freeship") { shipping = 0; }
    }
    const total = Math.max(0, subtotal - discount) + shipping;
    return { subtotal, discount, shipping, total, voucher };
  }

  // ---- Orders ----
  function placeOrder(details) {
    const t = totals(details.shipping);
    const now = new Date();
    const order = {
      no: "PC" + Date.now().toString().slice(-8),
      date: now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
      ts: now.getTime(),
      items: cartDetailed().map(i => ({ id: i.id, qty: i.qty })),
      subtotal: t.subtotal,
      discount: t.discount,
      shipping: t.shipping,
      total: t.total,
      payment: details.payment,
      shippingMethod: details.shipping,
      status: "Processing"
    };
    state.orders.unshift(order);
    clearCart();
    save();
    return order;
  }

  function updateOrderStatus(no, status) {
    const o = state.orders.find(o => o.no === no);
    if (o) { o.status = status; save(); }
  }

  return {
    state, save,
    cartCount, addToCart, setQty, removeFromCart, clearCart, cartDetailed,
    isWishlisted, toggleWishlist, removeFromWishlist,
    addRecent, applyVoucher, clearVoucher, activeVoucher, totals,
    placeOrder, updateOrderStatus
  };
})();
