import { fetchAllData } from "./api.js";
import { renderPage } from "./render.js";

document.addEventListener("DOMContentLoaded", async () => {
  

  // ===== SEARCH =====
  const searchBtn = document.querySelector("button[type='button'].bg-primary");
  const input = document.querySelector("input[placeholder*='Nhập quận']");
  const citySelect = document.getElementById("citySelect");

  if (searchBtn && input && citySelect) {
    searchBtn.addEventListener("click", () => {
      const keyword = input.value.trim();
      const city = citySelect.value;

      const url = `timkiem.html?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`;
      window.location.href = url;
    });
  }
});
