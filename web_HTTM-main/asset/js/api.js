// ================== API CONFIG ==================
const API_URL = "https://script.google.com/macros/s/AKfycbw_SGZF7YOo3w8rmwJK6T0E6bOPdEEnZQH-VeUupV6nwdMOq_YbI9570w8FjULeL0Gn/exec";

// ================== N8N WEBHOOK (PLACEHOLDER) ==================
// TODO: thay bằng webhook thật của n8n
const N8N_WEBHOOK_LOG = "https://n8n.your-domain/webhook/log-event";

// ================== NORMALIZE DATA ==================
function normalizeChoTotItem(item) {
  return {
    id: item.id || item.ad_id,
    title: item.title,
    image: item.image,
    price: Number(item.price) || 0,
    price_string: item.price_string,
    area_m2: Number(item.area_m2) || 0,
    district: item.district,
    region: item.region,
    ward: item.ward,
    street: item.street,
    seller: item.seller,
    rating: item.rating ? Number(item.rating) : null,
    lat: item.lat,
    lng: item.lng,
    date: item.date,
    category: item.category,
    group: item.group
  };
}

// ================== FETCH DATA ==================
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const normalized = data.map(normalizeChoTotItem);

    window.rawData = normalized;
    window.filteredData = [...normalized];

    return normalized;
  } catch (err) {
    console.error("Lỗi gọi API:", err);
    return [];
  }
}

// ================== LOG EVENT TO N8N ==================
async function logEventToN8N(eventType, payload) {
  try {
    await fetch(N8N_WEBHOOK_LOG, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        payload,
        timestamp: new Date().toISOString()
      })
    });
  } catch (e) {
    console.warn("Không gửi được log sang n8n (chưa cấu hình)");
  }
}
