console.log("✅ main.js loaded");

// ================= FIREBASE WEB SDK =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyCESmCsc0_Cvk4-uTy4EhX0FirYg-t50xQ",
  authDomain: "htkdtm-92805.firebaseapp.com",
  projectId: "htkdtm-92805",
  storageBucket: "htkdtm-92805.firebasestorage.app",
  messagingSenderId: "320648655367",
  appId: "1:320648655367:web:025e5c2bf30ce70ed130a2"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= N8N WEBHOOK =================
const N8N_WEBHOOK_URL =
  "https://phuonganh004.app.n8n.cloud/webhook/login-alert";

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // ================= TAB SWITCH =================
  tabLogin?.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  tabRegister?.addEventListener("click", () => {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // ================= REGISTER =================
  document.getElementById("btn-register")?.addEventListener("click", async () => {
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const password = document.getElementById("register-password").value;
    const confirm = document.getElementById("register-confirm").value;

    if (!name || !email || !phone || !password || !confirm) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirm) {
      alert("Mật khẩu không khớp");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        phone,
        role: "tenant",
        createdAt: serverTimestamp()
      });

      alert("Đăng ký thành công!");
      tabLogin.click();

    } catch (err) {
      alert("Lỗi đăng ký: " + err.message);
    }
  });

  // ================= LOGIN =================
  document.getElementById("btn-login")?.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      // 1️⃣ Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // 2️⃣ Lấy role
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        alert("Không tìm thấy hồ sơ người dùng");
        return;
      }

      const { role } = snap.data();

      // 3️⃣ Log đăng nhập thành công
      await addDoc(collection(db, "login_logs"), {
        uid: cred.user.uid,
        email: cred.user.email,
        role,
        status: "success",
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp()
      });

      // 4️⃣ Điều hướng
      if (role === "admin") {
        location.href = "admin.html";
      } else if (role === "owner") {
        location.href = "owner.html";
      } else {
        location.href = "Trangchu.html";
      }

    } catch (err) {
      console.error("❌ Login failed:", err.message);

      // 🚨 GỬI CẢNH BÁO TELEGRAM QUA N8N
      fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          error: err.message,
          time: new Date().toLocaleString(),
          userAgent: navigator.userAgent
        })
      }).catch(e => console.error("Webhook error:", e));

      alert("Đăng nhập thất bại: " + err.message);
    }
  });
});
