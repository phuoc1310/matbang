function normalizeText(s = "") {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseMoney(v) {
  return Number(String(v || "").replace(/[^\d]/g, "")) || 0;
}

function collectFilterState() {
  const state = window.__SEARCH_STATE__ || {};

  return {
    keyword: normalizeText(
      document.getElementById("search")?.value || state.keyword || ""
    ),
    city: state.city || "",
    minPrice: parseMoney(document.getElementById("minPrice")?.value),
    maxPrice: parseMoney(document.getElementById("maxPrice")?.value) || Infinity,
    areas: Array.from(
      document.querySelectorAll("input[data-area]:checked")
    ).map(cb => cb.dataset.area),
  };
}


function applyFilter() {
  if (!Array.isArray(window.rawData)) return;

  const f = collectFilterState();

  // ================== LOG SEARCH EVENT (N8N) ==================
  // TODO: n8n sẽ lưu event này vào DB để Superset phân tích
  logEventToN8N("SEARCH", f);

  window.filteredData = window.rawData.filter(item => {
    if (f.city) {
      const region = normalizeText(item.region || "");

      const cityMap = {
        hcm: ["ho chi minh", "tp ho chi minh", "hcm","TP.HCM"],
        hn: ["ha noi"],
        dn: ["da nang"],
        bd: ["binh duong"],
      };

      const allow = cityMap[f.city] || [];
      if (!allow.some(k => region.includes(k))) return false;
    }
    const text = normalizeText(`
      ${item.title} ${item.street} ${item.ward} ${item.district} ${item.region}
    `);

    if (f.keyword && !text.includes(f.keyword)) return false;

    const price = item.price || 0;
    if (price < f.minPrice || price > f.maxPrice) return false;

    if (f.areas.length) {
      const area = item.area_m2 || 0;
      let ok = false;
      for (const a of f.areas) {
        if (a === "0-30" && area < 30) ok = true;
        if (a === "30-50" && area >= 30 && area <= 50) ok = true;
        if (a === "50-80" && area > 50 && area <= 80) ok = true;
        if (a === "80+" && area > 80) ok = true;
      }
      if (!ok) return false;
    }
    return true;
  });

  window.currentPage = 1;
  renderPage?.();
}

document.addEventListener("DOMContentLoaded", () => {
  const citySelect = document.getElementById("citySelect");
  if (!citySelect) return;

  citySelect.addEventListener("change", () => {
    window.currentPage = 1;
    applyFilter();
  });
});
