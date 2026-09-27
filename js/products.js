/* ============================================================
   PawCare — Mock product data & helpers
============================================================ */

const CATEGORIES = [
  { id: "dog",      name: "Sản phẩm cho chó",  emoji: "🐶", color: "#fef3c7" },
  { id: "cat",      name: "Sản phẩm cho mèo",  emoji: "🐱", color: "#e0f2fe" },
  { id: "food",     name: "Thức ăn",           emoji: "🍖", color: "#fee2e2" },
  { id: "treats",   name: "Đồ ăn vặt",         emoji: "🦴", color: "#ffedd5" },
  { id: "hygiene",  name: "Vệ sinh",           emoji: "🧼", color: "#dcfce7" },
  { id: "grooming", name: "Làm đẹp",           emoji: "✂️", color: "#fae8ff" },
  { id: "toys",     name: "Đồ chơi",           emoji: "🎾", color: "#e0f2fe" },
  { id: "accessories", name: "Phụ kiện",       emoji: "🎀", color: "#fce7f3" },
  { id: "vitamins", name: "Vitamin",           emoji: "💊", color: "#ecfccb" }
];

const PRODUCTS = [
  // ---- Thức ăn ----
  { id: 1,  name: "Thức ăn cho chó trưởng thành Royal Canin 2kg", brand: "Royal Canin", category: "food", petType: "dog",
    price: 285000, oldPrice: 320000, rating: 4.8, reviewCount: 234, stock: 45, emoji: "🍖", color: "#fee2e2",
    description: "Dinh dưỡng hoàn chỉnh cho chó trưởng thành từ 1–7 tuổi, hỗ trợ tiêu hóa khỏe mạnh và bộ lông bóng mượt.",
    ingredients: "Thịt gà, gạo, ngô, dầu cá, vitamin & khoáng chất",
    suitableFor: "Chó trưởng thành (1–7 tuổi)", size: "2kg, 8kg", sold: 1240 },
  { id: 2,  name: "Thức ăn cho mèo trưởng thành Whiskas vị cá ngừ 1.1kg", brand: "Whiskas", category: "food", petType: "cat",
    price: 145000, oldPrice: 160000, rating: 4.6, reviewCount: 189, stock: 60, emoji: "🐟", color: "#e0f2fe",
    description: "Hạt dinh dưỡng vị cá ngừ thơm ngon với khoáng chất cân bằng cho mèo khỏe mạnh.",
    ingredients: "Cá ngừ, ngũ cốc, phụ phẩm thịt, taurine",
    suitableFor: "Mèo trưởng thành", size: "1.1kg, 3kg", sold: 980 },
  { id: 3,  name: "Thức ăn cho chó con Pedigree vị gà & sữa 1.5kg", brand: "Pedigree", category: "food", petType: "dog",
    price: 130000, oldPrice: 0, rating: 4.5, reviewCount: 156, stock: 30, emoji: "🥣", color: "#fef3c7",
    description: "Công thức đặc biệt cho chó con đang phát triển với DHA hỗ trợ phát triển não bộ.",
    ingredients: "Thịt gà, sữa, gạo, DHA, canxi",
    suitableFor: "Chó con (2–12 tháng)", size: "1.5kg, 5kg", sold: 760 },
  { id: 4,  name: "Thức ăn cho mèo Me-O vị cá biển 1.2kg", brand: "Me-O", category: "food", petType: "cat",
    price: 98000, oldPrice: 110000, rating: 4.4, reviewCount: 210, stock: 80, emoji: "🐠", color: "#dcfce7",
    description: "Công thức cá biển cao cấp giàu Omega-3 cho da và lông khỏe mạnh.",
    ingredients: "Cá biển, ngũ cốc, Omega-3, taurine",
    suitableFor: "Mọi giống mèo", size: "1.2kg, 3.5kg", sold: 1120 },

  // ---- Đồ ăn vặt ----
  { id: 5,  name: "Xúc xích gà JerHigh 12 cây", brand: "JerHigh", category: "treats", petType: "dog",
    price: 65000, oldPrice: 75000, rating: 4.7, reviewCount: 301, stock: 120, emoji: "🍗", color: "#ffedd5",
    description: "Xúc xích gà dai ngon mà chó yêu thích. Hoàn hảo làm phần thưởng khi huấn luyện.",
    ingredients: "Ức gà, glycerin, muối",
    suitableFor: "Chó mọi kích cỡ", size: "Gói 12 cây", sold: 1850 },
  { id: 6,  name: "Kem cá ngừ Ciao Churu 14 gói", brand: "Ciao", category: "treats", petType: "cat",
    price: 120000, oldPrice: 0, rating: 4.9, reviewCount: 412, stock: 90, emoji: "🥫", color: "#fae8ff",
    description: "Kem cá ngừ mịn dạng tuýp — món ăn liếm không thể cưỡng lại cho mèo.",
    ingredients: "Cá ngừ, chiết xuất trà xanh, taurine",
    suitableFor: "Mèo", size: "14 × 14g", sold: 2300 },
  { id: 7,  name: "Xương chăm sóc răng miệng Dentastix cỡ vừa", brand: "Pedigree", category: "treats", petType: "dog",
    price: 89000, oldPrice: 99000, rating: 4.3, reviewCount: 98, stock: 70, emoji: "🦷", color: "#ecfccb",
    description: "Kẹo nhai vệ sinh răng hằng ngày giúp giảm mảng bám khi chó thưởng thức.",
    ingredients: "Ngũ cốc, khoáng chất, dẫn xuất thịt",
    suitableFor: "Chó cỡ vừa (10–25kg)", size: "Cỡ vừa", sold: 640 },
  { id: 8,  name: "Bánh catnip Vitakraft 50g", brand: "Vitakraft", category: "treats", petType: "cat",
    price: 54000, oldPrice: 0, rating: 4.5, reviewCount: 77, stock: 140, emoji: "🌿", color: "#dcfce7",
    description: "Bánh giòn vị catnip mà mèo không thể cưỡng lại.",
    ingredients: "Catnip, ngũ cốc, thịt",
    suitableFor: "Mèo", size: "50g", sold: 520 },

  // ---- Vệ sinh ----
  { id: 9,  name: "Tấm lót vệ sinh XL 50 miếng", brand: "VivaPet", category: "hygiene", petType: "both",
    price: 150000, oldPrice: 170000, rating: 4.6, reviewCount: 265, stock: 200, emoji: "🧻", color: "#e0f2fe",
    description: "Tấm lót thấm hút siêu tốc với đáy chống tràn. Cỡ XL cho chó lớn.",
    ingredients: "Polyme thấm hút 5 lớp",
    suitableFor: "Chó & chó con", size: "XL 60×60cm", sold: 1500 },
  { id: 10, name: "Cát vệ sinh mèo vón cục 5kg", brand: "CleanCat", category: "hygiene", petType: "cat",
    price: 165000, oldPrice: 190000, rating: 4.4, reviewCount: 143, stock: 85, emoji: "🧺", color: "#fef3c7",
    description: "Cát bentonite vón cục nhanh, khử mùi hiệu quả với hương oải hương.",
    ingredients: "Đất sét bentonite, hương oải hương",
    suitableFor: "Mèo", size: "5kg, 10kg", sold: 890 },
  { id: 11, name: "Khăn ướt thú cưng nha đam 100 miếng", brand: "PawClean", category: "hygiene", petType: "both",
    price: 79000, oldPrice: 0, rating: 4.5, reviewCount: 112, stock: 160, emoji: "🧻", color: "#dcfce7",
    description: "Khăn ướt dịu nhẹ chứa nha đam cho chân, tai và lông khi di chuyển.",
    ingredients: "Nha đam, nước tinh khiết",
    suitableFor: "Chó & mèo", size: "100 miếng", sold: 720 },

  // ---- Làm đẹp ----
  { id: 12, name: "Lược chải slicker tự làm sạch", brand: "FurMaster", category: "grooming", petType: "both",
    price: 95000, oldPrice: 110000, rating: 4.6, reviewCount: 167, stock: 55, emoji: "🪮", color: "#fae8ff",
    description: "Lược slicker tự làm sạch loại bỏ lông rụng và ngăn xơ rối.",
    ingredients: "Ghim thép không gỉ, tay cầm chống trượt",
    suitableFor: "Chó & mèo", size: "Cỡ vừa", sold: 430 },
  { id: 13, name: "Sữa tắm yến mạch cho da nhạy cảm 500ml", brand: "FurFresh", category: "grooming", petType: "both",
    price: 135000, oldPrice: 150000, rating: 4.7, reviewCount: 198, stock: 75, emoji: "🧴", color: "#ffedd5",
    description: "Sữa tắm yến mạch dịu nhẹ cho thú cưng da nhạy cảm hoặc ngứa.",
    ingredients: "Yến mạch, nha đam, hoa cúc",
    suitableFor: "Da nhạy cảm", size: "500ml", sold: 680 },
  { id: 14, name: "Kìm cắt móng có chốt an toàn", brand: "FurMaster", category: "grooming", petType: "both",
    price: 69000, oldPrice: 0, rating: 4.3, reviewCount: 89, stock: 110, emoji: "💅", color: "#e0f2fe",
    description: "Kìm cắt móng an toàn có chốt chặn tránh cắt quá sâu.",
    ingredients: "Thép không gỉ",
    suitableFor: "Chó & mèo", size: "Nhỏ/Vừa", sold: 390 },

  // ---- Đồ chơi ----
  { id: 15, name: "Bộ 3 bóng có tiếng kêu", brand: "PawPlay", category: "toys", petType: "dog",
    price: 85000, oldPrice: 95000, rating: 4.5, reviewCount: 220, stock: 95, emoji: "🎾", color: "#ecfccb",
    description: "Bóng tennis có tiếng kêu bền bỉ cho trò chơi ném bắt bất tận.",
    ingredients: "Cao su tự nhiên",
    suitableFor: "Chó", size: "6.5cm", sold: 1100 },
  { id: 16, name: "Cần câu lông vũ", brand: "PawPlay", category: "toys", petType: "cat",
    price: 59000, oldPrice: 0, rating: 4.6, reviewCount: 134, stock: 130, emoji: "🪶", color: "#fce7f3",
    description: "Cần câu lông vũ tương tác kích thích bản năng săn mồi của mèo.",
    ingredients: "Lông vũ, cần nhựa",
    suitableFor: "Mèo", size: "45cm", sold: 820 },
  { id: 17, name: "Đồ chơi dây thừng thắt nút", brand: "PawPlay", category: "toys", petType: "dog",
    price: 75000, oldPrice: 0, rating: 4.4, reviewCount: 76, stock: 88, emoji: "🪢", color: "#fef3c7",
    description: "Dây thừng cotton chắc chắn, tuyệt vời cho trò kéo co và vệ sinh răng.",
    ingredients: "100% dây cotton",
    suitableFor: "Chó cỡ vừa/lớn", size: "35cm", sold: 540 },

  // ---- Phụ kiện ----
  { id: 18, name: "Đai yếm chó điều chỉnh", brand: "WalkMate", category: "accessories", petType: "dog",
    price: 155000, oldPrice: 180000, rating: 4.7, reviewCount: 245, stock: 65, emoji: "🦮", color: "#fee2e2",
    description: "Đai yếm có đệm, thoáng khí với dải phản quang cho chuyến đi bộ an toàn.",
    ingredients: "Nylon, lưới đệm",
    suitableFor: "Chó", size: "S/M/L/XL", sold: 920 },
  { id: 19, name: "Bộ 2 bát ăn gốm sứ", brand: "PetHome", category: "accessories", petType: "both",
    price: 125000, oldPrice: 0, rating: 4.5, reviewCount: 102, stock: 72, emoji: "🍽️", color: "#e0f2fe",
    description: "Bộ hai bát gốm sứ — đựng thức ăn và nước, dễ vệ sinh.",
    ingredients: "Gốm sứ",
    suitableFor: "Chó & mèo", size: "500ml", sold: 610 },
  { id: 20, name: "Balo địu thú cưng", brand: "TravelPet", category: "accessories", petType: "cat",
    price: 320000, oldPrice: 380000, rating: 4.6, reviewCount: 88, stock: 25, emoji: "🎒", color: "#fae8ff",
    description: "Balo địu có lỗ thoáng khí cho mèo và chó nhỏ khi di chuyển.",
    ingredients: "Polyester, lưới thoáng",
    suitableFor: "Thú cưng nhỏ dưới 6kg", size: "30×25×40cm", sold: 340 },

  // ---- Vitamin ----
  { id: 21, name: "Dầu cá Omega-3 250ml", brand: "VitaPet", category: "vitamins", petType: "both",
    price: 210000, oldPrice: 240000, rating: 4.7, reviewCount: 176, stock: 50, emoji: "💊", color: "#ecfccb",
    description: "Hỗ trợ da khỏe, lông bóng và chức năng khớp.",
    ingredients: "Dầu cá (EPA/DHA), vitamin E",
    suitableFor: "Chó & mèo", size: "250ml", sold: 700 },
  { id: 22, name: "Kem đa vitamin 100g", brand: "VitaPet", category: "vitamins", petType: "both",
    price: 115000, oldPrice: 130000, rating: 4.5, reviewCount: 94, stock: 60, emoji: "🧴", color: "#fef3c7",
    description: "Kem đa vitamin thơm ngon hằng ngày tăng cường miễn dịch và năng lượng.",
    ingredients: "Vitamin A, B, D, E, taurine",
    suitableFor: "Chó & mèo", size: "100g", sold: 480 },
  { id: 23, name: "Bột canxi xương 200g", brand: "VitaPet", category: "vitamins", petType: "dog",
    price: 140000, oldPrice: 0, rating: 4.4, reviewCount: 63, stock: 45, emoji: "🦴", color: "#dcfce7",
    description: "Bổ sung canxi cho xương và răng chắc khỏe ở chó đang phát triển.",
    ingredients: "Canxi cacbonat, phốt pho, vitamin D3",
    suitableFor: "Chó con & chó trưởng thành", size: "200g", sold: 350 },

  // ---- Bổ sung ----
  { id: 24, name: "Thức ăn chó cá hồi không ngũ cốc 2.5kg", brand: "NatureDiet", category: "food", petType: "dog",
    price: 420000, oldPrice: 460000, rating: 4.8, reviewCount: 121, stock: 35, emoji: "🐟", color: "#ffedd5",
    description: "Công thức cá hồi không ngũ cốc cho chó nhạy cảm với thức ăn.",
    ingredients: "Cá hồi, khoai lang, đậu Hà Lan",
    suitableFor: "Chó nhạy cảm", size: "2.5kg", sold: 560 },
  { id: 25, name: "Sữa thay thế cho mèo con 300g", brand: "NatureDiet", category: "food", petType: "cat",
    price: 185000, oldPrice: 0, rating: 4.6, reviewCount: 58, stock: 40, emoji: "🍼", color: "#e0f2fe",
    description: "Sữa thay thế dinh dưỡng hoàn chỉnh cho mèo con mồ côi.",
    ingredients: "Đạm whey, lactose, DHA",
    suitableFor: "Mèo con (0–8 tuần)", size: "300g", sold: 290 },
  { id: 26, name: "Gà sấy khô đông lạnh 80g", brand: "PureBites", category: "treats", petType: "both",
    price: 145000, oldPrice: 165000, rating: 4.8, reviewCount: 156, stock: 92, emoji: "🍗", color: "#fce7f3",
    description: "Gà sấy khô một thành phần — món ăn thưởng protein nguyên chất, lành mạnh.",
    ingredients: "100% ức gà",
    suitableFor: "Chó & mèo", size: "80g", sold: 830 },
  { id: 27, name: "Máy uống nước 2L", brand: "PetHome", category: "accessories", petType: "cat",
    price: 380000, oldPrice: 420000, rating: 4.6, reviewCount: 97, stock: 28, emoji: "⛲", color: "#e0f2fe",
    description: "Máy uống nước chảy êm khuyến khích mèo uống nhiều nước hơn.",
    ingredients: "Nhựa không BPA, bộ lọc",
    suitableFor: "Mèo", size: "2L", sold: 310 },
  { id: 28, name: "Thảm làm mát cho chó", brand: "WalkMate", category: "accessories", petType: "dog",
    price: 260000, oldPrice: 0, rating: 4.4, reviewCount: 71, stock: 38, emoji: "🧊", color: "#dcfce7",
    description: "Thảm tự làm mát bằng áp lực cho những ngày hè nóng bức.",
    ingredients: "Lõi gel làm mát",
    suitableFor: "Chó", size: "50×90cm", sold: 270 },
  { id: 29, name: "Viên glucosamine chăm sóc khớp 120 viên", brand: "VitaPet", category: "vitamins", petType: "dog",
    price: 290000, oldPrice: 330000, rating: 4.7, reviewCount: 84, stock: 42, emoji: "🦵", color: "#ecfccb",
    description: "Glucosamine & chondroitin hỗ trợ khớp cho chó lớn tuổi.",
    ingredients: "Glucosamine, chondroitin, MSM",
    suitableFor: "Chó lớn tuổi", size: "120 viên", sold: 400 },
  { id: 30, name: "Bóng catnip cho mèo", brand: "PawPlay", category: "toys", petType: "cat",
    price: 45000, oldPrice: 0, rating: 4.3, reviewCount: 65, stock: 150, emoji: "🔮", color: "#fae8ff",
    description: "Tẩm catnip hữu cơ cho nhiều giờ vui chơi.",
    ingredients: "Nỉ, catnip hữu cơ",
    suitableFor: "Mèo", size: "5cm", sold: 620 }
];

