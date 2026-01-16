# 🌐 HƯỚNG DẪN XEM GIAO DIỆN TRONG CURSOR

## 📍 Cursor có tính năng Preview Web

Cursor có tính năng **Preview/Embedded Browser** để xem giao diện web trực tiếp trong editor mà không cần mở browser riêng.

---

## 🚀 CÁCH XEM GIAO DIỆN TRONG CURSOR

### Cách 1: Sử dụng Command Palette

1. Nhấn `Ctrl + Shift + P` (hoặc `Cmd + Shift + P` trên Mac)
2. Gõ: `Simple Browser: Show`
3. Nhập URL: `http://127.0.0.1:8000`
4. Enter

### Cách 2: Sử dụng Terminal Preview

1. Mở terminal trong Cursor: `Ctrl + `` (backtick)
2. Chạy server:
   ```bash
   cd renthub
   php artisan serve
   ```
3. Click vào link `http://127.0.0.1:8000` trong terminal
4. Cursor sẽ tự động mở preview

### Cách 3: Sử dụng Live Preview Extension

1. Cài extension **"Live Preview"** hoặc **"Simple Browser"**
2. Click icon preview ở sidebar
3. Nhập URL: `http://127.0.0.1:8000`

### Cách 4: Mở trong Browser thông thường

1. Đảm bảo server đang chạy:
   ```bash
   cd renthub
   php artisan serve
   ```
2. Mở browser (Chrome, Firefox, Edge...)
3. Truy cập: `http://127.0.0.1:8000`

---

## 🔧 CẤU HÌNH PREVIEW TRONG CURSOR

### Mở Preview Panel

1. **View** → **Command Palette** (`Ctrl + Shift + P`)
2. Gõ: `View: Show Simple Browser`
3. Hoặc: `View: Open Preview`

### Điều chỉnh kích thước

- Kéo border giữa các panel để resize
- Click vào icon để maximize/minimize
- Sử dụng `Ctrl + \` để split editor

---

## 💡 TIPS

### 1. Auto-refresh khi code thay đổi

- Cursor có thể tự động refresh preview
- Hoặc dùng extension **"Live Server"**

### 2. Debug trong Preview

- Click chuột phải → **Inspect** (nếu có)
- Hoặc mở DevTools: `F12` trong preview panel

### 3. Multiple URLs

- Có thể mở nhiều preview cùng lúc
- Mỗi preview là một tab riêng

---

## 🌐 CÁC URL QUAN TRỌNG

Sau khi chạy `php artisan serve`, truy cập:

- **Trang chủ:** `http://127.0.0.1:8000`
- **Đăng tin:** `http://127.0.0.1:8000/dang-tin`
- **Quản lý tin:** `http://127.0.0.1:8000/quan-ly-tin` (cần đăng nhập)
- **Admin:** `http://127.0.0.1:8000/admin/properties` (cần đăng nhập)
- **Đăng nhập:** `http://127.0.0.1:8000/dang-nhap`

---

## 🎯 KHUYẾN NGHỊ

### Nên dùng Preview trong Cursor khi:
- ✅ Muốn xem nhanh giao diện
- ✅ Code và preview cùng một màn hình
- ✅ Test nhanh các thay đổi

### Nên dùng Browser thông thường khi:
- ✅ Cần DevTools đầy đủ
- ✅ Test responsive design
- ✅ Test trên nhiều browser
- ✅ Cần extension browser

---

## 🆘 TROUBLESHOOTING

### Preview không hiển thị?

1. **Kiểm tra server đang chạy:**
   ```bash
   php artisan serve
   ```

2. **Kiểm tra URL đúng:**
   - Phải là: `http://127.0.0.1:8000`
   - Không phải: `https://` hoặc `localhost:8000`

3. **Thử mở trong browser thông thường:**
   - Nếu browser mở được → Vấn đề ở Cursor preview
   - Nếu browser cũng không mở → Vấn đề ở server

### Preview bị lỗi?

1. **Clear cache:**
   ```bash
   php artisan cache:clear
   php artisan view:clear
   ```

2. **Restart server:**
   - Dừng server: `Ctrl + C`
   - Chạy lại: `php artisan serve`

3. **Kiểm tra log:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

---

## 📝 LƯU Ý

- Preview trong Cursor có thể không hỗ trợ đầy đủ tính năng như browser thông thường
- Một số tính năng JavaScript có thể không hoạt động trong preview
- Nên test trên browser thực tế trước khi deploy

---

**Chúc bạn làm việc hiệu quả với Cursor! 🎉**
