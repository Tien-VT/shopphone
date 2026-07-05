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

const productsToInsert = [
  {
    category_id: 1n, // Điện thoại
    name: "Google Pixel 9 Pro XL",
    slug: "google-pixel-9-pro-xl",
    sku: "GP9PXL-128-PORC",
    short_description: "Google Pixel 9 Pro XL - Đỉnh cao nhiếp ảnh AI từ Google.",
    description: "Google Pixel 9 Pro XL mang đến trải nghiệm Android thuần khiết vượt trội nhất từ trước đến nay. Được trang bị chip xử lý Tensor G4 tối ưu riêng cho các tác vụ trí tuệ nhân tạo Gemini Nano, hệ thống camera ba ống kính chuyên nghiệp với zoom quang học 5x và zoom độ phân giải cao lên đến 30x. Thiết kế sang trọng hoàn toàn mới với khung viền kim loại nhám và mặt lưng kính mịn màng.",
    specifications: "Màn hình: 6.8 inches Super Actua Display, 120Hz\nCPU: Google Tensor G4 với đồng xử lý bảo mật Titan M2\nRAM: 16 GB\nBộ nhớ trong: 128 GB / 256 GB\nCamera sau: Chính 50 MP, Góc siêu rộng 48 MP, Tele 48 MP (5x zoom quang)\nCamera trước: 42 MP\nPin: 5060 mAh, Hỗ trợ sạc nhanh 45W\nHệ điều hành: Android 15 nguyên bản",
    color: "Porcelain (Trắng Gốm)",
    color_hex: "#f4f1ea",
    price: 26990000,
    old_price: 29990000,
    stock_quantity: 33,
    is_featured: true,
    is_flash_sale: false,
    image_src: "pixel_9_pro_1783151796824.png",
    image_dest_name: "google-pixel-9-pro-xl.png",
    variants: [
      {
        name: "Google Pixel 9 Pro XL 128GB Porcelain (Trắng Gốm)",
        sku: "GP9PXL-128-PORC",
        price: 26990000,
        old_price: 29990000,
        stock_quantity: 15,
        color: "Porcelain",
        color_hex: "#f4f1ea",
        is_default: true,
        sort_order: 1
      },
      {
        name: "Google Pixel 9 Pro XL 256GB Obsidian (Đen Đá)",
        sku: "GP9PXL-256-OBS",
        price: 29990000,
        old_price: 32990000,
        stock_quantity: 10,
        color: "Obsidian",
        color_hex: "#2c2c2c",
        is_default: false,
        sort_order: 2
      },
      {
        name: "Google Pixel 9 Pro XL 256GB Hazel (Xanh Xám)",
        sku: "GP9PXL-256-HZL",
        price: 29990000,
        old_price: 32990000,
        stock_quantity: 8,
        color: "Hazel",
        color_hex: "#8f9489",
        is_default: false,
        sort_order: 3
      }
    ]
  },
  {
    category_id: 1n, // Điện thoại
    name: "Samsung Galaxy Z Fold6",
    slug: "samsung-galaxy-z-fold6",
    sku: "SZF6-256-SIL",
    short_description: "Samsung Galaxy Z Fold6 - Mở rộng tiềm năng công việc và giải trí.",
    description: "Samsung Galaxy Z Fold6 tái định nghĩa trải nghiệm di động màn hình gập lớn. Với thiết kế mỏng nhẹ hơn đáng kể, độ bền bản lề cải tiến vượt trội và khả năng kháng bụi nước xuất sắc. Tận dụng tối đa hiệu năng của Snapdragon 8 Gen 3 for Galaxy cùng các tính năng Galaxy AI tiên tiến như dịch thuật trực tiếp trên 2 màn hình, khoanh tròn tìm kiếm thông minh và trợ lý ghi chú quyền năng.",
    specifications: "Màn hình chính: 7.6 inches Dynamic AMOLED 2X, QXGA+, 120Hz\nMàn hình phụ: 6.3 inches Dynamic AMOLED 2X, HD+, 120Hz\nCPU: Snapdragon 8 Gen 3 for Galaxy (4nm)\nRAM: 12 GB\nBộ nhớ trong: 256 GB / 512 GB\nCamera sau: Chính 50 MP, Góc rộng 12 MP, Tele 10 MP (3x zoom quang)\nCamera trước: 10 MP (màn hình phụ) & 4 MP (ẩn dưới màn hình chính)\nPin: 4400 mAh, sạc nhanh 25W",
    color: "Silver Shadow (Bạc)",
    color_hex: "#b5b8ba",
    price: 41990000,
    old_price: 43990000,
    stock_quantity: 8,
    is_featured: true,
    is_flash_sale: false,
    image_src: "galaxy_z_fold6_1783151808410.png",
    image_dest_name: "samsung-galaxy-z-fold6.png",
    variants: [
      {
        name: "Samsung Galaxy Z Fold6 256GB Silver Shadow",
        sku: "SZF6-256-SIL",
        price: 41990000,
        old_price: 43990000,
        stock_quantity: 5,
        color: "Silver Shadow",
        color_hex: "#b5b8ba",
        is_default: true,
        sort_order: 1
      },
      {
        name: "Samsung Galaxy Z Fold6 512GB Navy",
        sku: "SZF6-512-NVY",
        price: 45990000,
        old_price: 47990000,
        stock_quantity: 3,
        color: "Navy",
        color_hex: "#2b3d52",
        is_default: false,
        sort_order: 2
      }
    ]
  },
  {
    category_id: 1n, // Điện thoại
    name: "iPhone 16 Pro",
    slug: "iphone-16-pro",
    sku: "IP16P-128-DST",
    short_description: "iPhone 16 Pro - Thiết kế titan cao cấp cùng nút Camera Control tiện dụng.",
    description: "iPhone 16 Pro nâng chuẩn mực Flagship với chất liệu Titan cấp hàng không bền bỉ và trọng lượng siêu nhẹ. Nút Camera Control thế hệ mới hỗ trợ thao tác nhanh để chụp ảnh, zoom và quay phim điện ảnh tức thì. Chip A18 Pro xây dựng trên tiến trình 3nm thế hệ thứ hai mang lại hiệu năng đồ họa cực đại kèm tính năng Apple Intelligence thông minh vượt trội.",
    specifications: "Màn hình: 6.3 inches Super Retina XDR OLED, ProMotion 120Hz\nCPU: Apple A18 Pro 6 nhân\nRAM: 8 GB\nBộ nhớ trong: 128 GB / 256 GB\nCamera sau: Chính 48 MP, Góc siêu rộng 48 MP, Tele 12 MP (5x zoom quang)\nCamera trước: 12 MP TrueDepth\nPin: Hỗ trợ sạc nhanh MagSafe lên đến 25W\nHệ điều hành: iOS 18",
    color: "Desert Titanium (Titan Sa Mạc)",
    color_hex: "#c5b4a2",
    price: 28990000,
    old_price: 30990000,
    stock_quantity: 45,
    is_featured: true,
    is_flash_sale: true,
    image_src: "iphone_16_pro_1783151817395.png",
    image_dest_name: "iphone-16-pro.png",
    variants: [
      {
        name: "iPhone 16 Pro 128GB Desert Titanium",
        sku: "IP16P-128-DST",
        price: 28990000,
        old_price: 30990000,
        stock_quantity: 20,
        color: "Desert Titanium",
        color_hex: "#c5b4a2",
        is_default: true,
        sort_order: 1
      },
      {
        name: "iPhone 16 Pro 256GB Natural Titanium",
        sku: "IP16P-256-NAT",
        price: 31990000,
        old_price: 33990000,
        stock_quantity: 15,
        color: "Natural Titanium",
        color_hex: "#a6a19a",
        is_default: false,
        sort_order: 2
      },
      {
        name: "iPhone 16 Pro 256GB White Titanium",
        sku: "IP16P-256-WHT",
        price: 31990000,
        old_price: 33990000,
        stock_quantity: 10,
        color: "White Titanium",
        color_hex: "#f2f1ed",
        is_default: false,
        sort_order: 3
      }
    ]
  },
  {
    category_id: 2n, // Laptop
    name: "Dell XPS 13 9340",
    slug: "dell-xps-13-9340",
    sku: "DELL-XPS9340-SLV",
    short_description: "Dell XPS 13 9340 - Chuẩn mực mới cho Ultrabook cao cấp.",
    description: "Dell XPS 13 9340 là tinh hoa của thiết kế tối giản hiện đại. Khung máy nhôm CNC nguyên khối tinh xảo kết hợp bàn phím tràn viền không khoảng cách độc đáo và hàng phím chức năng cảm ứng điện dung. Trực quan hóa mọi tác vụ giải trí và thiết kế với màn hình InfinityEdge siêu mỏng cùng sức mạnh tối tân từ chip Intel Core Ultra thế hệ mới tích hợp NPU xử lý AI.",
    specifications: "Màn hình: 13.4 inches FHD+ (1920 x 1200) Anti-Glare, 120Hz\nCPU: Intel Core Ultra 7 155H (16 nhân, 22 luồng, up to 4.8 GHz)\nRAM: 16 GB / 32 GB LPDDR5x\nỔ cứng: 512 GB / 1 TB SSD NVMe PCIe Gen 4\nĐồ họa: Intel Arc Graphics\nCổng kết nối: 2 x Thunderbolt 4 (USB Type-C)\nPin: 3-cell 55 Whr, Sạc Type-C 60W\nTrọng lượng: 1.19 kg",
    color: "Platinum (Bạc)",
    color_hex: "#e5e5e5",
    price: 38990000,
    old_price: 42990000,
    stock_quantity: 10,
    is_featured: true,
    is_flash_sale: false,
    image_src: "dell_xps_13_1783151827696.png",
    image_dest_name: "dell-xps-13-9340.png",
    variants: [
      {
        name: "Dell XPS 13 Intel Ultra 7 / 16GB RAM / 512GB SSD / Platinum",
        sku: "DELL-XPS9340-SLV",
        price: 38990000,
        old_price: 42990000,
        stock_quantity: 6,
        color: "Platinum",
        color_hex: "#e5e5e5",
        is_default: true,
        sort_order: 1
      },
      {
        name: "Dell XPS 13 Intel Ultra 7 / 32GB RAM / 1TB SSD / Graphite",
        sku: "DELL-XPS9340-GRPH",
        price: 44990000,
        old_price: 49990000,
        stock_quantity: 4,
        color: "Graphite",
        color_hex: "#3c3d3e",
        is_default: false,
        sort_order: 2
      }
    ]
  },
  {
    category_id: 2n, // Laptop
    name: "ASUS ROG Zephyrus G14 (2024)",
    slug: "asus-rog-zephyrus-g14-2024",
    sku: "ROG-G14-RTX4060",
    short_description: "ASUS ROG Zephyrus G14 (2024) - Laptop gaming mỏng nhẹ, màn hình OLED 3K tuyệt mỹ.",
    description: "ASUS ROG Zephyrus G14 (2024) kết hợp sức mạnh gaming vượt trội của dòng ROG với thiết kế thanh lịch siêu mỏng nhẹ. Thân máy chế tác bằng hợp kim nhôm cao cấp tích hợp dải đèn LED Slash Lighting phong cách cá tính ở mặt A. Trang bị màn hình ROG Nebula OLED 3K tần số quét 120Hz rực rỡ và phần cứng cực mạnh chiến mượt mọi tựa game AAA cấu hình cao.",
    specifications: "Màn hình: 14 inches OLED 3K (2880 x 1800), 120Hz, 100% DCI-P3\nCPU: AMD Ryzen 9 8945HS (8 nhân, 16 luồng, up to 5.2 GHz)\nRAM: 16 GB / 32 GB LPDDR5X (Onboard)\nỔ cứng: 1 TB SSD M.2 NVMe PCIe 4.0\nCard đồ họa: NVIDIA GeForce RTX 4060 / RTX 4070 Laptop GPU\nPin: 4-cell Li-ion 73 Whrs, sạc nhanh\nTrọng lượng: 1.50 kg",
    color: "Eclipse Gray (Xám)",
    color_hex: "#4f5255",
    price: 46990000,
    old_price: 49990000,
    stock_quantity: 12,
    is_featured: true,
    is_flash_sale: false,
    image_src: "rog_zephyrus_g14_1783151839235.png",
    image_dest_name: "asus-rog-zephyrus-g14-2024.png",
    variants: [
      {
        name: "ROG Zephyrus G14 Ryzen 9 / RTX 4060 / Eclipse Gray",
        sku: "ROG-G14-RTX4060",
        price: 46990000,
        old_price: 49990000,
        stock_quantity: 8,
        color: "Eclipse Gray",
        color_hex: "#4f5255",
        is_default: true,
        sort_order: 1
      },
      {
        name: "ROG Zephyrus G14 Ryzen 9 / RTX 4070 / Platinum White",
        sku: "ROG-G14-RTX4070",
        price: 54990000,
        old_price: 57990000,
        stock_quantity: 4,
        color: "Platinum White",
        color_hex: "#f0f2f5",
        is_default: false,
        sort_order: 2
      }
    ]
  },
  {
    category_id: 3n, // Tai nghe
    name: "Apple AirPods Pro 2",
    slug: "apple-airpods-pro-2",
    sku: "APP2-USBC",
    short_description: "Apple AirPods Pro 2 - Khả năng chống ồn chủ động đỉnh cao.",
    description: "Apple AirPods Pro 2 mang lại chất lượng âm thanh phong phú hơn với chip H2 thông minh. Hệ thống chống ồn chủ động (ANC) tốt hơn gấp 2 lần so với thế hệ trước, kết hợp tính năng âm thanh thích ứng thích hợp tự động chuyển đổi giữa chế độ chống ồn và chế độ xuyên âm dựa trên môi trường của bạn. Hộp sạc MagSafe hiện đại trang bị cổng kết nối USB-C phổ biến.",
    specifications: "Chip xử lý: Apple H2 (tai nghe), Apple U1 (hộp sạc)\nKết nối: Bluetooth 5.3\nChống nước: IP54 kháng mồ hôi và nước (cả tai nghe và hộp sạc)\nThời lượng pin: Lên đến 6 giờ nghe nhạc (khi bật ANC), lên đến 30 giờ với hộp sạc\nCông nghệ âm thanh: Âm thanh không gian cá nhân hóa, Chống ồn chủ động thích ứng",
    color: "White (Trắng)",
    color_hex: "#ffffff",
    price: 5790000,
    old_price: 6790000,
    stock_quantity: 70,
    is_featured: true,
    is_flash_sale: true,
    image_src: "airpods_pro_2_1783151848113.png",
    image_dest_name: "apple-airpods-pro-2.png",
    variants: [
      {
        name: "AirPods Pro 2 USB-C Hộp Sạc Trắng",
        sku: "APP2-USBC",
        price: 5790000,
        old_price: 6790000,
        stock_quantity: 50,
        color: "White",
        color_hex: "#ffffff",
        is_default: true,
        sort_order: 1
      },
      {
        name: "AirPods Pro 2 USB-C Kèm Bao Da Midnight Blue",
        sku: "APP2-USBC-MN",
        price: 5990000,
        old_price: 6990000,
        stock_quantity: 20,
        color: "Midnight Blue",
        color_hex: "#1c2e4a",
        is_default: false,
        sort_order: 2
      }
    ]
  },
  {
    category_id: 3n, // Tai nghe
    name: "Sony WF-1000XM5",
    slug: "sony-wf-1000xm5",
    sku: "SONY-WF5-BLK",
    short_description: "Sony WF-1000XM5 - Âm thanh độ phân giải cao vượt bậc.",
    description: "Sony WF-1000XM5 sở hữu công nghệ tiên tiến nhất để mang lại âm thanh hi-res trung thực tuyệt đối cùng tính năng chống ồn hàng đầu thị trường. Được trang bị bộ màng loa Dynamic Driver X thế hệ mới thiết kế đặc biệt, tích hợp bộ xử lý âm thanh thời gian thực chuyên sâu và micrô thu âm phản hồi kép giúp lọc sạch hoàn toàn tạp âm xung quanh.",
    specifications: "Kết nối: Bluetooth 5.3, hỗ trợ codec LDAC, AAC, SBC\nDriver: Dynamic Driver X 8.4mm\nChống nước: IPX4 chống nước bắn tóe nhẹ\nThời lượng pin: Tai nghe lên đến 8 giờ (bật ANC), Hộp sạc cung cấp thêm 16 giờ sử dụng\nTính năng đặc biệt: Chống ồn chủ động (ANC), Sạc nhanh 3 phút được 60 phút sử dụng",
    color: "Black (Đen)",
    color_hex: "#1a1a1a",
    price: 5990000,
    old_price: 6990000,
    stock_quantity: 40,
    is_featured: true,
    is_flash_sale: false,
    image_src: "sony_wf_1000xm5_1783151862288.png",
    image_dest_name: "sony-wf-1000xm5.png",
    variants: [
      {
        name: "Sony WF-1000XM5 Black (Đen)",
        sku: "SONY-WF5-BLK",
        price: 5990000,
        old_price: 6990000,
        stock_quantity: 25,
        color: "Black",
        color_hex: "#1a1a1a",
        is_default: true,
        sort_order: 1
      },
      {
        name: "Sony WF-1000XM5 Silver (Bạc)",
        sku: "SONY-WF5-SLV",
        price: 5990000,
        old_price: 6990000,
        stock_quantity: 15,
        color: "Silver",
        color_hex: "#cccccc",
        is_default: false,
        sort_order: 2
      }
    ]
  },
  {
    category_id: 4n, // Đồng hồ
    name: "Apple Watch Series 10",
    slug: "apple-watch-series-10",
    sku: "AW10-46-BLK",
    short_description: "Apple Watch Series 10 - Màn hình lớn nhất và thiết kế mỏng nhất từ trước đến nay.",
    description: "Apple Watch Series 10 mang đến bước đột phá lớn với thiết kế siêu mỏng nhẹ chỉ 9.7mm cùng không gian hiển thị rộng rãi hơn cả Apple Watch Ultra. Màn hình OLED góc nhìn rộng siêu sáng hiển thị tuyệt đẹp dưới ánh nắng trực tiếp. Đồng thời trang bị các cảm biến sức khỏe vượt trội bao gồm theo dõi giấc ngủ nâng cao và phát hiện chứng ngưng thở khi ngủ.",
    specifications: "Kích thước mặt: 42 mm / 46 mm\nMàn hình: LTPO3 OLED Retina, Always-On, Độ sáng tối đa 2000 nits\nChip: Apple S10 SiP với Neural Engine 4 nhân\nBộ nhớ trong: 64 GB\nThời lượng pin: Lên đến 18 giờ (bình thường), 36 giờ (chế độ nguồn điện thấp)\nKháng nước: 50m (phù hợp bơi lội)",
    color: "Jet Black (Đen Bóng)",
    color_hex: "#0a0a0a",
    price: 10990000,
    old_price: 11990000,
    stock_quantity: 30,
    is_featured: true,
    is_flash_sale: false,
    image_src: "apple_watch_10_1783151874908.png",
    image_dest_name: "apple-watch-series-10.png",
    variants: [
      {
        name: "Apple Watch S10 46mm Jet Black Aluminum Case",
        sku: "AW10-46-BLK",
        price: 10990000,
        old_price: 11990000,
        stock_quantity: 18,
        color: "Jet Black",
        color_hex: "#0a0a0a",
        is_default: true,
        sort_order: 1
      },
      {
        name: "Apple Watch S10 42mm Rose Gold Aluminum Case",
        sku: "AW10-42-RG",
        price: 9990000,
        old_price: 10990000,
        stock_quantity: 12,
        color: "Rose Gold",
        color_hex: "#e3b8b1",
        is_default: false,
        sort_order: 2
      }
    ]
  },
  {
    category_id: 4n, // Đồng hồ
    name: "Samsung Galaxy Watch Ultra",
    slug: "samsung-galaxy-watch-ultra",
    sku: "SGWU-47-GRY",
    short_description: "Samsung Galaxy Watch Ultra - Đồng hồ thông minh thể thao dã ngoại cực đỉnh.",
    description: "Samsung Galaxy Watch Ultra chế tác từ titanium cấp hàng không siêu bền bỉ cùng cấu trúc khung chống sốc tối ưu, sẵn sàng đương đầu với mọi hành trình thám hiểm khắc nghiệt. Được thiết kế chuyên biệt cho việc tập luyện ngoài trời cường độ cao với định vị GPS tần số kép siêu chính xác, kháng nước 10ATM và nút chức năng Quick Button kích hoạt nhanh còi báo động khẩn cấp.",
    specifications: "Kích thước mặt: 47 mm\nMàn hình: 1.5 inches Super AMOLED Always-On, Kính Sapphire, độ sáng 3000 nits\nChip: Exynos W1000 (3nm, 5 nhân)\nRAM & Bộ nhớ: 2 GB RAM + 32 GB bộ nhớ trong\nThời lượng pin: Lên đến 100 giờ ở chế độ Tiết kiệm pin tối đa\nĐộ bền: Tiêu chuẩn quân đội MIL-STD-810H, Kháng bụi nước IP68 & 10ATM",
    color: "Titanium Gray (Xám Titan)",
    color_hex: "#5c5e62",
    price: 15990000,
    old_price: 16990000,
    stock_quantity: 15,
    is_featured: true,
    is_flash_sale: false,
    image_src: "galaxy_watch_ultra_1783151886260.png",
    image_dest_name: "samsung-galaxy-watch-ultra.png",
    variants: [
      {
        name: "Galaxy Watch Ultra Titanium Gray / Orange Marine Band",
        sku: "SGWU-47-GRY",
        price: 15990000,
        old_price: 16990000,
        stock_quantity: 10,
        color: "Titanium Gray",
        color_hex: "#5c5e62",
        is_default: true,
        sort_order: 1
      },
      {
        name: "Galaxy Watch Ultra Titanium White / Peak White Band",
        sku: "SGWU-47-WHT",
        price: 15990000,
        old_price: 16990000,
        stock_quantity: 5,
        color: "Titanium White",
        color_hex: "#e8eaeb",
        is_default: false,
        sort_order: 2
      }
    ]
  },
  {
    category_id: 5n, // Phụ kiện
    name: "Anker Prime 20,000mAh Power Bank",
    slug: "anker-prime-20000mah",
    sku: "ANKER-PRIME-20K",
    short_description: "Anker Prime 20,000mAh - Trạm sạc di động siêu tốc 200W kèm màn hình thông minh.",
    description: "Anker Prime 20,000mAh kết hợp dung lượng sạc khổng lồ cùng khả năng phân bổ nguồn điện ra cực đại lên đến 200W qua hai cổng USB-C và một cổng USB-A. Màn hình hiển thị kỹ thuật số màu thông minh theo dõi thời gian thực công suất sạc đầu vào/đầu ra, dung lượng pin còn lại và số chu kỳ sạc pin. Thiết kế thon gọn sang trọng dễ dàng đồng hành cùng bạn trên mọi chuyến bay.",
    specifications: "Dung lượng pin: 20,000 mAh\nTổng công suất đầu ra: Tối đa 200W (Mỗi cổng USB-C lên đến 100W)\nCổng kết nối: 2 x USB-C, 1 x USB-A\nCông suất sạc đầu vào: Tối đa 100W qua USB-C hoặc đế sạc không dây Anker Prime\nCông nghệ bảo vệ: ActiveShield 2.0 kiểm soát nhiệt độ thông minh",
    color: "Black (Đen Cát)",
    color_hex: "#1e1e1e",
    price: 2490000,
    old_price: 2990000,
    stock_quantity: 45,
    is_featured: false,
    is_flash_sale: false,
    image_src: "anker_prime_powerbank_1783151897164.png",
    image_dest_name: "anker-prime-20000mah.png",
    variants: [
      {
        name: "Anker Prime 20,000mAh Black",
        sku: "ANKER-PRIME-20K",
        price: 2490000,
        old_price: 2990000,
        stock_quantity: 30,
        color: "Black",
        color_hex: "#1e1e1e",
        is_default: true,
        sort_order: 1
      },
      {
        name: "Anker Prime 20,000mAh Gold Edition",
        sku: "ANKER-PRIME-20K-GLD",
        price: 2690000,
        old_price: 3190000,
        stock_quantity: 15,
        color: "Gold",
        color_hex: "#dfba73",
        is_default: false,
        sort_order: 2
      }
    ]
  }
];

