function requireRole(allowedRoles) {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    alert("Bạn chưa đăng nhập");
    window.location.href = "login.html";
    return;
  }

  if (!allowedRoles.includes(user.role)) {
    alert("Bạn không có quyền truy cập trang này");
    window.location.href = "profile.html";
  }
}
