import { auth, firestore } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= REGISTER ================= */
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
    window.location.href = "/dangnhap.html";
  } catch (err) {
    console.error("Register error:", err);
    alert(err.message);
  }
}

/* ================= LOGIN ================= */
export async function login(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const snap = await getDoc(doc(firestore, "users", uid));
    if (!snap.exists()) {
      alert("Không tìm thấy thông tin người dùng");
      return;
    }

    const role = snap.data().role;

    if (role === "admin") {
      window.location.href = "/admin.html";
    } else if (role === "owner") {
      window.location.href = "/dangbai.html";
    } else {
      window.location.href = "/Trangchu.html";
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Sai email hoặc mật khẩu");
  }
}
