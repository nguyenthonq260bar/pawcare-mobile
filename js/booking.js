const BookingStore = (function () {
  const KEYS = {
    appointments: "pawcare_appointments"
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
    } catch (e) {
      return false;
    }
    return true;
  }

  const state = {
    appointments: Array.isArray(read(KEYS.appointments, [])) ? read(KEYS.appointments, []) : []
  };

  function save() {
    write(KEYS.appointments, state.appointments);
  }

  function getById(id) {
    return state.appointments.find(appointment => appointment.id === id);
  }

  function create(draft) {
    const now = new Date();
    const appointment = {
      id: `appointment-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      no: `BK${now.getTime().toString().slice(-8)}`,
      serviceId: draft.serviceId,
      storeId: draft.storeId,
      petId: draft.petId,
      date: draft.date,
      time: draft.time,
      price: Number(draft.price || 0),
      payment: draft.payment || "momo",
      paymentStatus: "Paid",
      notes: draft.notes || "",
      status: "Confirmed",
      createdAt: now.toISOString()
    };
    state.appointments.unshift(appointment);
    save();
    return appointment;
  }

  function update(id, changes) {
    const appointment = getById(id);
    if (!appointment) return null;
    Object.assign(appointment, changes);
    save();
    return appointment;
  }

  function cancel(id) {
    return update(id, { status: "Cancelled" });
  }

  function reschedule(id, date, time) {
    return update(id, { date, time, status: "Confirmed" });
  }

  function isSlotTaken(storeId, date, time, excludeId) {
    return state.appointments.some(appointment =>
      appointment.id !== excludeId &&
      appointment.storeId === storeId &&
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== "Cancelled"
    );
  }

  return {
    state,
    save,
    getById,
    create,
    update,
    cancel,
    reschedule,
    isSlotTaken
  };
})();
