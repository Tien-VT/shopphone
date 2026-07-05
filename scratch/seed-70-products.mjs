import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const sourceDir = "C:\\Users\\tient\\.gemini\\antigravity-ide\\brain\\c2a5511a-b21e-481b-bf55-bd120e0a7e28";
const destDir = "d:\\website-ban-dthoai\\shopnow\\public\\uploads\\products";

// Ensure destination directory exists
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

// 7 Flagship images to copy
const flagshipImages = [
  { src: "ipad_pro_m4_1783152233120.png", dest: "ipad-pro-m4.png" },
  { src: "lg_ultragear_oled_1783152245590.png", dest: "lg-ultragear-oled.png" },
  { src: "keyboard_mouse_combo_1783152257282.png", dest: "keyboard-mouse-combo.png" },
  { src: "marshall_acton_3_1783152269002.png", dest: "marshall-acton-3.png" },
  { src: "google_nest_hub_1783152281025.png", dest: "google-nest-hub.png" },
  { src: "sony_alpha_7_4_1783152292050.png", dest: "sony-alpha-7-4.png" },
  { src: "samsung_t9_ssd_1783152302869.png", dest: "samsung-t9-ssd.png" }
];

// Product Template generator to build 70 products
const categoryProducts = {
  // Category 6: Máy tính bảng (Tablet)
  6: [
    { name: "Apple iPad Pro M4 (13-inch)", price: 37990000, old_price: 39990000, spec: "Màn hình: 13\" Tandem OLED\nCPU: Apple M4\nRAM: 8GB / 16GB\nBộ nhớ: 256GB / 512GB", desc: "iPad Pro mỏng nhất, mạnh mẽ nhất với màn hình OLED thế hệ mới và chip M4.", var1: { name: "Bản Wifi 256GB Space Black", sku: "IPAD-M4-WIFI-BLK", price: 37990000, col: "Space Black", hex: "#1e1f22" }, var2: { name: "Bản 5G 512GB Silver", sku: "IPAD-M4-5G-SLV", price: 44990000, col: "Silver", hex: "#e3e4e6" } },
    { name: "Apple iPad Air M2 (11-inch)", price: 16990000, old_price: 17990000, spec: "Màn hình: 11\" Liquid Retina\nCPU: Apple M2\nRAM: 8GB\nBộ nhớ: 128GB / 256GB", desc: "Sức mạnh từ chip M2 giúp xử lý mượt mà mọi tác vụ học tập và sáng tạo.", var1: { name: "Bản Wifi 128GB Space Gray", sku: "IPAD-AIR-M2-128", price: 16990000, col: "Space Gray", hex: "#5c5e62" }, var2: { name: "Bản Wifi 256GB Starlight", sku: "IPAD-AIR-M2-256", price: 19990000, col: "Starlight", hex: "#f0ebe1" } },
    { name: "Samsung Galaxy Tab S9 Ultra", price: 30990000, old_price: 32990000, spec: "Màn hình: 14.6\" Dynamic AMOLED 2X\nCPU: Snapdragon 8 Gen 2\nRAM: 12GB\nBộ nhớ: 256GB / 512GB", desc: "Màn hình siêu lớn, bút S Pen đi kèm và khả năng đa nhiệm DeX mạnh mẽ như laptop.", var1: { name: "Bản 5G 256GB Graphite", sku: "TAB-S9U-256-GRPH", price: 30990000, col: "Graphite", hex: "#2b2c2d" }, var2: { name: "Bản 5G 512GB Beige", sku: "TAB-S9U-512-BEG", price: 34990000, col: "Beige", hex: "#e6dfd3" } },
    { name: "Samsung Galaxy Tab S9 FE", price: 9990000, old_price: 11990000, spec: "Màn hình: 10.9\" IPS LCD, 90Hz\nCPU: Exynos 1380\nRAM: 6GB / 8GB\nBộ nhớ: 128GB / 256GB", desc: "Trải nghiệm viết vẽ với S Pen mượt mà, màn hình lớn sắc nét với mức giá cực kỳ dễ tiếp cận.", var1: { name: "Bản Wifi 128GB Mint", sku: "TAB-S9FE-MNT", price: 9990000, col: "Mint", hex: "#d0ebd9" }, var2: { name: "Bản 5G 256GB Gray", sku: "TAB-S9FE-5G-GRY", price: 12990000, col: "Gray", hex: "#4f5154" } },
    { name: "Xiaomi Pad 6 Pro", price: 8490000, old_price: 9490000, spec: "Màn hình: 11\" IPS LCD 144Hz\nCPU: Snapdragon 8+ Gen 1\nRAM: 8GB\nBộ nhớ: 128GB / 256GB", desc: "Màn hình 144Hz siêu mượt và sạc siêu nhanh 67W đem lại trải nghiệm giải trí tuyệt hảo.", var1: { name: "Bản 8GB/128GB Black", sku: "XIAOMI-PAD6P-128", price: 8490000, col: "Black", hex: "#111111" }, var2: { name: "Bản 8GB/256GB Blue", sku: "XIAOMI-PAD6P-256", price: 9490000, col: "Blue", hex: "#a4c2e6" } },
    { name: "Lenovo Tab P12", price: 7990000, old_price: 8990000, spec: "Màn hình: 12.7\" LTPS LCD 3K\nCPU: MediaTek Dimensity 7050\nRAM: 8GB\nBộ nhớ: 128GB / 256GB", desc: "Màn hình 3K siêu sắc nét đi kèm bút vẽ stylus, lý tưởng cho nhu cầu giải trí gia đình.", var1: { name: "Bản 128GB Storm Grey", sku: "LENOVO-P12-GRY", price: 7990000, col: "Storm Grey", hex: "#6c6f73" }, var2: { name: "Bản 256GB Oat", sku: "LENOVO-P12-OAT", price: 8990000, col: "Oat", hex: "#e0d9cb" } },
    { name: "Apple iPad Gen 10", price: 9490000, old_price: 10490000, spec: "Màn hình: 10.9\" Liquid Retina\nCPU: Apple A14 Bionic\nRAM: 4GB\nBộ nhớ: 64GB / 256GB", desc: "Thiết kế năng động nhiều màu sắc, nút Home biến mất mang lại không gian hiển thị rộng rãi.", var1: { name: "Bản Wifi 64GB Blue", sku: "IPAD-G10-64-BLU", price: 9490000, col: "Blue", hex: "#2b7dfa" }, var2: { name: "Bản Wifi 256GB Pink", sku: "IPAD-G10-256-PNK", price: 13490000, col: "Pink", hex: "#fa6e9f" } },
    { name: "Huawei MatePad Pro 12.2", price: 21990000, old_price: 23990000, spec: "Màn hình: 12.2\" Tandem OLED PaperMatte\nCPU: Kirin 9010W\nRAM: 12GB\nBộ nhớ: 256GB / 512GB", desc: "Màn hình nhám chống lóa PaperMatte đột phá, giảm mỏi mắt khi vẽ và đọc sách.", var1: { name: "Bản 256GB Gold Edition", sku: "HUAWEI-MATE-GLD", price: 21990000, col: "Gold", hex: "#eedab3" }, var2: { name: "Bản 512GB Black", sku: "HUAWEI-MATE-BLK", price: 24990000, col: "Black", hex: "#1e1e1e" } },
    { name: "Kindle Paperwhite 5", price: 3990000, old_price: 4500000, spec: "Màn hình: 6.8\" E-ink Carta 1200\nCPU: Custom\nRAM: 512MB\nBộ nhớ: 16GB / 32GB", desc: "Máy đọc sách chống nước hàng đầu thế giới với hệ thống đèn nền vàng điều chỉnh thông minh.", var1: { name: "Bản 16GB Black", sku: "KINDLE-PW5-16", price: 3990000, col: "Black", hex: "#1c1c1c" }, var2: { name: "Bản Signature 32GB Agave Green", sku: "KINDLE-PW5-32", price: 4990000, col: "Agave Green", hex: "#7a8a7c" } },
    { name: "Xiaomi Redmi Pad SE", price: 3490000, old_price: 3990000, spec: "Màn hình: 11\" IPS LCD 90Hz\nCPU: Snapdragon 680\nRAM: 4GB / 6GB / 8GB\nBộ nhớ: 128GB", desc: "Màn hình bảo vệ mắt 90Hz chất lượng cao, vỏ nhôm nguyên khối bền đẹp sang trọng.", var1: { name: "Bản 4GB RAM Graphite Gray", sku: "REDMI-SE-4G", price: 3490000, col: "Graphite Gray", hex: "#3a3c3e" }, var2: { name: "Bản 8GB RAM Mint Green", sku: "REDMI-SE-8G", price: 4490000, col: "Mint Green", hex: "#bfead6" } }
  ],
  // Category 7: Màn hình máy tính (Monitor)
  7: [
    { name: "LG UltraGear OLED 27GR95QE", price: 18990000, old_price: 21990000, spec: "Màn hình: 27\" OLED QHD (2560x1440)\nTần số quét: 240Hz\nTốc độ phản hồi: 0.03ms\nCổng kết nối: HDMI 2.1, DP 1.4", desc: "Màn hình gaming OLED đỉnh cao với tần số quét 240Hz siêu mượt và tốc độ phản hồi 0.03ms cực nhanh.", var1: { name: "Màu Đen (Black Stand)", sku: "LG-27GR-BLK", price: 18990000, col: "Black", hex: "#111111" }, var2: { name: "Kèm Giá treo Ergo", sku: "LG-27GR-ERGO", price: 20990000, col: "Black Ergo", hex: "#222222" } },
    { name: "Dell Ultrasharp U2424H", price: 5490000, old_price: 5990000, spec: "Màn hình: 23.8\" IPS FHD\nTần số quét: 120Hz\nĐộ phủ màu: 100% sRGB\nCổng kết nối: HDMI, DP, USB-C", desc: "Chuẩn mực màn hình thiết kế đồ họa với màu sắc chuẩn xác, chân đế công thái học thông minh.", var1: { name: "Bản Standard Silver", sku: "DELL-U2424-SLV", price: 5490000, col: "Silver", hex: "#cccccc" }, var2: { name: "Bản Tích Hợp Loa", sku: "DELL-U2424-SPK", price: 5990000, col: "Silver Pro", hex: "#d8d8d8" } },
    { name: "ASUS ROG Swift PG32UCDM", price: 36990000, old_price: 39990000, spec: "Màn hình: 31.5\" QD-OLED 4K\nTần số quét: 240Hz\nTốc độ phản hồi: 0.03ms\nĐộ sáng: 1000 nits", desc: "Màn hình QD-OLED thế hệ mới nhất cho chất lượng hình ảnh 4K HDR rực rỡ và tốc độ chơi game phản xạ tức thì.", var1: { name: "Màu Đen ROG", sku: "ASUS-PG32-BLK", price: 36990000, col: "ROG Black", hex: "#0a0a0a" }, var2: { name: "Bản Giới Hạn Trắng", sku: "ASUS-PG32-WHT", price: 39990000, col: "ROG White", hex: "#ffffff" } },
    { name: "Samsung Odyssey G9 G95C", price: 28990000, old_price: 32990000, spec: "Màn hình: 49\" DQHD Dual QHD, 1000R\nTần số quét: 240Hz\nTốc độ phản hồi: 1ms\nTỷ lệ khung hình: 32:9", desc: "Màn hình siêu rộng 49 inch cong 1000R bao quát trọn vẹn tầm nhìn, tối ưu tác vụ thiết kế và chơi game giả lập.", var1: { name: "Màu Đen Odyssey", sku: "SS-OD-G9-BLK", price: 28990000, col: "Black", hex: "#1c1d1f" }, var2: { name: "Màu Trắng Odyssey", sku: "SS-OD-G9-WHT", price: 29990000, col: "White", hex: "#f0f2f5" } },
    { name: "Dell S2721QS 4K", price: 7990000, old_price: 8990000, spec: "Màn hình: 27\" IPS 4K UHD\nTần số quét: 60Hz\nTích hợp loa: Có (2x3W)\nHỗ trợ: AMD FreeSync", desc: "Màn hình giải trí gia đình độ phân giải 4K sắc nét, hỗ trợ chân đế xoay dọc linh hoạt.", var1: { name: "Màu Bạc Tinh Tế", sku: "DELL-S2721-SLV", price: 7990000, col: "Silver", hex: "#dedede" }, var2: { name: "Màu Đen Nhám", sku: "DELL-S2721-BLK", price: 7990000, col: "Black", hex: "#222222" } },
    { name: "LG DualUp 28MQ780", price: 12990000, old_price: 14990000, spec: "Màn hình: 27.6\" SDQHD (2560 x 2880)\nTỷ lệ: 16:18 độc đáo\nChân đế: Ergo Arm kẹp bàn\nCổng kết nối: USB-C sạc 90W", desc: "Thiết kế màn hình dọc kép sáng tạo tương đương hai màn hình 21.5 inch xếp chồng, tối đa hóa không gian lập trình.", var1: { name: "Kèm Ergo Arm Đen", sku: "LG-DUALUP-ERGO", price: 12990000, col: "Charcoal", hex: "#2d2d2d" }, var2: { name: "Bản Chỉ Màn Hình", sku: "LG-DUALUP-STD", price: 11990000, col: "Charcoal Stand", hex: "#3d3d3d" } },
    { name: "Gigabyte M27Q", price: 6990000, old_price: 7990000, spec: "Màn hình: 27\" Super Speed IPS QHD\nTần số quét: 170Hz\nTốc độ phản hồi: 0.5ms\nTích hợp KVM: Có", desc: "Màn hình gaming đầu tiên tích hợp nút chuyển đổi KVM, điều khiển 2 máy tính chỉ bằng 1 bộ phím chuột.", var1: { name: "Màu Đen Giga", sku: "GIGA-M27Q-BLK", price: 6990000, col: "Black", hex: "#1f1f1f" }, var2: { name: "Màu Đen Bản Pro", sku: "GIGA-M27QP-BLK", price: 7990000, col: "Black Pro", hex: "#101010" } },
    { name: "ViewSonic VA2432-H", price: 2190000, old_price: 2590000, spec: "Màn hình: 23.8\" IPS FHD\nTần số quét: 100Hz\nThiết kế: 3 viền siêu mỏng\nBảo vệ mắt: Có", desc: "Màn hình văn phòng quốc dân thiết kế tràn viền thời trang, tần số quét 100Hz bảo vệ mắt tối đa.", var1: { name: "Màu Đen Văn Phòng", sku: "VIEW-VA24-BLK", price: 2190000, col: "Black", hex: "#262626" }, var2: { name: "Màu Trắng Sữa", sku: "VIEW-VA24-WHT", price: 2390000, col: "White", hex: "#f5f5f5" } },
    { name: "ASUS ProArt PA278QV", price: 8490000, old_price: 9490000, spec: "Màn hình: 27\" IPS WQHD (2560x1440)\nĐộ lệch màu: Delta E < 2\nĐộ phủ màu: 100% sRGB\nTần số quét: 75Hz", desc: "Màn hình đồ họa chuyên nghiệp đã được cân màu sẵn tại nhà máy, đạt chứng nhận Calman Verified.", var1: { name: "Màu Xám ProArt", sku: "ASUS-PA278-GRY", price: 8490000, col: "ProArt Grey", hex: "#44464a" }, var2: { name: "Màu Bạc Phân Giải 4K", sku: "ASUS-PA279-SLV", price: 11990000, col: "Silver 4K", hex: "#d2d4d6" } },
    { name: "Samsung ViewFinity S8", price: 10990000, old_price: 12990000, spec: "Màn hình: 27\" IPS 4K UHD\nĐộ sáng: HDR400\nCổng kết nối: USB-C sạc 90W\nĐộ phủ màu: 98% DCI-P3", desc: "Màn hình thiết kế chuyên nghiệp với tấm nền chống phản sáng Matte Display tiên tiến và sạc nhanh USB-C 90W.", var1: { name: "Màu Đen Matte", sku: "SS-VF-S8-BLK", price: 10990000, col: "Black Matte", hex: "#1c1c1d" }, var2: { name: "Màu Trắng Matte", sku: "SS-VF-S8-WHT", price: 11490000, col: "White Matte", hex: "#fafafa" } }
  ],
  // Category 8: Bàn phím & Chuột (Keyboard & Mouse)
  8: [
    { name: "Logitech MX Master 3S", price: 2490000, old_price: 2790000, spec: "Cảm biến: Darkfield 8000 DPI\nNút cuộn: MagSpeed điện từ\nKết nối: Logi Bolt, Bluetooth\nThời lượng pin: 70 ngày", desc: "Chuột công thái học cao cấp chuyên dùng cho lập trình viên và nhà thiết kế với nút cuộn vô cực.", var1: { name: "Màu Graphite (Đen xám)", sku: "LOGI-MX3S-GRPH", price: 2490000, col: "Graphite", hex: "#353535" }, var2: { name: "Màu Pale Gray (Trắng xám)", sku: "LOGI-MX3S-WHT", price: 2490000, col: "Pale Gray", hex: "#e5e3df" } },
    { name: "Keychron K2 V2 (Hot-swappable)", price: 1890000, old_price: 2190000, spec: "Bố cục: 75% compact\nSwitch: Gateron G Pro (Blue/Red/Brown)\nKết nối: Bluetooth 5.1 & Cáp Type-C\nPin: 4000mAh", desc: "Bàn phím cơ không dây quốc dân hỗ trợ thay nóng switch nhanh chóng, tương thích hoàn hảo macOS.", var1: { name: "Keychron K2 Red Switch / Nhôm LED RGB", sku: "KEY-K2V2-RED", price: 1890000, col: "RGB Red Switch", hex: "#ea4335" }, var2: { name: "Keychron K2 Brown Switch / Nhôm LED RGB", sku: "KEY-K2V2-BRW", price: 1890000, col: "RGB Brown Switch", hex: "#8b5a2b" } },
    { name: "Logitech G Pro X Superlight 2", price: 3590000, old_price: 3990000, spec: "Trọng lượng: 60g siêu nhẹ\nCảm biến: HERO 2 (32,000 DPI)\nTần số gửi: 4000Hz không dây\nSwitch: Hybrid Lightforce", desc: "Huyền thoại chuột gaming bắn súng FPS thế hệ thứ 2 với tần số phản hồi siêu tốc 4KHz.", var1: { name: "Màu Đen Gaming", sku: "LOGI-SL2-BLK", price: 3590000, col: "Black", hex: "#111111" }, var2: { name: "Màu Hồng Magenta", sku: "LOGI-SL2-PNK", price: 3590000, col: "Magenta", hex: "#d91b5c" } },
    { name: "Razer DeathAdder V3 Pro", price: 3190000, old_price: 3590000, spec: "Trọng lượng: 63g\nCảm biến: Focus Pro 30K Optical\nSwitch: Razer Optical Gen-3\nThời lượng pin: 90 giờ", desc: "Thiết kế chuột công thái học gaming huyền thoại được tinh chỉnh cùng các game thủ chuyên nghiệp eSports.", var1: { name: "Màu Đen Razer", sku: "RAZER-DA3-BLK", price: 3190000, col: "Black", hex: "#121212" }, var2: { name: "Màu Trắng Razer", sku: "RAZER-DA3-WHT", price: 3190000, col: "White", hex: "#ffffff" } },
    { name: "Akko 3068B Plus Prunus Lunas", price: 1490000, old_price: 1690000, spec: "Bố cục: 68 phím compact\nSwitch: Akko CS Jelly (Pink/Purple)\nKết nối: 3 chế độ (Bluetooth / 2.4G / Type-C)\nKeycap: PBT Double-shot", desc: "Bàn phím cơ phối màu hoa anh đào lãng mạn, trang bị đầy đủ foam tiêu âm cho âm thanh êm ái.", var1: { name: "Jelly Pink Switch (Lực nhấn nhẹ)", sku: "AKKO-3068-PNK", price: 1490000, col: "Pink Switch", hex: "#ffc0cb" }, var2: { name: "Jelly Purple Switch (Lực nhấn vừa)", sku: "AKKO-3068-PPL", price: 1490000, col: "Purple Switch", hex: "#800080" } },
    { name: "Logitech MX Keys S", price: 2790000, old_price: 3090000, spec: "Phím nhấn: Thiết kế lõm ngón tay\nĐèn nền: Tự động điều chỉnh thông minh\nKết nối: Đa thiết bị Easy-Switch\nSạc: Type-C", desc: "Bàn phím mỏng văn phòng chuyên nghiệp, đem lại cảm giác gõ phím êm ái, chính xác tuyệt đối.", var1: { name: "Màu Graphite", sku: "LOGI-MXKEYS-S-GR", price: 2790000, col: "Graphite", hex: "#3e3f42" }, var2: { name: "Màu Pale Gray", sku: "LOGI-MXKEYS-S-PL", price: 2790000, col: "Pale Gray", hex: "#eaeae8" } },
    { name: "Royal Kludge RK61", price: 790000, old_price: 990000, spec: "Bố cục: 60% siêu nhỏ gọn\nSwitch: RK Switch\nĐèn nền: LED RGB nhiều chế độ\nKết nối: Bluetooth & Dây", desc: "Bàn phím cơ mini giá rẻ phù hợp cho học sinh sinh viên và những người thích xê dịch.", var1: { name: "Màu Đen RK Red Switch", sku: "RK61-BLK-RED", price: 790000, col: "Black Red Switch", hex: "#1f1f1f" }, var2: { name: "Màu Trắng RK Blue Switch", sku: "RK61-WHT-BLU", price: 790000, col: "White Blue Switch", hex: "#fdfdfd" } },
    { name: "SteelSeries Apex Pro TKL", price: 4990000, old_price: 5490000, spec: "Switch: OmniPoint 2.0 cảm biến từ\nĐiểm nhận phím: Điều chỉnh từ 0.2mm - 3.8mm\nMàn hình: OLED hiển thị thông minh\nKhung: Nhôm máy bay", desc: "Bàn phím chơi game nhanh nhất thế giới nhờ switch từ tính điều chỉnh hành trình siêu nhạy.", var1: { name: "Bản TKL Không Dây (Wireless)", sku: "STEEL-APEX-WL", price: 6490000, col: "Black Wireless", hex: "#151515" }, var2: { name: "Bản TKL Có Dây (Wired)", sku: "STEEL-APEX-WD", price: 4990000, col: "Black Wired", hex: "#1a1a1a" } },
    { name: "Logitech Pebble 2 Combo", price: 890000, old_price: 1090000, spec: "Kết nối: Bluetooth đa thiết bị\nChuột: Pebble Mouse 2 click im lặng\nBàn phím: Pebble Keys 2 siêu mỏng\nChất liệu: Nhựa tái chế thân thiện", desc: "Bộ đôi chuột bàn phím siêu mỏng nhẹ, tối giản thời trang lý tưởng làm việc cơ động.", var1: { name: "Màu Hồng Sand", sku: "LOGI-PEB2-PNK", price: 890000, col: "Rose Sand", hex: "#eedcd3" }, var2: { name: "Màu Đen Tonal", sku: "LOGI-PEB2-BLK", price: 890000, col: "Tonal Black", hex: "#2c2d30" } },
    { name: "Corsair K70 RGB PRO", price: 3990000, old_price: 4390000, spec: "Switch: CHERRY MX (Red/Blue)\nCông nghệ: CORSAIR AXON 8000Hz\nĐèn nền: Per-key RGB\nKhung: Nhôm xước đen", desc: "Bàn phím cơ gaming chuyên nghiệp trang bị nút chuyển chế độ giải đấu (Tournament Switch) chống phân tâm.", var1: { name: "Cherry MX Red (Gõ êm)", sku: "CORSAIR-K70-RED", price: 3990000, col: "Red Switch", hex: "#ff3333" }, var2: { name: "Cherry MX Blue (Gõ giòn)", sku: "CORSAIR-K70-BLU", price: 3990000, col: "Blue Switch", hex: "#3333ff" } }
  ],
  // Category 9: Loa & Âm thanh (Speaker/Audio)
  9: [
    { name: "Marshall Acton III", price: 6790000, old_price: 7490000, spec: "Công suất: 30W Class D\nKết nối: Bluetooth 5.2, AUX 3.5mm\nTần số phản hồi: 45 - 20,000 Hz\nTrọng lượng: 2.85 kg", desc: "Loa đặt bàn thiết kế cổ điển phong cách Marshall, nâng cấp âm trường rộng rãi bao trùm căn phòng.", var1: { name: "Màu Black (Đen cổ điển)", sku: "MAR-ACTON3-BLK", price: 6790000, col: "Black", hex: "#111111" }, var2: { name: "Màu Cream (Trắng kem)", sku: "MAR-ACTON3-CRM", price: 6790000, col: "Cream", hex: "#f3eedd" } },
    { name: "Marshall Stanmore III", price: 9790000, old_price: 10790000, spec: "Công suất: 80W Class D\nKết nối: Bluetooth 5.2, AUX, RCA\nTần số phản hồi: 45 - 20,000 Hz\nTrọng lượng: 4.25 kg", desc: "Dòng loa công suất lớn cho âm thanh cực kỳ mạnh mẽ, dải bass uy lực đặc trưng của hãng.", var1: { name: "Màu Black", sku: "MAR-STAN3-BLK", price: 9790000, col: "Black", hex: "#121212" }, var2: { name: "Màu Brown (Nâu da)", sku: "MAR-STAN3-BRW", price: 9790000, col: "Brown", hex: "#4a2d1d" } },
    { name: "JBL Charge 5", price: 3490000, old_price: 3990000, spec: "Công suất: 40W RMS\nKết nối: Bluetooth 5.1\nKháng bụi nước: IP67\nPin: 20 giờ, kiêm sạc dự phòng", desc: "Loa di động chống nước dã ngoại tuyệt vời với chất âm JBL Original Pro Sound sống động.", var1: { name: "Màu Đen Mạnh Mẽ", sku: "JBL-C5-BLK", price: 3490000, col: "Black", hex: "#1a1a1a" }, var2: { name: "Màu Xanh Rêu Camo", sku: "JBL-C5-CAMO", price: 3490000, col: "Camo", hex: "#556b2f" } },
    { name: "JBL Flip 6", price: 2690000, old_price: 2990000, spec: "Công suất: 30W RMS\nKết nối: Bluetooth 5.1\nKháng bụi nước: IP67\nPin: 12 giờ", desc: "Loa hình trụ nhỏ gọn đút túi dễ dàng, mang âm thanh mạnh mẽ khuấy động mọi cuộc chơi.", var1: { name: "Màu Đỏ Nổi Bật", sku: "JBL-F6-RED", price: 2690000, col: "Red", hex: "#cc0000" }, var2: { name: "Màu Xanh Dương", sku: "JBL-F6-BLU", price: 2690000, col: "Blue", hex: "#0044cc" } },
    { name: "Bose SoundLink Flex", price: 3890000, old_price: 4290000, spec: "Công nghệ: PositionIQ tự tối ưu âm thanh\nKết nối: Bluetooth 4.2\nKháng bụi nước: IP67 (Nổi trên mặt nước)\nPin: 12 giờ", desc: "Thiết kế bền bỉ chống chịu mọi va đập, âm thanh trong trẻo, chi tiết trung thực tuyệt đối.", var1: { name: "Màu Stone Blue", sku: "BOSE-FLEX-BLU", price: 3890000, col: "Stone Blue", hex: "#5b768a" }, var2: { name: "Màu Black", sku: "BOSE-FLEX-BLK", price: 3890000, col: "Black", hex: "#1e1e1e" } },
    { name: "Harman Kardon Aura Studio 4", price: 6990000, old_price: 7990000, spec: "Công suất: 130W siêu khủng\nLoa trầm: 5.2\" Subwoofer\nĐèn led: 5 chủ đề ánh sáng kim cương\nKết nối: Bluetooth 4.2", desc: "Thiết kế mái vòm trong suốt độc đáo tích hợp đèn led hiệu ứng kim cương huyền ảo cùng âm thanh vòm 360 độ.", var1: { name: "Màu Đen Huyền Bí", sku: "HK-AURA4-BLK", price: 6990000, col: "Black Dome", hex: "#0a0a0b" }, var2: { name: "Bản Nhập Khẩu Mỹ", sku: "HK-AURA4-US", price: 7490000, col: "Black US", hex: "#151517" } },
    { name: "Apple HomePod 2", price: 7990000, old_price: 8490000, spec: "Công nghệ: Âm thanh không gian Spatial Audio\nTrợ lý ảo: Siri điều khiển nhà thông minh\nCảm biến: Đo nhiệt độ & độ ẩm phòng\nKết nối: Wifi, AirPlay 2", desc: "Mẫu loa thông minh cao cấp từ Apple, mang lại trải nghiệm âm thanh đắm chìm và kết nối hoàn hảo với hệ sinh thái Apple.", var1: { name: "Màu Midnight (Đen huyền)", sku: "APPLE-HP2-MID", price: 7990000, col: "Midnight", hex: "#1d1f21" }, var2: { name: "Màu White (Trắng tinh tế)", sku: "APPLE-HP2-WHT", price: 7990000, col: "White", hex: "#fcfcfc" } },
    { name: "Sony SRS-XB100", price: 1290000, old_price: 1490000, spec: "Công nghệ: Extra Bass mạnh mẽ\nKháng bụi nước: IP67\nPin: 16 giờ sử dụng\nKết nối: Bluetooth 5.3", desc: "Loa di động mini siêu nhỏ gọn có quai treo tiện dụng, công suất lớn vượt trội so với ngoại hình.", var1: { name: "Màu Cam Năng Động", sku: "SONY-XB100-ORG", price: 1290000, col: "Orange", hex: "#ff5722" }, var2: { name: "Màu Xanh Ngọc", sku: "SONY-XB100-GRN", price: 1290000, col: "Light Green", hex: "#8be0c6" } },
    { name: "Marshall Willen", price: 2490000, old_price: 2790000, spec: "Công suất: 10W Class D\nKháng bụi nước: IP67\nPin: 15 giờ sử dụng\nTrọng lượng: 0.31 kg", desc: "Dòng loa bỏ túi nhỏ gọn nhất của Marshall, có đai cao su kẹp cố định vào balo hoặc xe đạp cực kỳ đa năng.", var1: { name: "Màu Đen Đồng (Brass)", sku: "MAR-WILL-BLK", price: 2490000, col: "Black Brass", hex: "#191919" }, var2: { name: "Màu Kem Cream", sku: "MAR-WILL-CRM", price: 2490000, col: "Cream", hex: "#efebe0" } },
    { name: "B&O Beosound A1 2nd Gen", price: 7290000, old_price: 7990000, spec: "Công nghệ: Âm thanh 360 độ B&O Signature\nChống nước: IP67\nPin: 18 giờ\nTrợ lý ảo: Tích hợp Alexa", desc: "Tác phẩm nghệ thuật loa di động siêu cao cấp với chất liệu vỏ nhôm thổi cát siêu mịn từ Đan Mạch.", var1: { name: "Màu Grey Mist (Xám bạc)", sku: "BO-A1-GREY", price: 7290000, col: "Grey Mist", hex: "#b5b7b9" }, var2: { name: "Màu Gold Tone (Vàng ánh kim)", sku: "BO-A1-GOLD", price: 7590000, col: "Gold Tone", hex: "#dac8ad" } }
  ],
  // Category 10: Thiết bị nhà thông minh (Smart Home)
  10: [
    { name: "Google Nest Hub Gen 2", price: 1890000, old_price: 2200000, spec: "Màn hình: 7\" Touch Screen\nCảm biến: Motion Sense (theo dõi giấc ngủ)\nLoa: Bass khỏe hơn 50%\nKết nối: Wifi, Bluetooth", desc: "Màn hình trung tâm điều khiển nhà thông minh bằng giọng nói, hiển thị camera và tự động hóa các thiết bị Nest.", var1: { name: "Màu Chalk (Trắng xám)", sku: "NEST-HUB-WHT", price: 1890000, col: "Chalk", hex: "#eaeaea" }, var2: { name: "Màu Charcoal (Đen xám)", sku: "NEST-HUB-BLK", price: 1890000, col: "Charcoal", hex: "#3e3e3e" } },
    { name: "Xiaomi Smart Camera C300", price: 790000, old_price: 990000, spec: "Độ phân giải: 2K (2304x1296)\nGóc quay: 360 độ ngang, 108 độ dọc\nHồng ngoại đêm: Có\nĐàm thoại 2 chiều: Có", desc: "Camera an ninh gia đình thông minh tự động nhận diện con người bằng AI và cảnh báo chuyển động tức thì.", var1: { name: "Bản Tiêu Chuẩn Trắng", sku: "XIAOMI-C300-WHT", price: 790000, col: "White", hex: "#ffffff" }, var2: { name: "Bản Kèm Thẻ nhớ 64GB", sku: "XIAOMI-C300-64G", price: 890000, col: "White Set", hex: "#f0f0f0" } },
    { name: "Đèn thông minh Philips Hue White", price: 490000, old_price: 590000, spec: "Chuôi đèn: E27\nĐộ sáng: 800 lumens (tương đương 60W)\nNhiệt độ màu: 2700K (Vàng ấm)\nKết nối: Bluetooth & Zigbee", desc: "Đèn led thông minh hỗ trợ chỉnh độ sáng qua ứng dụng di động hoặc bằng giọng nói, hẹn giờ tự động.", var1: { name: "Đuôi E27 Đơn", sku: "PHILIPS-HUE-E27", price: 490000, col: "Warm White", hex: "#ffdfa9" }, var2: { name: "Combo 2 Bóng", sku: "PHILIPS-HUE-2PACK", price: 890000, col: "Warm White Pack", hex: "#ffe6bd" } },
    { name: "Ổ cắm thông minh Tuya Wifi 16A", price: 150000, old_price: 250000, spec: "Dòng tải: Tối đa 16A\nĐo điện tiêu thụ: Có\nKết nối: Wifi 2.4GHz\nHẹn giờ bật tắt: Có", desc: "Biến các thiết bị gia dụng thông thường thành thiết bị thông minh bằng ổ cắm hẹn giờ điều khiển từ xa.", var1: { name: "Bản US Chân Dẹt", sku: "TUYA-PLUG-US", price: 150000, col: "White US", hex: "#fafafa" }, var2: { name: "Bản tròn EU", sku: "TUYA-PLUG-EU", price: 150000, col: "White EU", hex: "#fafafb" } },
    { name: "Google Nest Mini Gen 2", price: 690000, old_price: 890000, spec: "Trợ lý ảo: Google Assistant\nKết nối: Wifi, Bluetooth\nChất liệu: Nhựa tái chế 100%\nLoa: Âm thanh nâng cấp bass", desc: "Loa thông minh mini giá rẻ hỗ trợ điều khiển thiết bị bằng tiếng Việt cực kỳ mượt mà.", var1: { name: "Màu Chalk (Xám trắng)", sku: "NEST-MINI-CHALK", price: 690000, col: "Chalk", hex: "#efefef" }, var2: { name: "Màu Charcoal (Đen)", sku: "NEST-MINI-CHAR", price: 690000, col: "Charcoal", hex: "#222222" } },
    { name: "Robot hút bụi Roborock Q Revo", price: 15990000, old_price: 17990000, spec: "Lực hút: 5500 Pa\nLau xoay: 200 vòng/phút\nTự giặt giẻ & sấy khô: Có\nĐịnh vị: Lidar PreciSense", desc: "Robot hút bụi lau nhà thông minh tự động hoàn toàn: giặt giẻ, sấy nóng, hút rác lên dock và tự bơm nước.", var1: { name: "Màu Trắng Sang Trọng", sku: "ROBOROCK-Q-WHT", price: 15990000, col: "White", hex: "#fafcfc" }, var2: { name: "Màu Đen Lịch Lãm", sku: "ROBOROCK-Q-BLK", price: 15990000, col: "Black", hex: "#1c1c1e" } },
    { name: "Xiaomi Smart Air Purifier 4", price: 2990000, old_price: 3490000, spec: "Diện tích sử dụng: 28 - 48m²\nTốc độ lọc: CADR 400m³/h\nMàng lọc: HEPA 3 lớp lọc bụi mịn PM2.5\nĐộ ồn: Tối thiểu 32.1 dB", desc: "Máy lọc không khí thế hệ thứ 4 loại bỏ 99.97% bụi mịn và khử mùi hôi động vật nhanh chóng.", var1: { name: "Màu Trắng Sạch Sẽ", sku: "MIAIR-4-WHT", price: 2990000, col: "White", hex: "#ffffff" }, var2: { name: "Bản Air Purifier 4 Lite", sku: "MIAIR-4L-WHT", price: 2190000, col: "Lite White", hex: "#fbfbfb" } },
    { name: "Khóa cửa thông minh Xiaomi E10", price: 3290000, old_price: 3990000, spec: "Phương thức mở: Vân tay, Mật khẩu, NFC, Khóa cơ, App\nTuổi thọ pin: 12 tháng\nBảo mật: Lõi khóa cấp C\nKết nối: Bluetooth", desc: "Khóa cửa vân tay thông minh nhiều phương thức bảo mật chống phá khóa, tích hợp chuông cửa.", var1: { name: "Màu Đen Nhám Nhôm", sku: "XIAOMI-E10-BLK", price: 3290000, col: "Matte Black", hex: "#1f1f21" }, var2: { name: "Bản Lắp Đặt Tại Nhà", sku: "XIAOMI-E10-INSTALL", price: 3790000, col: "Black Installed", hex: "#111112" } },
    { name: "Công tắc thông minh Aqara D1", price: 550000, old_price: 650000, spec: "Chuẩn kết nối: Zigbee 3.0\nPhiên bản: Có dây nguội (Neutral) / Không dây nguội\nSố nút: 1 / 2 / 3 nút\nKhung: Chuẩn vuông EU/VN", desc: "Công tắc thông minh cao cấp kết nối ổn định qua sóng Zigbee, giúp điều khiển đèn từ xa không trễ.", var1: { name: "Loại 2 Nút (Không dây nguội)", sku: "AQARA-D1-2B", price: 550000, col: "White 2-Button", hex: "#ffffff" }, var2: { name: "Loại 3 Nút (Có dây nguội)", sku: "AQARA-D1-3B", price: 650000, col: "White 3-Button", hex: "#fbfcfd" } },
    { name: "Cảm biến chuyển động Aqara", price: 390000, old_price: 490000, spec: "Góc quét: 170 độ\nKhoảng cách phát hiện: 7m\nKết nối: Zigbee\nThời lượng pin: 2 năm", desc: "Thiết bị cảm biến siêu nhỏ tự động bật đèn khi có người đi qua phòng, tiết kiệm năng lượng tối đa.", var1: { name: "Bản Tiêu Chuẩn Trắng", sku: "AQARA-MOTION-WHT", price: 390000, col: "White", hex: "#ffffff" }, var2: { name: "Combo 2 Cảm Biến", sku: "AQARA-MOTION-2PACK", price: 720000, col: "White Pack", hex: "#eeeeee" } }
  ],
  // Category 11: Máy ảnh & Máy quay (Camera)
  11: [
    { name: "Sony Alpha 7 IV", price: 54990000, old_price: 59900000, spec: "Cảm biến: Full-frame Exmor R CMOS 33 MP\nBộ xử lý: BIONZ XR\nLấy nét: Real-time Eye AF (Người/Động vật)\nQuay phim: 4K 60p 10-bit 4:2:2", desc: "Máy ảnh mirrorless lai hoàn hảo giữa chụp ảnh độ phân giải cao và quay phim chuyên nghiệp.", var1: { name: "Body Only (Chỉ Thân Máy)", sku: "SONY-A7M4-BODY", price: 54990000, col: "Black Body", hex: "#1c1c1c" }, var2: { name: "Kèm Ống Kính Kit 28-70mm", sku: "SONY-A7M4-KIT", price: 60990000, col: "Black Kit", hex: "#111111" } },
    { name: "Fujifilm X-T5", price: 43990000, old_price: 46990000, spec: "Cảm biến: APS-C X-Trans CMOS 5 HR 40 MP\nBộ xử lý: X-Processor 5\nChống rung: IBIS 7 stops\nMàn hình: Xoay lật 3 chiều", desc: "Thiết kế hoài cổ sang trọng với các vòng xoay vật lý trực quan, công nghệ giả lập màu phim huyền thoại.", var1: { name: "Màu Black (Đen cổ điển)", sku: "FUJI-XT5-BLK", price: 43990000, col: "Black", hex: "#1a1a1a" }, var2: { name: "Màu Silver (Bạc retro)", sku: "FUJI-XT5-SLV", price: 43990000, col: "Silver", hex: "#b5b6b8" } },
    { name: "Canon EOS R50", price: 16990000, old_price: 18900000, spec: "Cảm biến: APS-C CMOS 24.2 MP\nLấy nét: Dual Pixel CMOS AF II\nQuay phim: 4K 30p (không crop)\nTrọng lượng: 375g siêu nhẹ", desc: "Máy ảnh nhỏ gọn thông minh lý tưởng cho các vlogger du lịch và người mới bắt đầu.", var1: { name: "Kèm Lens Kit 18-45mm Trắng", sku: "CANON-R50-WHT", price: 16990000, col: "White", hex: "#fbfcfd" }, var2: { name: "Kèm Lens Kit 18-45mm Đen", sku: "CANON-R50-BLK", price: 16990000, col: "Black", hex: "#1d1d1f" } },
    { name: "DJI Osmo Pocket 3", price: 12900000, old_price: 13900000, spec: "Cảm biến: CMOS 1-inch vượt trội\nMàn hình: 2\" xoay ngang/dọc cảm ứng\nChống rung: Gimbal vật lý 3 trục\nQuay phim: 4K 120fps", desc: "Camera bỏ túi đột phá trang bị cảm biến 1 inch thu sáng ban đêm cực tốt, tự động bám nét khuôn mặt.", var1: { name: "Bản Tiêu Chuẩn (Standard)", sku: "DJI-POCKET3-STD", price: 12900000, col: "Black", hex: "#222223" }, var2: { name: "Bản Creator Combo (Đầy đủ phụ kiện)", sku: "DJI-POCKET3-COMBO", price: 15800000, col: "Black Creator", hex: "#1a1a1b" } },
    { name: "GoPro Hero 12 Black", price: 9990000, old_price: 10990000, spec: "Độ phân giải: Video 5.3K60 / Hình ảnh 27MP\nChống rung: HyperSmooth 6.0\nKhả năng chịu nước: 10m không cần vỏ\nKết nối: Âm thanh bluetooth", desc: "Camera hành trình bền bỉ chịu va đập tốt nhất thế giới, hỗ trợ dải màu rộng HDR chuyên nghiệp.", var1: { name: "Bản Tiêu Chuẩn", sku: "GOPRO-12-STD", price: 9990000, col: "Black Speckled", hex: "#2f3237" }, var2: { name: "Combo Phụ Kiện Phượt", sku: "GOPRO-12-BUNDLE", price: 11490000, col: "Black Pack", hex: "#1e1e1f" } },
    { name: "Sony ZV-E10", price: 15990000, old_price: 17990000, spec: "Cảm biến: APS-C Exmor CMOS 24.2 MP\nMicrô: 3 viên định hướng kèm mút lọc gió\nMàn hình: Xoay lật đa góc tự sướng\nQuay phim: 4K HDR", desc: "Dòng máy ảnh cảm biến lớn thiết kế tối ưu riêng cho việc sáng tạo nội dung vlog xã hội.", var1: { name: "Body Only Trắng", sku: "SONY-ZVE10-WHT", price: 15990000, col: "White", hex: "#fafafa" }, var2: { name: "Body Kèm Lens Kit Đen", sku: "SONY-ZVE10-KIT", price: 18490000, col: "Black Kit", hex: "#121213" } },
    { name: "Insta360 X4", price: 13490000, old_price: 14500000, spec: "Độ phân giải: Video 360 độ 8K30fps / 5.7K60fps\nChống rung: FlowState 6 trục\nKháng nước: 10m\nMàn hình: 2.5\" kính Gorilla Glass", desc: "Camera quay toàn cảnh 360 độ thế hệ mới nâng cấp độ phân giải lên 8K siêu nét, chỉnh góc quay sau khi quay.", var1: { name: "Bản Tiêu Chuẩn 360", sku: "INSTA-X4-STD", price: 13490000, col: "Dark Grey", hex: "#353839" }, var2: { name: "Combo Gậy Tàng Hình 1.2m", sku: "INSTA-X4-STICK", price: 14290000, col: "Dark Grey Set", hex: "#222223" } },
    { name: "Nikon Z f", price: 51990000, old_price: 54900000, spec: "Cảm biến: Full-frame 24.5 MP\nBộ xử lý: EXPEED 7 (Thừa hưởng từ Z9)\nThiết kế: Vỏ đồng thau phủ sơn đen\nLấy nét: AI nhận diện 9 đối tượng", desc: "Hào quang của chiếc máy film Nikon FM2 huyền thoại tái sinh trên thân máy số Full-frame hiện đại.", var1: { name: "Màu Black Cổ Điển", sku: "NIKON-ZF-BLK", price: 51990000, col: "Classic Black", hex: "#1c1d1f" }, var2: { name: "Màu Sunset Orange (Limited)", sku: "NIKON-ZF-ORG", price: 53990000, col: "Sunset Orange", hex: "#db5a3d" } },
    { name: "Fujifilm Instax Mini 12", price: 2190000, old_price: 2490000, spec: "Loại phim: Instax Mini Film\nỐng kính: 60mm\nĐèn Flash: Tự động tính toán độ sáng\nGương chụp selfie: Có tích hợp", desc: "Máy chụp ảnh lấy ngay tức thì dễ thương, thích hợp lưu giữ những khoảnh khắc kỷ niệm bên bạn bè.", var1: { name: "Màu Pastel Blue (Xanh nhạt)", sku: "INSTAX-M12-BLU", price: 2190000, col: "Pastel Blue", hex: "#d0e4f2" }, var2: { name: "Màu Blossom Pink (Hồng hoa)", sku: "INSTAX-M12-PNK", price: 2190000, col: "Blossom Pink", hex: "#f5d3d7" } },
    { name: "Canon EOS R6 Mark II", price: 61990000, old_price: 66900000, spec: "Cảm biến: Full-frame CMOS 24.2 MP\nChụp liên tiếp: 40 fps bằng màn trập điện tử\nLấy nét: Dual Pixel CMOS AF II\nChống rung: Lên đến 8.0 stops", desc: "Cỗ máy chụp ảnh thể thao và phóng sự chuyên nghiệp với tốc độ bắt khoảnh khắc nhanh khủng khiếp.", var1: { name: "Body Only Đen Chuyên Nghiệp", sku: "CANON-R6M2-BODY", price: 61990000, col: "Black", hex: "#181819" }, var2: { name: "Body Kèm Lens 24-105mm F4L", sku: "CANON-R6M2-LENS", price: 89990000, col: "Black L-Series", hex: "#0c0c0d" } }
  ],
  // Category 12: Thiết bị lưu trữ (Storage)
  12: [
    { name: "Samsung T7 Shield 1TB", price: 2590000, old_price: 2990000, spec: "Tốc độ đọc: Lên đến 1050 MB/s\nTốc độ ghi: Lên đến 1000 MB/s\nChuẩn kháng bụi nước: IP65\nChống va đập: Rơi từ độ cao 3 mét", desc: "Ổ cứng di động siêu bền bỉ với vỏ bọc cao su chống va đập, bảo vệ dữ liệu tối đa khi đi dã ngoại.", var1: { name: "Màu Blue 1TB", sku: "SS-T7S-1TB-BLU", price: 2590000, col: "Blue", hex: "#1f4a7c" }, var2: { name: "Màu Black 1TB", sku: "SS-T7S-1TB-BLK", price: 2590000, col: "Black", hex: "#232323" } },
    { name: "Samsung T9 Portable SSD 2TB", price: 4990000, old_price: 5490000, spec: "Giao tiếp: USB 3.2 Gen 2x2\nTốc độ đọc/ghi: Lên đến 2000 MB/s\nTản nhiệt: Dynamic Thermal Guard\nBảo hành: 5 năm", desc: "Ổ cứng SSD di động siêu tốc độ gấp đôi thế hệ trước, lý tưởng để biên tập video 8K trực tiếp trên ổ.", var1: { name: "Màu Black 2TB", sku: "SS-T9-2TB-BLK", price: 4990000, col: "Black", hex: "#1b1b1c" }, var2: { name: "Màu Black 1TB", sku: "SS-T9-1TB-BLK", price: 2890000, col: "Black 1TB", hex: "#2b2b2c" } },
    { name: "SanDisk Extreme Portable SSD E61 1TB", price: 2390000, old_price: 2790000, spec: "Tốc độ đọc: 1050 MB/s\nTốc độ ghi: 1000 MB/s\nKháng nước: IP55\nMóc treo carabiner: Có", desc: "Mẫu ổ cứng di động gọn nhẹ của SanDisk có lỗ treo móc khóa tiện lợi, được các nhiếp ảnh gia ưa chuộng.", var1: { name: "Màu Đen Viền Cam 1TB", sku: "SANDISK-E61-1TB", price: 2390000, col: "Black Orange", hex: "#2c2d30" }, var2: { name: "Màu Đen Viền Cam 2TB", sku: "SANDISK-E61-2TB", price: 4290000, col: "Black Orange 2TB", hex: "#1b1b1c" } },
    { name: "Thẻ nhớ MicroSD SanDisk Ultra 128GB", price: 290000, old_price: 390000, spec: "Chuẩn tốc độ: Class 10, UHS-I, A1\nTốc độ đọc: Tối đa 140 MB/s\nKèm Adapter SD: Có\nỨng dụng: Camera an ninh, điện thoại", desc: "Thẻ nhớ microSD dung lượng cao hỗ trợ ghi hình FullHD liên tục cho camera giám sát hành trình.", var1: { name: "Dung lượng 128GB", sku: "SD-ULTRA-128G", price: 290000, col: "Grey Red", hex: "#b4b8b8" }, var2: { name: "Dung lượng 256GB", sku: "SD-ULTRA-256G", price: 550000, col: "Grey Red 256G", hex: "#949898" } },
    { name: "USB Kingston DataTraveler Exodia 64GB", price: 120000, old_price: 180000, spec: "Cổng kết nối: USB 3.2 Gen 1\nThiết kế: Nắp bảo vệ tiện lợi\nMóc chìa khóa: Vòng treo lớn nhiều màu", desc: "USB lưu trữ văn phòng nhỏ gọn, truyền tải dữ liệu tài liệu văn bản nhanh chóng, bền bỉ.", var1: { name: "Vòng Đen đuôi Trắng 64GB", sku: "KING-EXODIA-64G", price: 120000, col: "White-Black", hex: "#f0f0f0" }, var2: { name: "Vòng Đen đuôi Vàng 128GB", sku: "KING-EXODIA-128G", price: 220000, col: "Yellow-Black", hex: "#e0c243" } },
    { name: "SSD Kingston NV2 1TB PCIe 4.0 NVMe", price: 1690000, old_price: 1890000, spec: "Chuẩn lắp đặt: M.2 2280\nTốc độ đọc: Lên đến 3500 MB/s\nTốc độ ghi: Lên đến 2100 MB/s\nGiao diện: NVMe PCIe Gen 4x4", desc: "SSD gắn trong nâng cấp dung lượng và tốc độ khởi động vượt trội cho máy tính bàn và laptop.", var1: { name: "Dung Lượng 1TB", sku: "KING-NV2-1TB", price: 1690000, col: "Standard", hex: "#444444" }, var2: { name: "Dung Lượng 2TB", sku: "KING-NV2-2TB", price: 2990000, col: "Standard 2TB", hex: "#222222" } },
    { name: "WD My Passport 2TB (Ổ cứng di động)", price: 2190000, old_price: 2490000, spec: "Loại ổ: HDD 2.5 inch di động\nKết nối: USB 3.0 (Tương thích USB 2.0)\nMã hóa bảo mật: 256-bit AES phần cứng\nPhần mềm sao lưu: WD Backup", desc: "Ổ cứng cơ di động dung lượng lớn hỗ trợ mã hóa bảo mật thông tin và sao lưu tự động cho văn phòng.", var1: { name: "Màu Đen Lịch Lãm", sku: "WD-PASSPORT-2TB-BLK", price: 2190000, col: "Black", hex: "#111111" }, var2: { name: "Màu Xanh Dương Cát", sku: "WD-PASSPORT-2TB-BLU", price: 2190000, col: "Blue", hex: "#2a75d3" } },
    { name: "SSD Samsung 990 Pro 1TB PCIe 4.0", price: 2990000, old_price: 3490000, spec: "Chuẩn: M.2 2280 NVMe\nTốc độ đọc: Lên đến 7450 MB/s\nTốc độ ghi: Lên đến 6900 MB/s\nTối ưu hóa: Trò chơi PS5 và đồ họa 3D", desc: "Vua tốc độ ổ cứng SSD trong phân khúc PCIe 4.0, mang lại hiệu năng tải game và đồ họa 3D mượt mà không độ trễ.", var1: { name: "Bản Không Khe Tản Nhiệt 1TB", sku: "SS-990P-1TB", price: 2990000, col: "Standard", hex: "#353535" }, var2: { name: "Bản Có Khe Tản Nhiệt (Heatsink)", sku: "SS-990P-1TB-HS", price: 3490000, col: "Heatsink", hex: "#1a1a1a" } },
    { name: "Thẻ nhớ SD SanDisk Extreme Pro 64GB", price: 450000, old_price: 550000, spec: "Tốc độ đọc: 200 MB/s\nTốc độ ghi: 90 MB/s\nChuẩn tốc độ: C10, U3, V30 (Quay 4K)\nỨng dụng: Máy ảnh chuyên nghiệp", desc: "Thẻ nhớ định dạng SD chuyên dụng cho máy quay máy ảnh cơ chụp liên tục độ phân giải cao và quay video 4K UHD.", var1: { name: "Tốc độ 200MB/s 64GB", sku: "SD-EXT-PRO-64G", price: 450000, col: "Black Gold", hex: "#dfa32b" }, var2: { name: "Tốc độ 200MB/s 128GB", sku: "SD-EXT-PRO-128G", price: 790000, col: "Black Gold 128G", hex: "#bf851a" } },
    { name: "Crucial X9 Pro 2TB Portable SSD", price: 4190000, old_price: 4590000, spec: "Tốc độ đọc/ghi: Lên đến 1050 MB/s\nKích thước: Siêu tí hon (50x65mm)\nChất liệu: Vỏ nhôm đúc nguyên khối\nKháng bụi nước: IP55", desc: "Ổ cứng SSD di động siêu nhỏ bằng lòng bàn tay, thiết kế vỏ nhôm bền bỉ cao cấp chống rung lắc.", var1: { name: "Dung lượng 2TB Xám", sku: "CRUCIAL-X9P-2TB", price: 4190000, col: "Anodized Grey", hex: "#7a7e85" }, var2: { name: "Dung lượng 1TB Xám", sku: "CRUCIAL-X9P-1TB", price: 2490000, col: "Anodized Grey 1TB", hex: "#8e929a" } }
  ]
};

