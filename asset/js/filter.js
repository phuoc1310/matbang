/* ================= TEXT NORMALIZE (QUAN TRỌNG) ================= */
// bỏ dấu + lowerCase để so chuỗi tiếng Việt
function normalizeText(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ================= TIỀN TỆ ================= */
function parseMoney(v) {
  return Number(String(v || "").replace(/[^\d]/g, "")) || 0;
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString("en-US");
}

/* ================= COLLECT FILTER ================= */
function collectFilterState() {
  return {
    keyword: normalizeText(
      document.getElementById("search")?.value || ""
    ),
    city: document.getElementById("citySelect")?.value || "",
    minPrice: parseMoney(document.getElementById("minPrice")?.value),
    maxPrice: parseMoney(document.getElementById("maxPrice")?.value) || 9e18,
    areas: Array.from(
      document.querySelectorAll("input[data-area]:checked")
    ).map(cb => cb.dataset.area),
  };
}

/* ================= APPLY FILTER ================= */
function applyFilter() {
  if (!Array.isArray(window.rawData)) {
    console.warn("rawData chưa sẵn sàng");
    return;
  }

  const f = collectFilterState();

  window.filteredData = window.rawData.filter(item => {

    /* ===== CITY ===== */
    if (f.city) {
      const region = normalizeText(item.region || "");

      const cityMap = {
        hcm: ["ho chi minh", "tp ho chi minh", "hcm"],
        hn: ["ha noi"],
        dn: ["da nang"],
        bd: ["binh duong"],
      };

      const allow = cityMap[f.city] || [];
      if (!allow.some(k => region.includes(k))) return false;
    }

    /* ===== KEYWORD ===== */
    if (f.keyword) {
      const text = normalizeText(`
        ${item.title || ""}
        ${item.street || ""}
        ${item.ward || ""}
        ${item.district || ""}
        ${item.region || ""}
      `);

      if (!text.includes(f.keyword)) return false;
    }

    /* ===== PRICE ===== */
    const price =
      Number(item.price) ||
      parseMoney(item.price_string) ||
      parseMoney(item.price_text);

    if (price < f.minPrice || price > f.maxPrice) return false;

    /* ===== AREA ===== */
    if (f.areas.length) {
      const area = Number(item.area_m2) || 0;
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

/* ================= PRICE INPUT ================= */
document.addEventListener("DOMContentLoaded", () => {
  const minEl = document.getElementById("minPrice");
  const maxEl = document.getElementById("maxPrice");
  if (!minEl || !maxEl) return;

  const sync = () => applyFilter();

  minEl.addEventListener("input", sync);
  maxEl.addEventListener("input", sync);

  minEl.addEventListener("blur", () => {
    minEl.value = formatMoney(parseMoney(minEl.value));
  });

  maxEl.addEventListener("blur", () => {
    maxEl.value = formatMoney(parseMoney(maxEl.value));
  });
});

/* ================= CITY SELECT ================= */
document.addEventListener("DOMContentLoaded", () => {
  const citySelect = document.getElementById("citySelect");
  if (!citySelect) return;

  citySelect.addEventListener("change", () => {
    window.currentPage = 1;
    applyFilter();
  });
});
