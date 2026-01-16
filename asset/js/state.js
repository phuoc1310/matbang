// --- file: asset/js/state.js ---
// 1 nguồn state dùng chung cho mọi trang (tránh lỗi "is not defined")

window.rawData = window.rawData || [];
window.filteredData = window.filteredData || [];
window.currentPage = window.currentPage || 1;

window.filterState = window.filterState || {
  keyword: "",
  minPrice: 0,
  maxPrice: Infinity,
  areas: []
};

// PAGE_SIZE sẽ được main.js set theo trang (trang chủ 6, tìm kiếm 9)
window.PAGE_SIZE = window.PAGE_SIZE || 6;
