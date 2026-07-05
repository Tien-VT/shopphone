import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING FLASH SALES & VOUCHERS ---");

  // 1. Create/Update active Flash Sale Campaign
  const now = new Date();
  const start_at = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Started 2 hours ago
  const end_at = new Date(now.getTime() + 10 * 60 * 60 * 1000);   // Ends in 10 hours
  
  console.log("Checking for existing flash sale campaigns...");
  const existingSale = await prisma.flash_sales.findFirst({
    where: { id: 1n }
  });

  if (existingSale) {
    const updatedSale = await prisma.flash_sales.update({
      where: { id: 1n },
      data: {
        title: "Flash Sale Siêu Khuyến Mãi",
        slug: "flash-sale-sieu-khuyen-mai",
        description: "Cơ hội sở hữu siêu phẩm công nghệ với giá cực hời chỉ trong hôm nay.",
        start_at: start_at,
        end_at: end_at,
        status: "active"
      }
    });
    console.log("Updated flash sale ID 1:", updatedSale);
  } else {
    const newSale = await prisma.flash_sales.create({
      data: {
        id: 1n,
        title: "Flash Sale Siêu Khuyến Mãi",
        slug: "flash-sale-sieu-khuyen-mai",
        description: "Cơ hội sở hữu siêu phẩm công nghệ với giá cực hời chỉ trong hôm nay.",
        start_at: start_at,
        end_at: end_at,
        status: "active"
      }
    });
    console.log("Created active flash sale ID 1:", newSale);
  }

  // 2. Select 5 products and set them as flash sale items
  console.log("Selecting products to mark as flash sale...");
  const products = await prisma.products.findMany({
    take: 8,
    orderBy: { id: "asc" }
  });

  if (products.length === 0) {
    console.log("Warning: No products found in the database to mark as flash sale.");
  } else {
    // Reset all products flash sale status first
    await prisma.products.updateMany({
      data: {
        is_flash_sale: false,
        flash_sale_discount_percent: null
      }
    });

    const discounts = [10, 15, 20, 25, 30, 15, 20, 25];
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      await prisma.products.update({
        where: { id: p.id },
        data: {
          is_flash_sale: true,
          flash_sale_discount_percent: discounts[i % discounts.length]
        }
      });
      console.log(`Marked product ID ${p.id} (${p.name}) as Flash Sale with discount ${discounts[i % discounts.length]}%`);
    }
  }

  // 3. Populate Vouchers
  console.log("Populating discount vouchers...");
  // Clear existing vouchers to have a clean set
  await prisma.vouchers.deleteMany({});

  const voucherData = [
    {
      code: "FREESHIP50",
      name: "Miễn Phí Vận Chuyển Toàn Quốc",
      description: "Miễn phí 100% phí vận chuyển cho đơn hàng từ 499.000đ",
      discount_type: "percent",
      discount_value: 100.00,
      minimum_order_value: 499000.00,
      status: "active",
      end_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    {
      code: "FREESHIP15",
      name: "Miễn Phí Vận Chuyển Nội Thành",
      description: "Miễn phí 100% phí vận chuyển cho đơn hàng từ 150.000đ",
      discount_type: "percent",
      discount_value: 100.00,
      minimum_order_value: 150000.00,
      status: "active",
      end_at: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days
    },
    {
      code: "SHOPNOW50K",
      name: "Khách Hàng Mới Ưu Đãi",
      description: "Giảm ngay 50.000đ trực tiếp vào hóa đơn từ 250.000đ",
      discount_type: "fixed",
      discount_value: 50000.00,
      minimum_order_value: 250000.00,
      status: "active",
      end_at: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000) // 45 days
    },
    {
      code: "SHOPNOW15",
      name: "Mừng Khai Trương Siêu Cực Đỉnh",
      description: "Giảm 15% tổng hóa đơn thanh toán từ 1.500.000đ trở lên",
      discount_type: "percent",
      discount_value: 15.00,
      minimum_order_value: 1500000.00,
      status: "active",
      end_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    {
      code: "VIPGOLD200",
      name: "Thành Viên Vàng Tri Ân",
      description: "Giảm 200.000đ cho khách hàng VIP hạng Vàng (áp dụng cho đơn từ 3.000.000đ)",
      discount_type: "fixed",
      discount_value: 200000.00,
      minimum_order_value: 3000000.00,
      status: "active",
      end_at: null // Permanent
    },
    {
      code: "VIPDIAMOND10",
      name: "Thành Viên Kim Cương Đặc Quyền",
      description: "Giảm 10% tối đa 500.000đ cho khách hàng hạng Kim Cương (áp dụng đơn từ 5.000.000đ)",
      discount_type: "percent",
      discount_value: 10.00,
      minimum_order_value: 5000000.00,
      status: "active",
      end_at: null // Permanent
    },
    {
      code: "MEMBERNEW50",
      name: "Thành Viên Đăng Ký Mới",
      description: "Giảm 50.000đ cho khách hàng kích hoạt tài khoản thành viên thành công (áp dụng đơn từ 300.000đ)",
      discount_type: "fixed",
      discount_value: 50000.00,
      minimum_order_value: 300000.00,
      status: "active",
      end_at: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days
    }
  ];

  for (const voucher of voucherData) {
    const created = await prisma.vouchers.create({
      data: voucher
    });
    console.log(`Created voucher: ${created.code} (${created.name})`);
  }

  // 4. Populate News Articles
  console.log("Populating news articles...");
  // Clear existing news articles to prevent duplicates
  await prisma.news_articles.deleteMany({});

  const newsData = [
    {
      title: "iPhone 18 Pro Max rò rỉ: Màn hình không viền, camera ẩn dưới màn hình",
      slug: "iphone-18-pro-max-ro-ri-man-hinh-khong-vien-camera-an",
      excerpt: "Nguồn tin uy tín cho biết Apple đang thử nghiệm tấm nền thế hệ mới loại bỏ hoàn toàn phần khuyết Dynamic Island trên các dòng iPhone cao cấp tiếp theo.",
      content: "Theo báo cáo mới nhất từ các nhà cung cấp chuỗi cung ứng tại châu Á, Apple đang đạt được những bước tiến vượt trội trong công nghệ camera ẩn dưới màn hình (UDC). Dự kiến dòng flagship iPhone 18 Pro Max ra mắt vào năm tới sẽ là thiết bị đầu tiên của hãng sở hữu thiết kế toàn màn hình đúng nghĩa. \n\nCông nghệ mới này giải quyết triệt để vấn đề suy giảm chất lượng ảnh chụp mặt trước bằng cách tối ưu hóa mật độ điểm ảnh tại vùng camera và sử dụng thuật toán AI xử lý hình ảnh độc quyền. Ngoài màn hình không viền cực kỳ ấn tượng, thiết bị được dự đoán sẽ sử dụng vi xử lý Apple A19 Pro sản xuất trên tiến trình 2nm siêu tiết kiệm năng lượng, hứa hẹn mang lại hiệu năng đỉnh cao vượt trội.",
      thumbnail_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80",
      status: "published",
      published_at: new Date()
    },
    {
      title: "So sánh Galaxy S26 Ultra và iPhone 17 Pro Max: Kỳ phùng địch thủ",
      slug: "so-sanh-galaxy-s26-ultra-va-iphone-17-pro-max",
      excerpt: "Hai gã khổng lồ Samsung và Apple tiếp tục cuộc đối đầu khốc liệt ở phân khúc flagship. Đâu là lựa chọn hoàn hảo nhất cho người dùng yêu công nghệ?",
      content: "Trận chiến giữa hai hệ sinh thái Android và iOS chưa bao giờ hạ nhiệt. Galaxy S26 Ultra nổi bật với thiết kế vuông vức mạnh mẽ, bút S Pen đa năng tích hợp sâu các tính năng AI mới cùng cụm camera zoom quang học 10x độc quyền. \n\nTrong khi đó, iPhone 17 Pro Max thu hút người dùng nhờ khung sườn Titanium siêu bền nhẹ, hệ điều hành iOS tối ưu mượt mà và khả năng quay video cinematic hàng đầu thế giới. Bài viết phân tích chi tiết hiệu năng chip xử lý Snapdragon 8 Gen 5 đối đầu với Apple A18 Pro giúp người dùng đưa ra quyết định mua sắm sáng suốt nhất.",
      thumbnail_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
      status: "published",
      published_at: new Date()
    },
    {
      title: "Đánh giá MacBook Air M4: Laptop văn phòng mỏng nhẹ đỉnh nhất 2026",
      slug: "danh-gia-macbook-air-m4-laptop-van-phong-mong-nhe-dinh-nhat",
      excerpt: "Với vi xử lý Apple M4 thế hệ mới, MacBook Air không chỉ nhanh hơn mà còn sở hữu thời lượng pin cực khủng lên tới 24 tiếng sử dụng liên tục.",
      content: "MacBook Air M4 giữ nguyên thiết kế mỏng nhẹ sang trọng đã làm nên thương hiệu nhưng mang trong mình sức mạnh phần cứng vượt trội. Vi xử lý Apple M4 mang lại tốc độ xử lý nhanh hơn 25% so với thế hệ M3, đặc biệt là khả năng xử lý các tác vụ trí tuệ nhân tạo (Apple Intelligence) cực kỳ mượt mà. \n\nMàn hình Liquid Retina hiển thị sắc nét, hệ thống loa âm thanh vòm sống động kết hợp với bàn phím Magic Keyboard êm ái tạo nên trải nghiệm làm việc vô cùng hoàn hảo. Đây chắc chắn là chiếc laptop tối ưu nhất cho học sinh, sinh viên và nhân viên văn phòng trong năm nay.",
      thumbnail_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      status: "published",
      published_at: new Date()
    },
    {
      title: "Mẹo tối ưu thời lượng pin cực hiệu quả cho điện thoại Android",
      slug: "meo-toi-uu-thoi-luong-pin-cuc-hieu-qua-cho-dien-thoai-android",
      excerpt: "Chỉ với vài tùy chỉnh cài đặt đơn giản trong máy, bạn có thể kéo dài thời gian sử dụng pin chiếc smartphone Android của mình thêm 30%.",
      content: "Hao pin nhanh luôn là vấn đề muôn thuở của người dùng điện thoại thông minh. Để kéo dài tuổi thọ pin trên hệ điều hành Android, bạn nên tắt các kết nối không cần thiết như Bluetooth, GPS và NFC khi không sử dụng. \n\nNgoài ra, kích hoạt chế độ Dark Mode (giao diện tối) giúp tiết kiệm đáng kể điện năng đối với thiết bị sở hữu màn hình OLED/AMOLED. Hãy kiểm tra các ứng dụng chạy ngầm tiêu tốn năng lượng trong phần Cài đặt và đưa chúng về chế độ hạn chế để ngăn chặn việc tiêu thụ pin ngoài ý muốn.",
      thumbnail_url: "https://images.unsplash.com/photo-1565849563525-ad7cd044cf8f?auto=format&fit=crop&w=600&q=80",
      status: "published",
      published_at: new Date()
    },
    {
      title: "5 Sai lầm phổ biến khi sạc pin điện thoại làm chai pin nhanh chóng",
      slug: "5-sai-lam-pho-bien-khi-sac-pin-dien-thoai-lam-chai-pin",
      excerpt: "Vừa dùng vừa sạc, sạc qua đêm hay dùng củ sạc kém chất lượng là những nguyên nhân hàng đầu khiến pin điện thoại của bạn nhanh bị hỏng.",
      content: "Nhiều thói quen sạc pin sai cách hằng ngày vô tình làm giảm tuổi thọ của viên pin smartphone một cách nghiêm trọng. Đầu tiên là thói quen vừa sạc vừa chơi game hoặc xem phim, việc này làm nhiệt độ máy tăng cao dẫn đến chai pin nhanh chóng và tăng nguy cơ cháy nổ. \n\nTiếp theo, việc sử dụng các bộ sạc giá rẻ không rõ nguồn gốc xuất xứ có điện áp không ổn định cũng tàn phá các cell pin bên trong rất nhanh. Người dùng nên hạn chế việc sạc pin đầy 100% qua đêm liên tục mà hãy rút sạc khi pin đạt tầm 80-90% để tối ưu chu kỳ sạc của pin Lithium-ion.",
      thumbnail_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
      status: "published",
      published_at: new Date()
    },
    {
      title: "Công nghệ AI trên smartphone 2026: Trợ lý đắc lực hay chỉ là chiêu trò quảng cáo?",
      slug: "cong-nghe-ai-tren-smartphone-2026-tro-ly-dac-luc-hay-chieu-tro",
      excerpt: "Cùng phân tích thực tế các tính năng AI đang được tích hợp trên các dòng smartphone cao cấp hiện nay xem chúng giúp ích gì cho đời sống.",
      content: "Năm 2026 chứng kiến làn sóng bùng nổ của Trí tuệ nhân tạo (AI) được các nhà sản xuất tích hợp sâu vào hệ điều hành của smartphone. Từ việc dịch thuật ngôn ngữ trực tiếp hai chiều trong cuộc gọi, tự động chỉnh sửa ảnh xóa vật thể chuyên nghiệp đến tóm tắt văn bản và email thông minh. \n\nNghiên cứu cho thấy các tính năng này không còn là chiêu trò marketing nữa mà đã thực sự thay đổi cách chúng ta tương tác với điện thoại hàng ngày. Các mô hình ngôn ngữ lớn (LLM) chạy trực tiếp trên thiết bị (On-Device AI) mang lại phản hồi siêu tốc và bảo mật thông tin tối đa cho người dùng.",
      thumbnail_url: "https://images.unsplash.com/photo-1675557009875-436f09780264?auto=format&fit=crop&w=600&q=80",
      status: "published",
      published_at: new Date()
    }
  ];

  for (const article of newsData) {
    const created = await prisma.news_articles.create({
      data: article
    });
    console.log(`Created news article: ${created.title}`);
  }

  console.log("--- SEEDING COMPLETED ---");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