const VOUCHERS = [
  { code: "NEWUSER10", desc: "Giảm 10% đơn hàng", type: "percent", value: 10 },
  { code: "PAWCARE20", desc: "Giảm 20.000₫", type: "fixed", value: 20000 },
  { code: "FREESHIP",   desc: "Miễn phí vận chuyển", type: "freeship", value: 0 }
];

const ARTICLES = [
  {
    id: 1,
    emoji: "🍖", color: "#fee2e2",
    title: "Cách chọn thức ăn phù hợp cho chó của bạn",
    excerpt: "Học cách đọc nhãn, chọn công thức theo giai đoạn và tránh những sai lầm thường gặp khi cho ăn.",
    body: "Chọn thức ăn bắt đầu từ giai đoạn, kích cỡ và mức độ vận động của chó. Tìm protein có tên cụ thể làm thành phần đầu tiên và chọn công thức phù hợp với tuổi — chó con, trưởng thành hay lớn tuổi. Chuyển đổi thức ăn mới dần dần trong 7 ngày để tránh rối loạn tiêu hóa, và luôn cung cấp đủ nước sạch.",
    products: [1, 3, 24]
  },
  {
    id: 2,
    emoji: "🐱", color: "#e0f2fe",
    title: "Nên chải lông cho mèo bao lâu một lần?",
    excerpt: "Tần suất chải lông, chăm sóc móng và mẹo cho bộ lông khỏe, bóng mượt.",
    body: "Mèo lông ngắn chỉ cần chải lông hằng tuần, trong khi mèo lông dài cần chăm sóc hằng ngày để tránh xơ rối. Cắt móng mỗi 2–4 tuần và vệ sinh tai hằng tháng. Chải lông thường xuyên cũng là cơ hội gắn kết tuyệt vời và giúp bạn phát hiện sớm vấn đề về da.",
    products: [12, 13]
  },
  {
    id: 3,
    emoji: "🐾", color: "#dcfce7",
    title: "Sản phẩm thiết yếu cho người mới nuôi thú cưng",
    excerpt: "Danh sách khởi đầu hoàn chỉnh trước khi đón bạn nhỏ về nhà.",
    body: "Bắt đầu với những món cơ bản: bát ăn và bát nước chất lượng, thức ăn phù hợp độ tuổi, một chiếc giường êm ái, đồ vệ sinh và vài món đồ chơi an toàn. Đừng quên vòng cổ định danh, túi địu cho chuyến đi, cùng tấm lót hoặc cát vệ sinh. Chuẩn bị trước giúp những ngày đầu bớt căng thẳng.",
    products: [19, 9, 10, 15]
  },
  {
    id: 4,
    emoji: "🦴", color: "#ffedd5",
    title: "Cách chọn đồ ăn vặt lành mạnh",
    excerpt: "Cần tìm gì ở đồ ăn vặt và cách giữ chúng ở mức nhỏ trong khẩu phần.",
    body: "Chọn đồ ăn vặt có thành phần đơn giản, dễ nhận biết và tránh phẩm màu nhân tạo. Đồ ăn vặt một thành phần như thịt sấy khô là lựa chọn tuyệt vời. Đồ ăn vặt không nên chiếm quá 10% lượng calo hằng ngày — hãy giảm bữa chính tương ứng để tránh tăng cân.",
    products: [5, 26, 7]
  }
];

const BRANDS = [...new Set(PRODUCTS.map(p => p.brand))];

function getProduct(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}

function getCategory(id) {
  return CATEGORIES.find(c => c.id === id);
}

function formatPrice(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

function starsHTML(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "⯨" : "") + "☆".repeat(empty);
}
