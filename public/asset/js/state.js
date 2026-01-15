// ================= GLOBAL STATE =================
window.rawData = window.rawData || [];
window.filteredData = window.filteredData || [];
window.currentPage = window.currentPage || 1;
window.PAGE_SIZE = window.PAGE_SIZE || 9; // Mặc định 9 cho tìm kiếm

window.__SEARCH_STATE__ = window.__SEARCH_STATE__ || {
  keyword: "",
  city: "",
  minPrice: 0,
  maxPrice: 20000000000,
  areas: []
};

console.log("📊 Global state initialized");