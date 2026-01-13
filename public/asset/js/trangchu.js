import { auth, db } from "./auth/firebase.js";
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const guestUI = document.getElementById("guest-actions");
const userUI  = document.getElementById("user-actions");
const userName = document.getElementById("user-name");
const btnLogout = document.getElementById("btn-logout");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Đã đăng nhập
    guestUI.classList.add("hidden");
    userUI.classList.remove("hidden");

    // Lấy role + tên từ Firestore
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      userName.textContent =
        `${data.displayName} (${data.role})`;
    } else {
      userName.textContent = user.email;
    }
  } else {
    // Chưa đăng nhập
    guestUI.classList.remove("hidden");
    userUI.classList.add("hidden");
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});
