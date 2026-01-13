// ================= GLOBAL STATE =================
// TODO: Sau này state này có thể sync với backend hoặc Redis

window.rawData = window.rawData || [];
window.filteredData = window.filteredData || [];
window.currentPage = window.currentPage || 1;

window.filterState = window.filterState || {
  keyword: "",
  minPrice: 0,
  maxPrice: Infinity,
  areas: []
};

window.PAGE_SIZE = window.PAGE_SIZE || 6;
