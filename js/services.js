const PETS = [
  { id: "vang", name: "Cậu Vàng", type: "dog", typeLabel: "Chó", detail: "Chó trưởng thành", icon: "dog" },
  { id: "hoang", name: "Hoàng Thượng", type: "cat", typeLabel: "Mèo", detail: "Mèo trưởng thành", icon: "cat" }
];

const STORES = [
  {
    id: "lerchenstrasse",
    number: 1,
    name: "PawCare - Chi nhánh Lerchenstraße",
    shortName: "Lerchenstraße",
    address: "Lerchenstraße 12, Neckarsulm",
    distance: "350m",
    rating: "5.0",
    open: true,
    openLabel: "Đã mở cửa"
  },
  {
    id: "binswanger",
    number: 2,
    name: "PawCare - Chi nhánh Binswanger",
    shortName: "Binswanger",
    address: "Binswanger Str. 45, Neckarsulm",
    distance: "1.2 km",
    rating: "4.8",
    open: true,
    openLabel: "Đã mở cửa"
  },
  {
    id: "friedrichstrasse",
    number: 3,
    name: "PawCare - Chi nhánh Friedrichstraße",
    shortName: "Friedrichstraße",
    address: "Friedrichstraße 88, Neckarsulm",
    distance: "2.1 km",
    rating: "4.9",
    open: false,
    openLabel: "Sắp đóng cửa"
  }
];

const SERVICES = [
  {
    id: "grooming",
    name: "Làm đẹp & Grooming",
    shortName: "Grooming",
    category: "Chăm sóc cơ bản",
    icon: "grooming",
    duration: 90,
    price: 350000,
    petTypes: ["dog", "cat"],
    description: "Chăm sóc bộ lông, tắm làm sạch và hoàn thiện ngoại hình cho thú cưng.",
    details: "Gói grooming gồm tắm, sấy lông, chải, cắt tỉa và vệ sinh cơ bản. Nhân viên sẽ tư vấn kiểu tỉa phù hợp với tình trạng lông hiện tại.",
    features: ["Tắm & sấy lông", "Chải và cắt tỉa", "Vệ sinh tai và móng"],
    preparation: "Nên tắm sơ bộ trước khi đến để nhân viên kiểm tra da và lông.",
    color: "#fae8ff"
  },
  {
    id: "vet-checkup",
    name: "Khám sức khỏe tổng quát",
    shortName: "Khám bệnh",
    category: "Chăm sóc cơ bản",
    icon: "vet",
    duration: 45,
    price: 250000,
    petTypes: ["dog", "cat"],
    description: "Kiểm tra sức khỏe định kỳ, tư vấn dinh dưỡng và theo dõi các dấu hiệu bất thường.",
    details: "Bác sĩ thú y sẽ kiểm tra tổng quát, hỏi lịch sử tiêm phòng và ghi nhận kết quả để bạn theo dõi sức khỏe của bé.",
    features: ["Kiểm tra sức khỏe", "Tư vấn dinh dưỡng", "Nhắc lịch tiêm phòng"],
    preparation: "Mang theo sổ tiêm và thông tin lịch sử điều trị nếu có.",
    color: "#dbeafe"
  },
  {
    id: "pet-hotel",
    name: "Lưu trú & chăm sóc",
    shortName: "Pet hotel",
    category: "Chăm sóc cơ bản",
    icon: "hotel",
    duration: 1440,
    price: 550000,
    petTypes: ["dog", "cat"],
    description: "Không gian riêng cho bé ở lại khi bạn cần di chuyển, kèm chăm sóc và báo cáo hằng ngày.",
    details: "Gói lưu trú bao gồm chỗ ở sạch, cho ăn theo thói quen, chăm sóc cơ bản và cập nhật ảnh trạng thái của bé khi cần.",
    features: ["Chỗ ở riêng tư", "Chăm sóc hằng ngày", "Cập nhật trạng thái"],
    preparation: "Bạn có thể gửi thêm thức ăn hoặc đồ dùng quen thuộc khi gửi bé.",
    color: "#dcfce7"
  }
];

const BOOKING_SLOTS = [
  { time: "08:30", period: "Buổi sáng" },
  { time: "10:00", period: "Buổi sáng" },
  { time: "11:30", period: "Buổi sáng" },
  { time: "14:00", period: "Buổi chiều" },
  { time: "15:30", period: "Buổi chiều" },
  { time: "17:00", period: "Buổi tối" }
];

function getService(id) {
  return SERVICES.find(service => service.id === id);
}

function getStore(id) {
  return STORES.find(store => store.id === id);
}

function getStoreByNumber(number) {
  return STORES.find(store => store.number === Number(number));
}

function getPet(id) {
  return PETS.find(pet => pet.id === id);
}

function dateToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getBookingDates(count) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < (count || 7); i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      iso: dateToISO(date),
      weekday: i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : date.toLocaleDateString("vi-VN", { weekday: "short" }),
      label: String(date.getDate()),
      month: date.toLocaleDateString("vi-VN", { month: "short" })
    });
  }
  return dates;
}

function formatBookingDate(iso) {
  if (!iso) return "Chưa chọn ngày";
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}
