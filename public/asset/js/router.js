// asset/js/router.js
import { renderProfile } from "./profile.js";

async function loadPage(page) {
  const spa = document.getElementById("spa-content");
  const home = document.getElementById("home-content");

  // ================= PROFILE =================
  if (page === "profile") {
    const res = await fetch("profile.html");
    spa.innerHTML = await res.text();

    home.classList.add("hidden");
    spa.classList.remove("hidden");

    // 🔥 chạy sau khi HTML đã gắn
    renderProfile();
    return;
  }

  // ================= POST =================
  if (page === "post") {
    const res = await fetch("post.html");
    spa.innerHTML = await res.text();

    home.classList.add("hidden");
    spa.classList.remove("hidden");
    return;
  }

  // ================= DEFAULT =================
  goHome();
}

function goHome() {
  const spa = document.getElementById("spa-content");
  const home = document.getElementById("home-content");

  spa.innerHTML = "";
  spa.classList.add("hidden");
  home.classList.remove("hidden");
}

// expose global
window.loadPage = loadPage;
window.goHome = goHome;
