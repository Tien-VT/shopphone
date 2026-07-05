import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
const destDir = "d:\\website-ban-dthoai\\shopnow\\public\\uploads\\products";

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

// Custom Unsplash Image ID Mapping for all 70 products (curated, professional tech photography)
const imageMapping = {
  // Category 6: Máy tính bảng
  "apple-ipad-pro-m4-13-inch": "photo-1544244015-0df4b3ffc6b0",
  "apple-ipad-air-m2-11-inch": "photo-1589739900243-4b52cd9b104e",
  "samsung-galaxy-tab-s9-ultra": "photo-1561154464-82e9adf32764",
  "samsung-galaxy-tab-s9-fe": "photo-1611532736597-de2d4265fba3",
  "xiaomi-pad-6-pro": "photo-1527698266440-12104e498b76",
  "lenovo-tab-p12": "photo-1585776245991-cf89dd7fc73a",
  "apple-ipad-gen-10": "photo-1604754742629-3e5728249d73",
  "huawei-matepad-pro-12.2": "photo-1542751371-adc38448a05e",
  "kindle-paperwhite-5": "photo-1510519138101-570d1dca3d66",
  "xiaomi-redmi-pad-se": "photo-1589739900266-43b2843f4c12",

  // Category 7: Màn hình máy tính
  "lg-ultragear-oled-27gr95qe": "photo-1527443224154-c4a3942d3acf",
  "dell-ultrasharp-u2424h": "photo-1547082299-de196ea013d6",
  "asus-rog-swift-pg32ucdm": "photo-1618424181497-157f25b6ddd5",
  "samsung-odyssey-g9-g95c": "photo-1603481588273-2f908a9a7a1b",
  "dell-s2721qs-4k": "photo-1593642632823-8f785ba67e45",
  "lg-dualup-28mq780": "photo-1551645121-d1034da75057",
  "gigabyte-m27q": "photo-1563986768609-322da13575f3",
  "viewsonic-va2432-h": "photo-1542751371-adc38448a05e",
  "asus-proart-pa278qv": "photo-1616763355548-1b606f439f86",
  "samsung-viewfinity-s8": "photo-1585776245991-cf89dd7fc73a",

  // Category 8: Bàn phím & Chuột
  "logitech-mx-master-3s": "photo-1615663245857-ac93bb7c39e7",
  "keychron-k2-v2-hot-swappable": "photo-1618384887929-16ec33fab9ef",
  "logitech-g-pro-x-superlight-2": "photo-1626958390898-162d3577f593",
  "razer-deathadder-v3-pro": "photo-1560769629-975ec94e6a86",
  "akko-3068b-plus-prunus-lunas": "photo-1595225476474-87563907a212",
  "logitech-mx-keys-s": "photo-1601445638532-3c6f6c3aa1d6",
  "royal-kludge-rk61": "photo-1587829741301-dc798b83add3",
  "steelseries-apex-pro-tkl": "photo-1631553127988-5df2c29c8e87",
  "logitech-pebble-2-combo": "photo-1601445638532-3c6f6c3aa1d6",
  "corsair-k70-rgb-pro": "photo-1595225476474-87563907a212",

  // Category 9: Loa & Âm thanh
  "marshall-acton-iii": "photo-1589003077984-894e133dabab",
  "marshall-stanmore-iii": "photo-1612196808214-b8e1d6145a8c",
  "jbl-charge-5": "photo-1545454675-3531b543be5d",
  "jbl-flip-6": "photo-1608248597481-496100c8c836",
  "bose-soundlink-flex": "photo-1618336753974-aae8e04506aa",
  "harman-kardon-aura-studio-4": "photo-1608043152269-423dbba4e7e1",
  "apple-homepod-2": "photo-1518609878373-06d740f60d8b",
  "sony-srs-xb100": "photo-1523293182086-7651a899d37f",
  "marshall-willen": "photo-1612196808214-b8e1d6145a8c",
  "bo-beosound-a1-2nd-gen": "photo-1608043152269-423dbba4e7e1",

  // Category 10: Thiết bị nhà thông minh
  "google-nest-hub-gen-2": "photo-1558002038-1055907df827",
  "xiaomi-smart-camera-c300": "photo-1585338107529-13afc5f02586",
  "den-thong-minh-philips-hue-white": "photo-1513694203232-719a280e022f",
  "o-cam-thong-minh-tuya-wifi-16a": "photo-1631553127988-5df2c29c8e87",
  "google-nest-mini-gen-2": "photo-1507668077129-56e32842fceb",
  "robot-hut-bui-roborock-q-revo": "photo-1600585154340-be6161a56a0c",
  "xiaomi-smart-air-purifier-4": "photo-1622838320000-7b2434a93eb8",
  "khoa-cua-thong-minh-xiaomi-e10": "photo-1586023492125-27b2c045efd7",
  "cong-tac-thong-minh-aqara-d1": "photo-1631553127988-5df2c29c8e87",
  "cam-bien-chuyen-dong-aqara": "photo-1507668077129-56e32842fceb",

  // Category 11: Máy ảnh & Máy quay
  "sony-alpha-7-iv": "photo-1516035069371-29a1b244cc32",
  "fujifilm-x-t5": "photo-1519638399535-1b036603ac77",
  "canon-eos-r50": "photo-1502920917128-1aa500764cbd",
  "dji-osmo-pocket-3": "photo-1616440347437-b1c73416efc2",
  "gopro-hero-12-black": "photo-1607604276583-eef5d076aa5f",
  "sony-zv-e10": "photo-1502920917128-1aa500764cbd",
  "insta360-x4": "photo-1616440347437-b1c73416efc2",
  "nikon-z-f": "photo-1519638399535-1b036603ac77",
  "fujifilm-instax-mini-12": "photo-1488646953014-85cb44e25828",
  "canon-eos-r6-mark-ii": "photo-1568849676085-51415703900f",

  // Category 12: Thiết bị lưu trữ
  "samsung-t7-shield-1tb": "photo-1531403009284-440f080d1e12",
  "samsung-t9-portable-ssd-2tb": "photo-1597852074816-d933c7d2b988",
  "sandisk-extreme-portable-ssd-e61-1tb": "photo-1531403009284-440f080d1e12",
  "the-nho-microsd-sandisk-ultra-128gb": "photo-1618424181497-157f25b6ddd5",
  "usb-kingston-datatraveler-exodia-64gb": "photo-1628136128038-104c8c7f2be0",
  "ssd-kingston-nv2-1tb-pcie-4.0-nvme": "photo-1597852074816-d933c7d2b988",
  "wd-my-passport-2tb-o-cung-di-dong": "photo-1544244015-0df4b3ffc6b0",
  "ssd-samsung-990-pro-1tb-pcie-4.0": "photo-1597852074816-d933c7d2b988",
  "the-nho-sd-sandisk-extreme-pro-64gb": "photo-1618424181497-157f25b6ddd5",
  "crucial-x9-pro-2tb-portable-ssd": "photo-1531403009284-440f080d1e12"
};

