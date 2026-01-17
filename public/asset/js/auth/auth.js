console.log("✅ auth.js loaded");

// asset/js/auth.js
// ================= FIREBASE IMPORT =================
import { auth, firestore } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= N8N CONFIG =================
const N8N_WEBHOOK_URL =
  "https://phuonganh004.app.n8n.cloud/webhook/login-alert";

// ================= REGISTER =================
export async function register({ email, password, displayName }) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    await setDoc(doc(firestore, "users", uid), {
      email,
      displayName,
      role: "user",
      status: "active",
      createdAt: serverTimestamp()
    });

    alert("Đăng ký thành công, mời đăng nhập");
    window.location.href = "dangnhap.html";

  } catch (err) {
    console.error("Register error:", err);
    alert("Đăng ký thất bại");
  }
}

// ================= LOGIN =================
export async function login(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const snap = await getDoc(doc(firestore, "users", uid));
    if (!snap.exists()) {
      alert("Không tìm thấy thông tin người dùng");
      return;
    }

    const { role } = snap.data();

    // ✅ (OPTIONAL) log đăng nhập thành công
    fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        loginStatus: "SUCCESS",
        role,
        time: new Date().toLocaleString()
      })
    });

    // Redirect theo role
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "owner") {
      window.location.href = "dangbai.html";
    } else {
      window.location.href = "Trangchu.html";
    }

  } catch (err) {
  console.error("Login error:", err);

  let reason = "LOGIN_FAILED";

  if (err.code === "auth/user-not-found") {
    reason = "EMAIL_NOT_FOUND";
  }

  if (
    err.code === "auth/wrong-password" ||
    err.code === "auth/invalid-credential"
  ) {
    reason = "WRONG_PASSWORD";
  }

  // ❗ UI KHÔNG PHÂN BIỆT
  alert("Sai email hoặc mật khẩu");

  try {
    console.log("🚨 Sending login alert to n8n...");

    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        loginStatus: "FAILED",
        reason,
        device: navigator.userAgent,
        time: new Date().toLocaleString()
      })
    });

    console.log("✅ Login alert sent");
  } catch (e) {
    console.error("❌ n8n fetch failed:", e);
  }
}

}

// ================= LOGOUT =================
export async function logout() {
  await signOut(auth);
  window.location.href = "dangnhap.html";
}

// ================= REQUIRE LOGIN =================
export function requireLogin(redirect = "dangnhap.html") {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = redirect;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");

  if (!btnLogin) {
    console.error("❌ Không tìm thấy nút đăng nhập");
    return;
  }

  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();

    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    console.log("🧪 Attempt login:", email);

    await login(email, password);
  });
});