async function seed() {
  console.log("=== Bắt đầu sao chép ảnh sản phẩm chủ đạo ===");
  for (const item of flagshipImages) {
    const srcPath = join(sourceDir, item.src);
    const destPath = join(destDir, item.dest);

    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`📸 Đã copy ảnh: ${item.src} -> ${item.dest}`);
    } else {
      console.error(`❌ Không tìm thấy ảnh gốc tại: ${srcPath}`);
    }
  }

  console.log("\n=== Bắt đầu thêm 70 sản phẩm vào Database ===");
  
  let successCount = 0;

  for (const [catIdStr, products] of Object.entries(categoryProducts)) {
    const category_id = BigInt(catIdStr);
    
    // Find destination image name for this category
    let imageDestName = "default.png";
    if (catIdStr === "6") imageDestName = "ipad-pro-m4.png";
    else if (catIdStr === "7") imageDestName = "lg-ultragear-oled.png";
    else if (catIdStr === "8") imageDestName = "keyboard-mouse-combo.png";
    else if (catIdStr === "9") imageDestName = "marshall-acton-3.png";
    else if (catIdStr === "10") imageDestName = "google-nest-hub.png";
    else if (catIdStr === "11") imageDestName = "sony-alpha-7-4.png";
    else if (catIdStr === "12") imageDestName = "samsung-t9-ssd.png";

    const imageUrl = `/uploads/products/${imageDestName}`;

    console.log(`\n📂 Đang thêm sản phẩm cho Danh Mục ID: ${catIdStr}...`);

    for (const item of products) {
      try {
        // Create slug from name
        const slug = item.name.toLowerCase()
          .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a")
          .replace(/[éèẻẽẹêếềểễệ]/g, "e")
          .replace(/[íìỉĩị]/g, "i")
          .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o")
          .replace(/[úùủũụưứừửữự]/g, "u")
          .replace(/[ýỳỷỹỵ]/g, "y")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        // Check if exists, delete to update
        const existing = await prisma.products.findUnique({
          where: { slug }
        });

        if (existing) {
          await prisma.products.delete({
            where: { id: existing.id }
          });
        }

        // Insert
        await prisma.products.create({
          data: {
            category_id,
            name: item.name,
            slug,
            sku: item.var1.sku,
            short_description: item.desc,
            description: item.desc + "\n\n" + item.spec,
            specifications: item.spec,
            color: item.var1.col,
            color_hex: item.var1.hex,
            price: item.price,
            old_price: item.old_price,
            stock_quantity: 50,
            is_featured: false,
            is_flash_sale: false,
            status: "active",
            product_images: {
              create: [
                {
                  image_url: imageUrl,
                  alt_text: item.name,
                  sort_order: 1,
                  is_primary: true
                }
              ]
            },
            product_variants: {
              create: [
                {
                  name: `${item.name} ${item.var1.name}`,
                  sku: item.var1.sku,
                  price: item.var1.price,
                  old_price: item.old_price,
                  stock_quantity: 25,
                  color: item.var1.col,
                  color_hex: item.var1.hex,
                  image_url: imageUrl,
                  sort_order: 1,
                  is_default: true
                },
                {
                  name: `${item.name} ${item.var2.name}`,
                  sku: item.var2.sku,
                  price: item.var2.price,
                  old_price: item.old_price ? item.old_price + 1000000 : null,
                  stock_quantity: 25,
                  color: item.var2.col,
                  color_hex: item.var2.hex,
                  image_url: imageUrl,
                  sort_order: 2,
                  is_default: false
                }
              ]
            }
          }
        });

        successCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi thêm sản phẩm "${item.name}":`, error);
      }
    }
  }

  console.log(`\n=== Seeding hoàn tất! Đã thêm thành công ${successCount}/70 sản phẩm vào Database ===`);
}

seed()
  .catch(e => {
    console.error("❌ Lỗi nghiêm trọng:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
