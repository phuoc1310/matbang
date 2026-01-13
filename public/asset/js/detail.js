import { fetchAllData } from "./api.js";
import { renderImages } from "./render.js";
/** Lấy id từ URL: chitiet.html?id=... */
function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

/** Format địa chỉ gọn */
function formatLocation(item) {
  const parts = [item.street, item.ward, item.district, item.region].filter(Boolean);
  return parts.join(", ");
}

/** Render sao rating */
function renderStars(rating) {
  if (rating == null || Number.isNaN(rating)) return "Chưa có đánh giá";
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(r) + "☆".repeat(5 - r) + ` (${rating.toFixed(1)})`;
}

/** MOCK AI: demo luồng, thay bằng Dify API thật sau */
async function askAIWithContext(item) {
  const context = {
    title: item.title,
    price_string: item.price_string,
    area_m2: item.area_m2,
    location: formatLocation(item),
    category: item.category,
    seller: item.seller,
    rating: item.rating,
  };

  // giả lập thời gian gọi AI
  await new Promise((r) => setTimeout(r, 900));

  // trả kết quả demo (đủ để thuyết trình + chạy UI)
  return `AI phân tích nhanh:
- Vị trí: ${context.location || "Không rõ"}.
- Giá: ${context.price_string || "Liên hệ"}; diện tích: ${context.area_m2 || "—"} m².
- Gợi ý: phù hợp nếu bạn cần mặt bằng ${context.category || "kinh doanh"} và ưu tiên khu vực này. 
Lưu ý: kiểm tra pháp lý + quy hoạch trước khi cọc.`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = getIdFromUrl();
  if (!id) {
    console.warn("Missing id in URL");
    return;
  }

  // 1) Load data
  await fetchAllData(10);

  // 2) Find item
  const item = (window.rawData || []).find((x) => String(x.id) === String(id));
  if (!item) {
    console.warn("Item not found for id:", id);
    return;
  }
    renderImages(item);

  // 3) Bơm các phần bên trái nếu bạn có id tương ứng (không bắt buộc)
  // Nếu bạn đã gắn id="title", id="location", id="price", id="area", id="mainImage" thì nó tự fill
  const elTitle = document.getElementById("title");
  if (elTitle) elTitle.textContent = item.title || "";

  const elLoc = document.getElementById("location");
  if (elLoc) elLoc.textContent = formatLocation(item);

  const elPrice = document.getElementById("price");
  if (elPrice) elPrice.textContent = item.price_string || "Liên hệ";

  const elArea = document.getElementById("area");
  if (elArea) elArea.textContent = item.area_m2 ? `${item.area_m2} m²` : "—";

  const elMainImg = document.getElementById("mainImage");
  if (elMainImg && item.image) {
    elMainImg.style.backgroundImage = `url('${item.image}')`;
  }

  // ✅ 4) Bơm dữ liệu vào RIGHT block của bạn (GIỮ NGUYÊN HTML)
  const sellerEl = document.getElementById("detail-seller");
  if (sellerEl) sellerEl.textContent = item.seller || "Chủ mặt bằng (ẩn danh)";

  const ratingEl = document.getElementById("detail-rating");
  if (ratingEl) ratingEl.textContent = renderStars(item.rating);

  // ✅ 5) Cho inline onclick hoạt động trong ES module
  // Giữ nguyên: onclick="askAIAdvisor()"
  window.askAIAdvisor = async function () {
    const out = document.getElementById("ai-result");
    if (!out) return;

    out.textContent = "AI đang phân tích…";

    try {
      const ans = await askAIWithContext(item);
      out.textContent = ans;
    } catch (e) {
      console.error(e);
      out.textContent = "AI lỗi nhẹ. Thử lại sau (hoặc do bạn chưa nối Dify).";
    }
  };
});
