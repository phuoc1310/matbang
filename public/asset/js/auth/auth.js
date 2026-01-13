// public/js/auth.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// REGISTER
export async function register({ email, password, displayName }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  await setDoc(doc(db, "users", uid), {
    email,
    displayName,
    role: "user",
    status: "active",
    createdAt: serverTimestamp()
  });

  alert("Đăng ký thành công, mời đăng nhập");
  window.location.href = "/dangnhap.html";
}

// LOGIN

export async function login(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) {
    alert("Không tìm thấy role");
    return;
  }

  const role = snap.data().role;

  if (role === "admin") {
    window.location.href = "/admin.html";
  } else if (role === "owner") {
    window.location.href = "/dangbai.html";
  } else {
    window.location.href = "/trangchu.html";
  }
}
