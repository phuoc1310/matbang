// public/asset/js/trangchu.js
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./auth/firebase.js";
import { fetchAllData } from "./api.js";
import { renderPage } from "./render.js";
import { runBIAnalysis } from "./bi/biProcessor.js";

// DOM Elements cho phần User/Guest trên Header
// (Lưu ý: Header dùng chung, nhưng logic auth nên đặt ở trang chủ hoặc tách file auth riêng, 
// ở đây ta để ở trang chủ để demo cho gọn theo yêu cầu)
const guestUI = document.getElementById("guest-actions");
const userUI = document.getElementById("user-actions");
const userName = document.getElementById("user-name");
const btnLogout = document.getElementById("btn-logout");

// --- 1. LOGIC TẢI DỮ LIỆU SẢN PHẨM ---
document.addEventListener("DOMContentLoaded", async () => {
  // Cấu hình phân trang cho trang chủ
  window.PAGE_SIZE = 12;
  window.currentPage = 1;

  try {
    console.log("🔄 Loading data for homepage...");

    // Gọi API
    const data = await fetchAllData(20, ""); // Không có keyword

    console.log("📦 Data loaded:", data?.length);

    if (data && data.length > 0) {
      // Chạy BI Logic với context mặc định
      const searchContext = {
        avgPrice: 5000000,
        avgArea: 50,
        city: "hcm" // Mặc định HCM cho trang chủ
      };

      window.filteredData = window.rawData.map(item => ({
        ...item,
        score: 0.5,
        level: "Nổi bật"
      }));


      // Sắp xếp theo điểm BI
      window.filteredData.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
      window.filteredData = [];
    }

    // Render ra màn hình
    if (window.renderPage) {
      renderPage();
    }

  } catch (error) {
    console.error("❌ Error loading homepage data:", error);
    window.filteredData = [];
    if (window.renderPage) renderPage();
  }
});

// --- 2. LOGIC ĐĂNG NHẬP / ĐĂNG KÝ (Firebase) ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User ĐÃ đăng nhập
    if (guestUI) guestUI.classList.add("hidden");
    if (userUI) userUI.classList.remove("hidden");

    // Lấy tên user từ Firestore (nếu có lưu profile)
    if (userName) {
      const ref = doc(db, "users", user.uid);
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          userName.textContent = `${data.displayName || 'User'} (${data.role || 'Member'})`;
        } else {
          userName.textContent = user.email || "Thành viên";
        }
      } catch (e) {
        // Fallback nếu lỗi permission firestore hoặc không có mạng
        userName.textContent = user.email || "User";
      }
    }
  } else {
    // User CHƯA đăng nhập
    if (guestUI) guestUI.classList.remove("hidden");
    if (userUI) userUI.classList.add("hidden");
  }
});

// Xử lý nút Đăng xuất
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.reload();
  });
}