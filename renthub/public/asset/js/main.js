// --- file: asset/js/main.js ---

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname.toLowerCase();
  const isSearchPage = path.includes("timkiem");

  // ===============================
  // 1. PAGE SIZE
  // ===============================
  window.PAGE_SIZE = isSearchPage ? 9 : 6;
  window.currentPage = 1;

  // ===============================
  // 2. ĐẢM BẢO filterState TỒN TẠI
  // ===============================
  if (!window.filterState) {
    window.filterState = {
      keyword: "",
      minPrice: null,
      maxPrice: null,
      areas: [],
      types: [],
      amenities: []
    };
  }

  // ===============================
  // 3. LẤY KEYWORD TỪ URL
  // ===============================
  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get("keyword") || params.get("q") || "").trim();

  window.filterState.keyword = keyword;

  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.value = keyword;
  }

  // ===============================
  // 4. LOAD DATA
  // ===============================
  if (typeof fetchData === "function") {
    await fetchData();
  }

  // Nếu fetchData không set filteredData → fallback
  if (!window.filteredData || !Array.isArray(window.filteredData)) {
    window.filteredData = window.rawData || [];
  }

  // ===============================
  // 5. ÁP DỤNG FILTER
  // ===============================
  if (isSearchPage && typeof applyFilter === "function") {
    applyFilter();
  } else if (typeof renderPage === "function") {
    renderPage();
  }

  // ===============================
  // 6. WIRE EVENTS
  // ===============================
  if (searchInput && typeof applyFilter === "function") {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        window.currentPage = 1;
        window.filterState.keyword = searchInput.value.trim();
        applyFilter();
      }
    });
  }
console.log(window.rawData[0]);
  const applyBtn = document.getElementById("applyFilterBtn");
  if (applyBtn && typeof applyFilter === "function") {
    applyBtn.addEventListener("click", () => {
      window.currentPage = 1;
      applyFilter();
    });
  }
});
