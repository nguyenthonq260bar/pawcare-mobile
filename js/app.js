/* ============================================================
   PawCare — App controller: router, rendering, events
============================================================ */

(function () {
  "use strict";

  // ---------- DOM helpers ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  // ---------- Router ----------
  const NAV_SCREENS = ["home", "categories", "cart", "orders", "profile"];
  let historyStack = [];
  let current = "splash";
  let listingQuery = { category: null, pet: null, search: null, from: null };
  let filters = { petType: "", category: "", brand: "", price: "", rating: "" };
  let sort = "popular";
  let detailId = null;
  let selectedServiceId = null;
  let bookingAppointmentId = null;
  let bookingDraft = {
    serviceId: null,
    petId: "vang",
    storeId: "lerchenstrasse",
    date: "",
    time: "",
    payment: "momo",
    notes: ""
  };

  function showScreen(name, push) {
    $$(".screen").forEach(s => s.classList.toggle("is-active", s.dataset.screen === name));
    $$(".bottom-nav .nav-item, .bottom-nav .nav-center").forEach(n =>
      n.classList.toggle("is-active", n.dataset.nav === name));
    const showNav = NAV_SCREENS.includes(name);
    $(".bottom-nav").style.display = showNav ? "block" : "none";
    $("#app").classList.toggle("no-nav", !showNav);
    current = name;
    if (push) historyStack.push(name);
    window.scrollTo(0, 0);
  }

  function navigate(name, push) {
    push = push !== false;
    if (name === "back") {
      historyStack.pop(); // remove current
      const prev = historyStack.pop() || "home";
      showScreen(prev, false);
      return;
    }
    if (push) historyStack = [...historyStack.filter(s => s !== name)];
    showScreen(name, push);
    if (name === "cart") renderCart();
    if (name === "orders") renderOrders();
    if (name === "wishlist") renderWishlist();
    if (name === "checkout") renderCheckout();
    if (name === "services") renderServices();
    if (name === "service-detail") renderServiceDetail();
    if (name === "booking") renderBooking();
    if (name === "booking-confirmation") renderBookingConfirmation();
    if (name === "appointments") renderAppointments();
  }

  function openListing(query) {
    listingQuery = query;
    filters = { petType: query.pet || "", category: query.category || "", brand: "", price: "", rating: "" };
    sort = "popular";
    renderListing();
    navigate("listing", true);
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 1800);
  }

  // ---------- Badges ----------
  function updateBadges() {
    const n = Store.cartCount();
    [$("#cart-badge-top"), $("#cart-badge-nav")].forEach(b => {
      if (!b) return;
      b.textContent = n;
      b.setAttribute("data-count", n);
    });
  }

  // ---------- Product card templates ----------
  function productArt(p) {
    return `<div class="pimg-wrap">${productImg(p)}</div>`;
  }
  function ratingHTML(p) {
    return `<div class="rating"><span class="stars">${starsHTML(p.rating)}</span> ${p.rating}</div>`;
  }

  function hscrollCard(p) {
    return `
      <div class="pcard" data-product="${p.id}">
        ${productArt(p)}
        <div class="pcard-name">${esc(p.name)}</div>
        ${ratingHTML(p)}
        <div class="pcard-foot">
          <div class="pcard-price">${formatPrice(p.price)}${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ""}</div>
          <button class="pcard-add" data-add="${p.id}" aria-label="Add to cart">${_ico(ICONS.plus)}</button>
        </div>
      </div>`;
  }

  function gridCard(p, cls) {
    const wished = Store.isWishlisted(p.id);
    return `
      <div class="grid-card ${cls || ""}" data-product="${p.id}">
        <div class="grid-card-media">
          ${productArt(p)}
          <button class="wish-btn ${wished ? "is-active" : ""}" data-wish="${p.id}" aria-label="Wishlist">${_ico(wished ? ICONS.heartFilled : ICONS.heart)}</button>
          <button class="pcard-add" data-add="${p.id}" aria-label="Add to cart">${_ico(ICONS.plus)}</button>
        </div>
        <div class="grid-card-brand">${esc(p.brand)}</div>
        <div class="grid-card-name">${esc(p.name)}</div>
        <div class="grid-card-rating-line">${ratingHTML(p)}<span class="grid-card-rating">(${p.reviewCount})</span></div>
        <div class="grid-card-price">${formatPrice(p.price)}${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ""}</div>
      </div>`;
  }

  function masonryHTML(products) {
    const left = [];
    const right = [];
    products.forEach((p, i) => {
      const card = gridCard(p, "img-" + (p.id % 4));
      (i % 2 === 0 ? left : right).push(card);
    });
    return `
      <div class="masonry-col">${left.join("")}</div>
      <div class="masonry-col col-offset">${right.join("")}</div>`;
  }

  // ---------- Home ----------
  function renderHome() {
    const pet = Store.state.prefs.pet || "dog";
    $$(".pet-btn").forEach(b => b.classList.toggle("is-active", b.dataset.pet === pet));

    // categories strip
    $("#home-categories").innerHTML = CATEGORIES
      .filter(c => c.id !== "dog" && c.id !== "cat")
      .map(c => `<button class="cat-chip" data-cat="${c.id}">
          <span class="cat-icon">${catIcon(c.id)}</span><span>${c.name}</span>
        </button>`).join("");

    const rows = {
      recommended: recommendedProducts(),
      bestsellers: [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8),
      frequent: frequentlyBought()
    };
    for (const key in rows) {
      $(`[data-row="${key}"]`).innerHTML = masonryHTML(rows[key]);
    }
  }

  function recommendedProducts() {
    const pet = Store.state.prefs.pet || "dog";
    const petList = PRODUCTS.filter(p => p.petType === pet || p.petType === "both");
    const recents = Store.state.recent.map(getProduct).filter(Boolean);
    const wishlist = Store.state.wishlist.map(getProduct).filter(Boolean);
    const pool = [...recents, ...wishlist, ...petList.sort((a, b) => b.rating - a.rating)];
    const seen = new Set();
    return pool.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }).slice(0, 8);
  }

  function frequentlyBought() {
    return [...PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8);
  }

  function serviceIcon(icon) {
    return _ico(ICONS[icon] || ICONS.paw);
  }

  function durationLabel(minutes) {
    return minutes >= 1440 ? `${Math.round(minutes / 1440)} ngày` : `${minutes} phút`;
  }

  function paymentLabel(method) {
    return { momo: "Ví điện tử", bank: "Chuyển khoản ngân hàng", card: "Thẻ quốc tế" }[method] || "Ví điện tử";
  }

  function serviceCard(service) {
    return `
      <button class="service-card" data-service="${esc(service.id)}" style="--service-tint:${esc(service.color)}">
        <span class="service-card-icon">${serviceIcon(service.icon)}</span>
        <span class="service-card-body">
          <span class="service-card-kicker">${esc(service.category)}</span>
          <strong>${esc(service.name)}</strong>
          <span class="service-card-desc">${esc(service.description)}</span>
          <span class="service-card-meta"><span>${_ico(ICONS.clock)} ${esc(durationLabel(service.duration))}</span><span>Chó &amp; mèo</span></span>
        </span>
        <span class="service-card-foot"><strong>${formatPrice(service.price)}</strong><span>${_ico(ICONS.back)}</span></span>
      </button>`;
  }

  function renderServices() {
    const type = ["dog", "cat"].includes(Store.state.prefs.pet) ? Store.state.prefs.pet : "dog";
    const list = SERVICES.filter(service => service.petTypes.includes(type));
    $("#service-list").innerHTML = list.length ? list.map(serviceCard).join("") : `<div class="empty-state"><span class="empty-ico">${_ico(ICONS.paw)}</span><p>Chưa có dịch vụ phù hợp</p></div>`;
  }

  function renderServiceDetail() {
    const service = getService(selectedServiceId);
    if (!service) {
      navigate("services", false);
      return;
    }
    const pet = getPet(bookingDraft.petId) || PETS[0];
    const compatible = service.petTypes.includes(pet.type);
    $("#service-detail-scroll").innerHTML = `
      <div class="service-detail-hero" style="--service-tint:${esc(service.color)}">
        <button class="float-btn float-back" data-back aria-label="Quay lại">${_ico(ICONS.back)}</button>
        <div class="service-detail-orb">${serviceIcon(service.icon)}</div>
        <span class="service-detail-kicker">${esc(service.category)}</span>
        <h1>${esc(service.name)}</h1>
        <p>${esc(service.description)}</p>
      </div>
      <div class="service-detail-body">
        <div class="service-detail-price-row"><strong>${formatPrice(service.price)}</strong><span>${_ico(ICONS.clock)} ${esc(durationLabel(service.duration))}</span></div>
        <p class="service-detail-description">${esc(service.details)}</p>
        <div class="service-detail-block">
          <h2>Dịch vụ bao gồm</h2>
          <div class="service-feature-list">${service.features.map(feature => `<span>${_ico(ICONS.check)} ${esc(feature)}</span>`).join("")}</div>
        </div>
        <div class="service-detail-block service-prep">
          <h2>Lưu ý trước khi đến</h2>
          <p>${esc(service.preparation)}</p>
        </div>
        <div class="service-detail-note"><span>${_ico(ICONS.paw)}</span><p>Dịch vụ dành cho chó và mèo. Bạn có thể chọn bé và khung giờ phù hợp ở bước tiếp theo.</p></div>
      </div>`;
    $("#service-detail-sticky").innerHTML = `
      <div class="service-detail-sticky-row"><div><small>Tổng cộng</small><strong>${formatPrice(service.price)}</strong></div><button class="btn btn-primary" data-service-book="${esc(service.id)}" ${compatible ? "" : "disabled"}>Đặt lịch ngay</button></div>`;
  }

  function startBooking(serviceId) {
    const service = getService(serviceId);
    if (!service) return;
    selectedServiceId = serviceId;
    bookingAppointmentId = null;
    const preferredPetId = Store.state.prefs.pet === "cat" ? "hoang" : "vang";
    if (!getPet(bookingDraft.petId) || !service.petTypes.includes(getPet(bookingDraft.petId).type)) bookingDraft.petId = preferredPetId;
    bookingDraft.serviceId = serviceId;
    bookingDraft.time = "";
    bookingDraft.notes = "";
    navigate("booking");
  }

  function renderBooking() {
    let service = getService(selectedServiceId);
    if (!service) {
      selectedServiceId = SERVICES[0].id;
      service = SERVICES[0];
    }
    if (!getPet(bookingDraft.petId)) bookingDraft.petId = PETS[0].id;
    if (!getStore(bookingDraft.storeId)) bookingDraft.storeId = STORES[0].id;
    if (!["momo", "bank", "card"].includes(bookingDraft.payment)) bookingDraft.payment = "momo";
    if (!bookingDraft.date) bookingDraft.date = getBookingDates(1)[0].iso;
    const dates = getBookingDates(14);
    if (!dates.some(date => date.iso === bookingDraft.date)) {
      const date = new Date(`${bookingDraft.date}T00:00:00`);
      dates.unshift({ iso: bookingDraft.date, weekday: date.toLocaleDateString("vi-VN", { weekday: "short" }), label: String(date.getDate()), month: date.toLocaleDateString("vi-VN", { month: "short" }) });
    }
    const selectedPet = getPet(bookingDraft.petId) || PETS[0];
    const selectedStore = getStore(bookingDraft.storeId) || STORES[0];
    const selectedDate = dates.find(date => date.iso === bookingDraft.date) || dates[0];
    const paymentOptions = [
      { id: "momo", title: "Ví điện tử", detail: "MoMo · ZaloPay", icon: "wallet" },
      { id: "bank", title: "Ngân hàng", detail: "Chuyển khoản QR", icon: "bank" },
      { id: "card", title: "Thẻ quốc tế", detail: "Visa · Mastercard", icon: "cash" }
    ];
    const periods = ["Buổi sáng", "Buổi chiều", "Buổi tối"];
    const slotHTML = periods.map(period => {
      const slots = BOOKING_SLOTS.filter(slot => slot.period === period);
      return `<div class="slot-group"><span class="slot-period">${esc(period)}</span><div class="slot-row">${slots.map(slot => {
        const unavailable = BookingStore.isSlotTaken(bookingDraft.storeId, bookingDraft.date, slot.time, bookingAppointmentId);
        return `<button class="slot-chip ${bookingDraft.time === slot.time ? "is-active" : ""} ${unavailable ? "is-unavailable" : ""}" data-slot-select="${slot.time}" ${unavailable ? "disabled" : ""} aria-label="${esc(slot.time)}${unavailable ? " đã có lịch" : ""}">${esc(slot.time)}${unavailable ? '<small>Đã có lịch</small>' : ""}</button>`;
      }).join("")}</div></div>`;
    }).join("");
    $("#booking-title").textContent = bookingAppointmentId ? "Đổi lịch dịch vụ" : "Đặt lịch dịch vụ";
    $("#booking-content").innerHTML = `
      <section class="booking-section booking-summary-card" style="--service-tint:${esc(service.color)}">
        <div class="cs-head">
          <div class="bs-service">
            <span class="booking-service-icon">${serviceIcon(service.icon)}</span>
            <span><small>${esc(service.category)}</small><strong>${esc(service.name)}</strong><span>${_ico(ICONS.clock)} ${esc(durationLabel(service.duration))}</span></span>
          </div>
          <button class="link" data-service="${esc(service.id)}">Đổi</button>
        </div>
      </section>
      <section class="booking-section">
        <h2>Chọn thú cưng</h2>
        <div class="booking-pet-grid">${PETS.map(pet => `<button class="booking-pet-option ${selectedPet.id === pet.id ? "is-active" : ""}" data-pet-select="${pet.id}"><span class="booking-pet-avatar">${_ico(ICONS[pet.icon] || ICONS.paw)}</span><span><strong>${esc(pet.name)}</strong><small>${esc(pet.typeLabel)}</small></span><span class="booking-option-check">${_ico(ICONS.check)}</span></button>`).join("")}</div>
      </section>
      <section class="booking-section">
        <h2>Chọn cửa hàng</h2>
        <div class="booking-store-list">${STORES.map(store => `<button class="booking-store-option ${selectedStore.id === store.id ? "is-active" : ""}" data-store-select="${store.id}"><span class="booking-store-pin">${_ico(ICONS.location)}</span><span><strong>${esc(store.shortName)}</strong><small>${esc(store.address)} · ${esc(store.distance)}</small></span><span class="booking-option-check">${_ico(ICONS.check)}</span></button>`).join("")}</div>
      </section>
      <section class="booking-section">
        <h2>Chọn ngày</h2>
        <div class="booking-date-row">${dates.map(date => `<button class="booking-date ${date.iso === bookingDraft.date ? "is-active" : ""}" data-date-select="${date.iso}"><span>${esc(date.weekday)}</span><strong>${esc(date.label)}</strong><small>${esc(date.month)}</small></button>`).join("")}</div>
      </section>
      <section class="booking-section">
        <h2>Chọn khung giờ</h2>
        <div class="booking-slots">${slotHTML}</div>
      </section>
      <section class="booking-section">
        <h2>Ghi chú cho PawCare</h2>
        <textarea id="booking-notes" class="booking-notes" rows="3" placeholder="Ví dụ: Bé hơi nhạy cảm với mùi nước hoa...">${esc(bookingDraft.notes)}</textarea>
      </section>
      <section class="booking-section">
        <h2>Thanh toán</h2>
        ${paymentOptions.map(option => `<label class="option-row"><input type="radio" name="booking-payment" value="${option.id}" ${bookingDraft.payment === option.id ? "checked" : ""}><span class="opt-ico">${_ico(ICONS[option.icon])}</span><div><strong>${esc(option.title)}</strong><span>${esc(option.detail)}</span></div></label>`).join("")}
      </section>
      <section class="booking-section">
        <h2>Tóm tắt đặt lịch</h2>
        <div class="summary-line"><span>Dịch vụ</span><span>${esc(service.name)}</span></div>
        <div class="summary-line"><span>Thú cưng</span><span>${esc(selectedPet.name)}</span></div>
        <div class="summary-line"><span>Cửa hàng</span><span>${esc(selectedStore.shortName)}</span></div>
        <div class="summary-line"><span>Thời gian</span><span>${esc(selectedDate.weekday)}, ${esc(selectedDate.label)} ${esc(selectedDate.month)} · ${bookingDraft.time ? esc(bookingDraft.time) : "Chưa chọn"}</span></div>
        <div class="summary-line summary-total"><span>Tổng cộng</span><span>${formatPrice(service.price)}</span></div>
      </section>`;
    $("#booking-sticky-label").textContent = bookingAppointmentId ? "Lịch hẹn mới" : "Tổng cộng";
    $("#booking-sticky-total").textContent = formatPrice(service.price);
    $("[data-booking-submit]").textContent = bookingAppointmentId ? "Lưu thay đổi" : "Thanh toán & đặt lịch";
  }

  function renderBookingConfirmation() {
    const appointment = BookingStore.getById(bookingAppointmentId);
    if (!appointment) {
      $("#booking-confirm-no").textContent = "";
      $("#booking-confirm-details").innerHTML = `<p class="text-muted">Không tìm thấy thông tin lịch hẹn.</p>`;
      return;
    }
    const service = getService(appointment.serviceId);
    const store = getStore(appointment.storeId);
    const pet = getPet(appointment.petId);
    $("#booking-confirm-no").textContent = appointment.no;
    $("#booking-confirm-details").innerHTML = `
      <div class="confirm-service-row"><span class="confirm-service-icon">${serviceIcon(service ? service.icon : "paw")}</span><span><strong>${esc(service ? service.name : "Dịch vụ")}</strong><small>${esc(pet ? pet.name : "Thú cưng")} · ${esc(paymentLabel(appointment.payment))}</small></span></div>
      <div class="summary-line"><span>Cửa hàng</span><span>${esc(store ? store.shortName : "")}</span></div>
      <div class="summary-line"><span>Thời gian</span><span>${esc(formatBookingDate(appointment.date))}<br />${esc(appointment.time)}</span></div>
      <div class="summary-line summary-total"><span>Tổng cộng</span><strong>${formatPrice(appointment.price)}</strong></div>`;
  }

  function renderAppointments() {
    const list = BookingStore.state.appointments;
    if (!list.length) {
      $("#appointment-list").innerHTML = `<div class="empty-state"><span class="empty-ico">${_ico(ICONS.calendar)}</span><p>Bạn chưa có lịch hẹn nào</p><button class="btn btn-primary" data-nav="services">Khám phá dịch vụ</button></div>`;
      return;
    }
    const statusLabels = { Confirmed: "Đã xác nhận", Cancelled: "Đã hủy", Completed: "Đã hoàn tất" };
    $("#appointment-list").innerHTML = list.map(appointment => {
      const service = getService(appointment.serviceId);
      const store = getStore(appointment.storeId);
      const pet = getPet(appointment.petId);
      const status = ["Confirmed", "Cancelled", "Completed"].includes(appointment.status) ? appointment.status : "Confirmed";
      const canEdit = status === "Confirmed";
      return `<article class="appointment-card ${status === "Cancelled" ? "is-cancelled" : ""}">
        <div class="appointment-card-head"><span class="appointment-no">#${esc(appointment.no)}</span><span class="appointment-status appointment-status-${status.toLowerCase()}">${esc(statusLabels[status])}</span></div>
        <div class="appointment-main"><span class="appointment-icon">${serviceIcon(service ? service.icon : "paw")}</span><span><strong>${esc(service ? service.name : "Dịch vụ")}</strong><small>${esc(pet ? pet.name : "Thú cưng")} · ${formatPrice(appointment.price)}</small></span></div>
        <div class="appointment-detail"><span>${_ico(ICONS.calendar)} ${esc(formatBookingDate(appointment.date))}</span><span>${_ico(ICONS.clock)} ${esc(appointment.time)}</span><span>${_ico(ICONS.location)} ${esc(store ? store.shortName : "")}</span></div>
        <div class="appointment-payment">Thanh toán: ${esc(paymentLabel(appointment.payment))} · ${appointment.paymentStatus === "Paid" ? "Đã thanh toán" : "Chờ thanh toán"}</div>
        ${canEdit ? `<div class="appointment-actions"><button class="btn btn-outline" data-appointment-reschedule="${esc(appointment.id)}">${_ico(ICONS.refresh)} Đổi lịch</button><button class="btn btn-danger" data-appointment-cancel="${esc(appointment.id)}">${_ico(ICONS.trash)} Hủy lịch</button></div>` : ""}
      </article>`;
    }).join("");
  }

  function startReschedule(id) {
    const appointment = BookingStore.getById(id);
    if (!appointment || appointment.status !== "Confirmed") return;
    selectedServiceId = appointment.serviceId;
    bookingAppointmentId = appointment.id;
    bookingDraft = {
      serviceId: appointment.serviceId,
      petId: appointment.petId,
      storeId: appointment.storeId,
      date: appointment.date,
      time: "",
      payment: appointment.payment || "momo",
      notes: appointment.notes || ""
    };
    navigate("booking");
  }

  function submitBooking() {
    const service = getService(bookingDraft.serviceId || selectedServiceId);
    const pet = getPet(bookingDraft.petId);
    const store = getStore(bookingDraft.storeId);
    if (!service) { toast("Vui lòng chọn dịch vụ"); return; }
    if (!pet || !service.petTypes.includes(pet.type)) { toast("Vui lòng chọn thú cưng phù hợp"); return; }
    if (!store) { toast("Vui lòng chọn cửa hàng"); return; }
    if (!bookingDraft.date) { toast("Vui lòng chọn ngày"); return; }
    if (!bookingDraft.time) { toast("Vui lòng chọn khung giờ"); return; }
    if (BookingStore.isSlotTaken(store.id, bookingDraft.date, bookingDraft.time, bookingAppointmentId)) { toast("Khung giờ này vừa có lịch, vui lòng chọn giờ khác"); renderBooking(); return; }
    const notes = $("#booking-notes") ? $("#booking-notes").value.trim() : bookingDraft.notes;
    const draft = { ...bookingDraft, price: service.price, notes };
    let appointment;
    if (bookingAppointmentId) {
      appointment = BookingStore.reschedule(bookingAppointmentId, draft.date, draft.time);
      if (!appointment) {
        bookingAppointmentId = null;
        toast("Không tìm thấy lịch hẹn cần cập nhật");
        navigate("appointments");
        return;
      }
      Object.assign(appointment, { petId: draft.petId, storeId: draft.storeId, payment: draft.payment, notes: draft.notes, price: draft.price });
      BookingStore.save();
      toast("Đã cập nhật lịch hẹn");
    } else {
      appointment = BookingStore.create(draft);
      toast("Đặt lịch thành công");
    }
    bookingAppointmentId = appointment.id;
    navigate("booking-confirmation");
  }

  // ---------- Categories ----------
  function renderCategories() {
    $("#category-grid").innerHTML = CATEGORIES.map(c => `
      <button class="cat-card" data-cat="${c.id}">
        <span class="cat-icon">${catIcon(c.id)}</span>
        <strong>${c.name}</strong>
      </button>`).join("");
  }

  // ---------- Listing ----------
  function applyFiltersAndSort(list) {
    let out = list.slice();
    if (filters.petType) out = out.filter(p => p.petType === filters.petType || p.petType === "both");
    if (filters.category) out = out.filter(p => p.category === filters.category);
    if (filters.brand) out = out.filter(p => p.brand === filters.brand);
    if (filters.price) {
      const [min, max] = filters.price.split("-").map(v => v === "" ? null : Number(v));
      out = out.filter(p => (min == null || p.price >= min) && (max == null || p.price <= max));
    }
    if (filters.rating) out = out.filter(p => p.rating >= Number(filters.rating));
    switch (sort) {
      case "price-asc": out.sort((a, b) => a.price - b.price); break;
      case "price-desc": out.sort((a, b) => b.price - a.price); break;
      case "rating": out.sort((a, b) => b.rating - a.rating); break;
      default: out.sort((a, b) => b.sold - a.sold); break;
    }
    return out;
  }

  function listingBase() {
    let list = PRODUCTS.slice();
    if (listingQuery.pet) list = list.filter(p => p.petType === listingQuery.pet || p.petType === "both");
    if (listingQuery.category === "dog") list = list.filter(p => p.petType === "dog" || p.petType === "both");
    if (listingQuery.category === "cat") list = list.filter(p => p.petType === "cat" || p.petType === "both");
    if (listingQuery.category && listingQuery.category !== "dog" && listingQuery.category !== "cat") {
      list = list.filter(p => p.category === listingQuery.category);
    }
    return list;
  }

  function renderListing() {
    const title = listingQuery.search
      ? `"${listingQuery.search}"`
      : (getCategory(listingQuery.category) ? getCategory(listingQuery.category).name : "Sản phẩm");
    $("#listing-title").textContent = title;

    const base = listingBase();
    let list = base;
    if (listingQuery.search) {
      const q = listingQuery.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.includes(q));
    }
    list = applyFiltersAndSort(list);

    $("#listing-count").textContent = `${list.length} sản phẩm`;
    const activeCount = Object.values(filters).filter(Boolean).length;
    $("#active-filters").textContent = activeCount ? `${activeCount} bộ lọc đang bật` : "Không bộ lọc";
    $("#active-filters").classList.toggle("is-active", activeCount > 0);

    $("#product-grid").innerHTML = list.length
      ? list.map(gridCard).join("")
      : `<div class="empty-state" style="grid-column:1/-1"><span class="empty-ico">${_ico(ICONS.search)}</span><p>Không tìm thấy sản phẩm</p></div>`;
  }

  function renderFilterSheet() {
    // category chips
    const catChips = ["", ...CATEGORIES.filter(c => c.id !== "dog" && c.id !== "cat").map(c => c.id)];
    $$('[data-filter="category"] .chip').forEach(c => c.remove());
    const catRow = $('[data-filter="category"]');
    catChips.forEach(id => {
      const name = id === "" ? "Tất cả" : getCategory(id).name;
      catRow.insertAdjacentHTML("beforeend", `<button class="chip ${filters.category === id ? "is-active" : ""}" data-val="${id}">${name}</button>`);
    });
    // brand chips
    $$('[data-filter="brand"] .chip').forEach(c => c.remove());
    const brandRow = $('[data-filter="brand"]');
    ["", ...BRANDS].forEach(b => {
      brandRow.insertAdjacentHTML("beforeend", `<button class="chip ${filters.brand === b ? "is-active" : ""}" data-val="${esc(b)}">${b === "" ? "Tất cả" : esc(b)}</button>`);
    });
    // reflect active state on static chips
    $$('.filter-group .chip').forEach(c => {
      const group = c.closest('[data-filter]').dataset.filter;
      c.classList.toggle("is-active", filters[group] === c.dataset.val);
    });
  }

  // ---------- Detail ----------
  function isBestSeller(p) {
    const top = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8);
    return top.some(t => t.id === p.id);
  }

  function renderDetail() {
    const p = getProduct(detailId);
    if (!p) return;
    Store.addRecent(p.id);
    const wished = Store.isWishlisted(p.id);

    const discountPct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const slides = [0, 1, 2].map(() =>
      `<div class="detail-slide">${productImg(p)}</div>`).join("");

    const sizes = (p.size || "").split(/,\s*/).filter(Boolean);
    const sizeChips = sizes.length ? `
      <div class="detail-sizes">
        ${sizes.map((s, i) => `<button class="size-chip ${i === 0 ? "is-active" : ""}" data-size>${esc(s)}</button>`).join("")}
      </div>` : "";

    $("#detail-scroll").innerHTML = `
      <div class="detail-hero">
        <button class="float-btn float-back" data-back aria-label="Back">${_ico(ICONS.back)}</button>
        <button class="float-btn float-wish ${wished ? "is-active" : ""}" data-wish="${p.id}" aria-label="Wishlist">${_ico(wished ? ICONS.heartFilled : ICONS.heart)}</button>
        <button class="float-btn float-share" data-share aria-label="Share">${_ico(ICONS.share)}</button>
        <div class="detail-carousel" id="carousel">
          <div class="detail-carousel-track" id="carousel-track">${slides}</div>
        </div>
        <div class="detail-dots" id="carousel-dots">${[0,1,2].map((_, i) => `<span class="${i === 0 ? "is-active" : ""}"></span>`).join("")}</div>
      </div>
      <div class="detail-info">
        <div class="detail-badges">
          <span class="rating-badge">★ ${p.rating}</span>
          <span class="review-count">${p.reviewCount} đánh giá</span>
          ${isBestSeller(p) ? `<span class="badge-best">Bán chạy nhất</span>` : ""}
          ${discountPct ? `<span class="badge-deal">-${discountPct}%</span>` : ""}
        </div>
        <h1 class="detail-name">${esc(p.name)}</h1>
        <div class="detail-brand">${esc(p.brand)}</div>
        <p class="detail-desc">${esc(p.description)}</p>
        ${sizeChips}
      </div>
      <div class="detail-sections">
        <div class="detail-block">
          <h3>Thành phần / Thông số</h3>
          <p>${esc(p.ingredients)}</p>
        </div>
        <div class="detail-block">
          <h3>Phù hợp với</h3>
          <p>${esc(p.suitableFor)}</p>
        </div>
        <div class="detail-block">
          <h3>Kích thước</h3>
          <p>${esc(p.size)}</p>
        </div>
        <div class="detail-block">
          <h3>Tình trạng</h3>
          <p>${p.stock > 0 ? `<span class="text-accent">Còn hàng · ${p.stock} sản phẩm</span>` : "Hết hàng"}</p>
        </div>
      </div>`;

    $("#detail-sticky").innerHTML = `
      <div class="detail-buy-row">
        <div class="detail-buy-price">
          <strong>${formatPrice(p.price)}</strong>
          ${p.oldPrice ? `<span class="text-strike">${formatPrice(p.oldPrice)}</span>` : ""}
        </div>
        <div class="detail-qty">
          <button class="qty-btn" id="qty-minus">−</button>
          <span class="qty-val" id="qty-val">1</span>
          <button class="qty-btn" id="qty-plus">+</button>
        </div>
        <button class="btn btn-primary" data-detail-add>Vào giỏ</button>
      </div>
      <button class="btn btn-outline btn-block" data-detail-buy>Mua ngay</button>`;

    setupCarousel();
    setupDetailQty();
  }

  function setupCarousel() {
    const track = $("#carousel-track");
    if (!track) return;
    let idx = 0;
    const slides = $$(".detail-slide");
    const dots = $$("#carousel-dots span");
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle("is-active", j === idx));
    }
    let startX = 0;
    const carousel = $("#carousel");
    carousel.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    // auto advance
    setInterval(() => go(idx + 1), 3500);
  }

  let detailQty = 1;
  function setupDetailQty() {
    detailQty = 1;
    const val = $("#qty-val");
    $("#qty-minus").addEventListener("click", () => { detailQty = Math.max(1, detailQty - 1); val.textContent = detailQty; });
    $("#qty-plus").addEventListener("click", () => { detailQty = Math.min(99, detailQty + 1); val.textContent = detailQty; });
  }

  // ---------- Cart ----------
  function renderCart() {
    const items = Store.cartDetailed();
    const t = Store.totals();
    $("#cart-items").innerHTML = items.map(i => {
      const p = i.product;
      const wished = Store.isWishlisted(p.id);
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="ci-img">${productImg(p)}</div>
          <div class="ci-body">
            <div class="ci-top">
              <div class="ci-name">${esc(p.name)}</div>
              <button class="ci-wish ${wished ? "is-active" : ""}" data-ci-wish="${p.id}" aria-label="Wishlist">${_ico(wished ? ICONS.heartFilled : ICONS.heart)}</button>
            </div>
            <div class="ci-brand">${esc(p.brand)}</div>
            <div class="ci-bottom">
              <div class="ci-price">${formatPrice(p.price * i.qty)}</div>
              <div class="ci-controls">
                <button class="ci-btn" data-qty-dec="${p.id}">−</button>
                <span class="qty-val">${i.qty}</span>
                <button class="ci-btn" data-qty-inc="${p.id}">+</button>
                <button class="ci-remove" data-remove="${p.id}" aria-label="Remove">${_ico(ICONS.trash)}</button>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    const empty = items.length === 0;
    $("#cart-empty").classList.toggle("is-hidden", !empty);
    $("#cart-summary").classList.toggle("is-hidden", empty);
    $("#cart-sticky").classList.toggle("is-hidden", empty);

    if (!empty) {
      $("#sum-subtotal").textContent = formatPrice(t.subtotal);
      $("#sum-discount").textContent = t.discount ? "-" + formatPrice(t.discount) : "0₫";
      $("#sum-shipping").textContent = t.shipping ? formatPrice(t.shipping) : "Miễn phí";
      $("#sum-total").textContent = formatPrice(t.total);
      $("#sticky-cart-total").textContent = formatPrice(t.total);
      if (t.voucher) {
        $("#voucher-input").value = t.voucher.code;
        $("#voucher-input").disabled = true;
      } else {
        $("#voucher-input").disabled = false;
      }
    }
    updateBadges();
  }

  // ---------- Checkout ----------
  function renderCheckout() {
    const items = Store.cartDetailed();
    if (items.length === 0) { navigate("cart"); return; }

    const shipping = $('input[name="shipping"]:checked').value;
    const t = Store.totals(shipping);

    const a = Store.state.address;
    $("#addr-name").value = a.name;
    $("#addr-phone").value = a.phone;
    $("#addr-address").value = a.address;

    $("#checkout-products").innerHTML = items.map(i => `
      <div class="cp-row">
        <span class="cp-thumb">${productImg(i.product)}</span>
        <span class="cp-name">${esc(i.product.name)}</span>
        <span class="cp-qty">×${i.qty}</span>
        <strong>${formatPrice(i.product.price * i.qty)}</strong>
      </div>`).join("");

    $("#co-subtotal").textContent = formatPrice(t.subtotal);
    $("#co-shipping").textContent = t.shipping ? formatPrice(t.shipping) : "Miễn phí";
    $("#co-discount").textContent = t.discount ? "-" + formatPrice(t.discount) : "0₫";
    $("#co-total").textContent = formatPrice(t.total);
    $("#co-sticky-total").textContent = formatPrice(t.total);
  }

  // ---------- Orders ----------
  const STATUS_FLOW = ["Processing", "Confirmed", "Shipping", "Delivered"];
  const STATUS_LABELS = { Processing: "Đang xử lý", Confirmed: "Đã xác nhận", Shipping: "Đang giao", Delivered: "Đã giao" };
  function orderProgress(status) {
    const idx = STATUS_FLOW.indexOf(status);
    const pct = idx < 0 ? 0 : Math.round((idx / (STATUS_FLOW.length - 1)) * 100);
    const dots = STATUS_FLOW.map((s, i) =>
      `<span class="op-dot ${i < idx ? "is-done" : i === idx ? "is-current" : ""}"></span>`).join("");
    const labels = STATUS_FLOW.map((s, i) =>
      `<span class="${i === idx ? "is-active" : ""}">${STATUS_LABELS[s] || s}</span>`).join("");
    return `
      <div class="order-progress">
        <div class="op-track">
          <span class="op-fill" style="width:${pct}%"></span>
          <div class="op-dots">${dots}</div>
        </div>
        <div class="op-labels">${labels}</div>
      </div>`;
  }
  function renderOrders() {
    const orders = Store.state.orders;
    if (!orders.length) {
      $("#orders-list").innerHTML = `<div class="empty-state"><span class="empty-ico">${_ico(ICONS.box)}</span><p>Chưa có đơn hàng</p><button class="btn btn-primary" data-nav="home">Bắt đầu mua sắm</button></div>`;
      return;
    }
    $("#orders-list").innerHTML = orders.map(o => {
      const items = o.items.map(i => getProduct(i.id)).filter(Boolean);
      const thumbs = items.map(p => `<span class="oc-thumb">${productImg(p)}</span>`).join("");
      const names = items.slice(0, 2).map(p => p.name).join(", ") + (items.length > 2 ? ` +${items.length - 2} sản phẩm khác` : "");
      const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
      return `
        <div class="order-card" data-order="${o.no}">
          <div class="oc-head">
            <span class="oc-no">#${o.no}</span>
            <span class="oc-date">${o.date}</span>
          </div>
          <div class="oc-items">${thumbs}</div>
          <div class="oc-summary">${esc(names)}</div>
          <div class="oc-summary" style="margin-top:6px">Tổng cộng: <span class="oc-total">${formatPrice(o.total)}</span></div>
          <div style="margin-top:8px"><span class="oc-status status-${esc(o.status)}">${esc(STATUS_LABELS[o.status] || o.status)}</span></div>
          ${orderProgress(o.status)}
          <div class="oc-actions">
            ${next ? `<button class="btn btn-outline" data-status="${o.no}:${next}">${next === "Delivered" ? "Đánh dấu đã giao" : "Theo dõi → " + STATUS_LABELS[next]}</button>` : ""}
            <button class="btn btn-primary" data-buy-again="${o.no}">Mua lại</button>
          </div>
        </div>`;
    }).join("");
  }

  function buyAgain(no) {
    const o = Store.state.orders.find(o => o.no === no);
    if (!o) return;
    o.items.forEach(i => Store.addToCart(i.id, i.qty));
    updateBadges();
    toast("Đã thêm vào giỏ hàng");
    navigate("cart");
  }

  // ---------- Wishlist ----------
  function renderWishlist() {
    const ids = Store.state.wishlist;
    if (!ids.length) {
      $("#wishlist-list").innerHTML = `<div class="empty-state"><span class="empty-ico">${_ico(ICONS.heart)}</span><p>Danh sách yêu thích đang trống</p></div>`;
      return;
    }
    $("#wishlist-list").innerHTML = ids.map(id => {
      const p = getProduct(id);
      if (!p) return "";
      return `
        <div class="wish-item">
          <div class="wi-img">${productImg(p)}</div>
          <div class="wi-body">
            <div class="wi-name">${esc(p.name)}</div>
            <div class="rating"><span class="stars">${starsHTML(p.rating)}</span> ${p.rating}</div>
            <div class="wi-price">${formatPrice(p.price)}</div>
          </div>
          <div class="wi-actions">
            <button class="btn btn-primary" data-add="${p.id}">Vào giỏ</button>
            <button class="wi-remove" data-wish-remove="${p.id}">Xóa</button>
          </div>
        </div>`;
    }).join("");
  }

  // ---------- Promotions ----------
  function renderPromotions() {
    $("#voucher-list").innerHTML = VOUCHERS.map(v => {
      const active = Store.activeVoucher() && Store.activeVoucher().code === v.code;
      return `
        <div class="voucher">
          <div>
            <div class="voucher-code">${v.code}</div>
            <div class="voucher-desc">${v.desc}</div>
          </div>
          <div class="voucher-cta">
            <button class="btn btn-outline btn-sm" data-copy="${v.code}">Sao chép</button>
            <button class="btn btn-primary btn-sm" data-voucher-apply="${v.code}">${active ? "Đã áp dụng" : "Áp dụng"}</button>
          </div>
        </div>`;
    }).join("");
  }

  // ---------- Content ----------
  function articleIcon(id) {
    const map = { 1: "food", 2: "grooming", 3: "paw", 4: "treats" };
    return ICONS[map[id] || "book"];
  }
  function renderContent() {
    $("#article-list").innerHTML = ARTICLES.map(a => `
      <div class="article-card">
        <div class="article-img">${_ico(articleIcon(a.id))}</div>
        <div class="article-body">
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.excerpt)}</p>
          <button class="link" data-read="${a.id}">Đọc thêm</button>
        </div>
      </div>`).join("");
  }

  function openArticle(id) {
    const a = ARTICLES.find(x => x.id === Number(id));
    if (!a) return;
    $("#article-title").textContent = a.title;
    $("#article-body").innerHTML = `
      <div class="article-hero">${_ico(articleIcon(a.id))}</div>
      <p class="article-body-text">${esc(a.body)}</p>
      <h3 class="article-sub">Sản phẩm gợi ý</h3>
      <div class="rec-row">
        ${a.products.map(pid => { const p = getProduct(pid); return p ? hscrollCard(p) : ""; }).join("")}
      </div>`;
    openSheet("#article-modal");
  }

  // ---------- Sheets ----------
  function openSheet(sel) { $(sel).classList.add("is-open"); }
  function closeSheet(sel) { $(sel).classList.remove("is-open"); }
  function closeAllSheets() { $$(".sheet-backdrop").forEach(s => s.classList.remove("is-open")); }

  // ---------- Search ----------
  function renderSearch(q) {
    q = (q || "").toLowerCase().trim();
    if (!q) { $("#search-results").innerHTML = ""; return; }
    const res = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.includes(q));
    $("#search-results").innerHTML = res.length ? res.map(p => `
      <div class="sr-item" data-product="${p.id}">
        <span class="sr-thumb">${productImg(p)}</span>
        <div class="sr-body">
          <div class="sr-name">${esc(p.name)}</div>
          <div class="rating"><span class="stars">${starsHTML(p.rating)}</span> ${p.rating}</div>
        </div>
        <div class="sr-price">${formatPrice(p.price)}</div>
      </div>`).join("")
      : `<div class="search-empty">Không có kết quả cho "${esc(q)}"</div>`;
  }

  // ---------- Checkout submit ----------
  function placeOrder() {
    const name = $("#addr-name").value.trim();
    const phone = $("#addr-phone").value.trim();
    const address = $("#addr-address").value.trim();
    if (!name || !phone || !address) {
      toast("Vui lòng nhập đầy đủ địa chỉ");
      return;
    }
    Store.state.address = { name, phone, address };
    Store.save();

    const payment = $('input[name="payment"]:checked').value;
    const shipping = $('input[name="shipping"]:checked').value;
    const order = Store.placeOrder({ payment, shipping });
    updateBadges();

    $("#confirm-order-no").textContent = order.no;
    $("#confirm-total").textContent = formatPrice(order.total);
    const eta = new Date(Date.now() + (shipping === "express" ? 2 : 5) * 86400000);
    $("#confirm-eta").textContent = eta.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const payLabels = { cod: "Thanh toán khi nhận hàng", bank: "Chuyển khoản ngân hàng", ewallet: "Ví điện tử" };
    $("#confirm-payment").textContent = payLabels[payment] || payment;

    toast("Đặt hàng thành công");
    navigate("confirmation");
  }

  function setLocationStore(storeId) {
    $$("[data-store]").forEach(card => card.classList.toggle("is-selected", card.dataset.store === String(STORES.find(store => store.id === storeId)?.number || "")));
  }

  function selectLocationStore(number) {
    const store = getStoreByNumber(number);
    if (!store) return;
    bookingDraft.storeId = store.id;
    setLocationStore(store.id);
    if (current === "booking") {
      renderBooking();
      return;
    }
    if (selectedServiceId) {
      navigate("booking");
      return;
    }
    navigate("services");
  }

  // ---------- Event delegation ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-nav], [data-back], [data-cat], [data-add], [data-wish], [data-product], [data-qty-inc], [data-qty-dec], [data-remove], [data-ci-wish], [data-wish-remove], [data-buy-again], [data-status], [data-copy], [data-voucher-apply], [data-read], [data-share], [data-detail-add], [data-detail-buy], [data-size], [data-service], [data-service-book], [data-pet-select], [data-store-select], [data-pin], [data-store], [data-loc-direction], [data-loc-gps], [data-date-select], [data-slot-select], [data-booking-submit], [data-appointment-reschedule], [data-appointment-cancel], .pet-btn, .nav-item");

    if (!t) return;

    // navigation
    if (t.hasAttribute("data-nav")) { navigate(t.dataset.nav); return; }
    if (t.hasAttribute("data-back")) { navigate("back"); return; }

    if (t.hasAttribute("data-service")) {
      const service = getService(t.dataset.service);
      if (!service) return;
      selectedServiceId = service.id;
      bookingDraft.serviceId = service.id;
      navigate("service-detail");
      return;
    }

    if (t.hasAttribute("data-service-book")) {
      startBooking(t.dataset.serviceBook);
      return;
    }

    if (t.hasAttribute("data-loc-direction")) {
      const card = t.closest("[data-store]");
      const store = card ? getStoreByNumber(card.dataset.store) : null;
      if (store) toast(`Mở bản đồ đến ${store.shortName}`);
      return;
    }

    if (t.hasAttribute("data-loc-gps")) {
      toast("Đã dùng vị trí hiện tại (chế độ mô phỏng)");
      return;
    }

    if (t.hasAttribute("data-pin")) {
      const store = getStoreByNumber(t.dataset.pin);
      if (store) {
        bookingDraft.storeId = store.id;
        setLocationStore(store.id);
        const card = $(`[data-store="${store.number}"]`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        toast(`Đã chọn ${store.shortName}`);
      }
      return;
    }

    if (t.hasAttribute("data-store")) {
      selectLocationStore(t.dataset.store);
      return;
    }

    if (t.hasAttribute("data-pet-select")) {
      if (getPet(t.dataset.petSelect)) {
        bookingDraft.petId = t.dataset.petSelect;
        renderBooking();
      }
      return;
    }

    if (t.hasAttribute("data-store-select")) {
      if (getStore(t.dataset.storeSelect)) {
        bookingDraft.storeId = t.dataset.storeSelect;
        bookingDraft.time = "";
        renderBooking();
      }
      return;
    }

    if (t.hasAttribute("data-date-select")) {
      bookingDraft.date = t.dataset.dateSelect;
      bookingDraft.time = "";
      renderBooking();
      return;
    }

    if (t.hasAttribute("data-slot-select")) {
      bookingDraft.time = t.dataset.slotSelect;
      renderBooking();
      return;
    }

    if (t.hasAttribute("data-booking-submit")) {
      submitBooking();
      return;
    }

    if (t.hasAttribute("data-appointment-reschedule")) {
      startReschedule(t.dataset.appointmentReschedule);
      return;
    }

    if (t.hasAttribute("data-appointment-cancel")) {
      const appointment = BookingStore.cancel(t.dataset.appointmentCancel);
      if (appointment) {
        toast("Đã hủy lịch hẹn");
        renderAppointments();
      }
      return;
    }

    // pet toggle
    if (t.classList.contains("pet-btn")) {
      Store.state.prefs.pet = t.dataset.pet;
      Store.save();
      renderHome();
      return;
    }

    // category
    if (t.hasAttribute("data-cat")) {
      const cat = t.dataset.cat;
      if (cat === "dog" || cat === "cat") openListing({ category: cat });
      else openListing({ category: cat });
      return;
    }

    // add to cart
    if (t.hasAttribute("data-add")) {
      Store.addToCart(Number(t.dataset.add));
      updateBadges();
      toast("Đã thêm vào giỏ hàng");
      if (current === "cart") renderCart();
      if (current === "wishlist") renderWishlist();
      return;
    }

    // wishlist toggle
    if (t.hasAttribute("data-wish")) {
      const added = Store.toggleWishlist(Number(t.dataset.wish));
      toast(added ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích");
      if (current === "listing") renderListing();
      if (current === "detail") renderDetail();
      return;
    }

    // detail actions
    if (t.hasAttribute("data-share")) {
      const p = getProduct(detailId);
      copyText(`${p.name} — ${formatPrice(p.price)} tại PawCare`);
      toast("Đã sao chép liên kết");
      return;
    }
    if (t.hasAttribute("data-detail-add")) {
      Store.addToCart(detailId, detailQty);
      updateBadges();
      toast("Đã thêm vào giỏ hàng");
      return;
    }
    if (t.hasAttribute("data-detail-buy")) {
      Store.addToCart(detailId, detailQty);
      updateBadges();
      navigate("checkout");
      return;
    }
    if (t.hasAttribute("data-size")) {
      const chips = $$(".size-chip");
      chips.forEach(c => c.classList.toggle("is-active", c === t));
      return;
    }

    // open product
    if (t.hasAttribute("data-product")) {
      detailId = Number(t.dataset.product);
      renderDetail();
      navigate("detail");
      return;
    }

    // cart qty
    if (t.hasAttribute("data-qty-inc")) { Store.setQty(Number(t.dataset.qtyInc), (Store.state.cart.find(i => i.id === Number(t.dataset.qtyInc)) || { qty: 0 }).qty + 1); renderCart(); return; }
    if (t.hasAttribute("data-qty-dec")) { Store.setQty(Number(t.dataset.qtyDec), (Store.state.cart.find(i => i.id === Number(t.dataset.qtyDec)) || { qty: 0 }).qty - 1); renderCart(); return; }
    if (t.hasAttribute("data-remove")) { Store.removeFromCart(Number(t.dataset.remove)); toast("Đã xóa khỏi giỏ hàng"); renderCart(); return; }
    if (t.hasAttribute("data-ci-wish")) {
      const added = Store.toggleWishlist(Number(t.dataset.ciWish));
      toast(added ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích");
      renderCart();
      return;
    }

    // wishlist remove
    if (t.hasAttribute("data-wish-remove")) { Store.removeFromWishlist(Number(t.dataset.wishRemove)); renderWishlist(); return; }

    // orders
    if (t.hasAttribute("data-buy-again")) { buyAgain(t.dataset.buyAgain); return; }
    if (t.hasAttribute("data-status")) {
      const [no, status] = t.dataset.status.split(":");
      Store.updateOrderStatus(no, status);
      toast("Đã cập nhật trạng thái đơn hàng");
      renderOrders();
      return;
    }

    // vouchers
    if (t.hasAttribute("data-copy")) {
      copyText(t.dataset.copy);
      toast("Đã sao chép mã: " + t.dataset.copy);
      return;
    }
    if (t.hasAttribute("data-voucher-apply")) {
      const r = Store.applyVoucher(t.dataset.voucherApply);
      toast(r.ok ? "Đã áp dụng mã giảm giá" : r.message);
      if (r.ok) renderPromotions();
      return;
    }

    // article
    if (t.hasAttribute("data-read")) { openArticle(t.dataset.read); return; }
  });

  document.addEventListener("change", (e) => {
    if (e.target.name === "booking-payment" && e.target.value) {
      bookingDraft.payment = e.target.value;
      renderBooking();
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "booking-notes") bookingDraft.notes = e.target.value;
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  // ---------- Static button wiring ----------
  function wireStatic() {
    $("#btn-notify").addEventListener("click", () => toast("Không có thông báo mới"));
    $("#btn-cart-home").addEventListener("click", () => navigate("cart"));
    $("#search-open").addEventListener("click", () => { navigate("search"); setTimeout(() => $("#search-input").focus(), 250); });
    $("#search-open-cat").addEventListener("click", () => { navigate("search"); setTimeout(() => $("#search-input").focus(), 250); });

    $("#btn-checkout").addEventListener("click", () => {
      if (Store.cartCount() === 0) { toast("Giỏ hàng của bạn đang trống"); return; }
      navigate("checkout");
    });

    $("#btn-settings").addEventListener("click", () => toast("Cài đặt sắp ra mắt"));

    // cart voucher
    $("#voucher-apply").addEventListener("click", () => {
      const code = $("#voucher-input").value.trim();
      if (!code) { toast("Nhập mã giảm giá"); return; }
      const r = Store.applyVoucher(code);
      toast(r.ok ? "Đã áp dụng mã giảm giá" : r.message);
      renderCart();
    });

    // listing controls
    $("#btn-filter").addEventListener("click", () => { renderFilterSheet(); openSheet("#filter-sheet"); });
    $("#btn-sort").addEventListener("click", () => openSheet("#sort-sheet"));

    // filter sheet
    $("#filter-sheet").addEventListener("click", (e) => {
      if (e.target.classList.contains("sheet-backdrop")) closeSheet("#filter-sheet");
    });
    $("#filter-sheet").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      const group = chip.closest("[data-filter]").dataset.filter;
      filters[group] = chip.dataset.val;
      $$(`[data-filter="${group}"] .chip`).forEach(c => c.classList.toggle("is-active", c.dataset.val === chip.dataset.val));
    });
    $("#filter-reset").addEventListener("click", () => {
      filters = { petType: "", category: "", brand: "", price: "", rating: "" };
      renderFilterSheet();
    });
    $("#filter-apply").addEventListener("click", () => { closeSheet("#filter-sheet"); renderListing(); });

    // sort sheet
    $("#sort-sheet").addEventListener("click", (e) => {
      if (e.target.classList.contains("sheet-backdrop")) closeSheet("#sort-sheet");
    });
    $("#sort-apply").addEventListener("click", () => {
      sort = $('input[name="sort"]:checked').value;
      closeSheet("#sort-sheet");
      renderListing();
    });

    // checkout
    $("#btn-change-address").addEventListener("click", () => $("#addr-address").focus());
    $$('input[name="shipping"]').forEach(r => r.addEventListener("change", renderCheckout));
    $("#btn-place-order").addEventListener("click", placeOrder);

    // article modal close
    $("#article-close").addEventListener("click", () => closeSheet("#article-modal"));
    $("#article-modal").addEventListener("click", (e) => {
      if (e.target.classList.contains("sheet-backdrop")) closeSheet("#article-modal");
    });

    // search input
    $("#search-input").addEventListener("input", (e) => renderSearch(e.target.value));
  }

  // ---------- Splash ----------
  function initSplash() {
    showScreen("splash");
    setTimeout(() => navigate("home", false), 2200);
  }

  // ---------- Boot ----------
  function init() {
    wireStatic();
    renderHome();
    renderCategories();
    renderPromotions();
    renderContent();
    renderCart();
    renderOrders();
    updateBadges();
    initSplash();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