async function seed() {
  console.log("=== Bắt đầu sao chép ảnh sản phẩm ===");
  for (const item of productsToInsert) {
    const srcPath = join(sourceDir, item.image_src);
    const destPath = join(destDir, item.image_dest_name);

    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`📸 Đã copy ảnh: ${item.image_src} -> ${item.image_dest_name}`);
    } else {
      console.error(`❌ Không tìm thấy ảnh gốc tại: ${srcPath}`);
    }
  }

  console.log("\n=== Bắt đầu thêm dữ liệu vào Database ===");
  
  for (const item of productsToInsert) {
    try {
      // Xoá sản phẩm cũ có cùng slug nếu tồn tại để tránh lỗi trùng lặp dữ liệu
      const existingProduct = await prisma.products.findUnique({
        where: { slug: item.slug }
      });

      if (existingProduct) {
        console.log(`🗑️ Đã tìm thấy sản phẩm trùng slug: "${item.slug}". Đang xoá để cập nhật mới...`);
        await prisma.products.delete({
          where: { id: existingProduct.id }
        });
      }

      // Tạo sản phẩm mới kèm ảnh chính và biến thể
      const imageUrl = `/uploads/products/${item.image_dest_name}`;
      
      const newProduct = await prisma.products.create({
        data: {
          category_id: item.category_id,
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          short_description: item.short_description,
          description: item.description,
          specifications: item.specifications,
          color: item.color,
          color_hex: item.color_hex,
          price: item.price,
          old_price: item.old_price,
          stock_quantity: item.stock_quantity,
          is_featured: item.is_featured,
          is_flash_sale: item.is_flash_sale,
          status: "active",
          // Thêm ảnh vào bảng product_images
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
          // Thêm các biến thể vào bảng product_variants
          product_variants: {
            create: item.variants.map(v => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              old_price: v.old_price,
              stock_quantity: v.stock_quantity,
              color: v.color,
              color_hex: v.color_hex,
              image_url: imageUrl,
              sort_order: v.sort_order,
              is_default: v.is_default
            }))
          }
        }
      });

      console.log(`✅ Thêm thành công sản phẩm: "${newProduct.name}" (ID: ${newProduct.id})`);
    } catch (error) {
      console.error(`❌ Lỗi khi thêm sản phẩm "${item.name}":`, error);
    }
  }

  console.log("\n=== Hoàn tất Seeding! ===");
}

seed()
  .catch(e => {
    console.error("❌ Lỗi nghiêm trọng:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