async function download(slug, imageId) {
  const url = `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=400&h=400&q=80`;
  const filename = `${slug}.jpg`;
  const filepath = join(destDir, filename);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(filepath, buffer);
    console.log(`📥 Downloaded: ${filename}`);
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error(`❌ Failed to download ${slug}:`, error.message);
    return null;
  }
}

async function updateDatabase() {
  console.log("=== Bắt đầu tải ảnh độc bản & cập nhật Database ===");

  const slugs = Object.keys(imageMapping);
  let updatedCount = 0;

  for (const slug of slugs) {
    const imageId = imageMapping[slug];
    
    // Download image
    const localUrl = await download(slug, imageId);
    
    if (localUrl) {
      try {
        // 1. Tìm sản phẩm dựa trên slug
        const product = await prisma.products.findUnique({
          where: { slug }
        });

        if (product) {
          // 2. Cập nhật bảng product_images (Đặt lại tất cả ảnh phụ của nó nếu có, và tạo mới ảnh độc bản làm primary)
          // Xóa ảnh cũ
          await prisma.product_images.deleteMany({
            where: { product_id: product.id }
          });

          // Tạo ảnh mới
          await prisma.product_images.create({
            data: {
              product_id: product.id,
              image_url: localUrl,
              alt_text: product.name,
              sort_order: 1,
              is_primary: true
            }
          });

          // 3. Cập nhật bảng product_variants để sử dụng ảnh mới này
          await prisma.product_variants.updateMany({
            where: { product_id: product.id },
            data: {
              image_url: localUrl
            }
          });

          console.log(`✅ Cập nhật Database thành công cho: "${product.name}"`);
          updatedCount++;
        } else {
          console.warn(`⚠️ Không tìm thấy sản phẩm có slug: "${slug}" trong DB`);
        }
      } catch (dbError) {
        console.error(`❌ Lỗi DB khi cập nhật sản phẩm "${slug}":`, dbError.message);
      }
    }

    // Delay 100ms to avoid slamming Unsplash
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n=== Hoàn tất! Đã cập nhật ảnh độc bản thành công cho ${updatedCount}/${slugs.length} sản phẩm ===`);
}

updateDatabase()
  .catch(e => {
    console.error("❌ Lỗi nghiêm trọng:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
