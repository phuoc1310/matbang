# 📋 HƯỚNG DẪN TEST MODULE ĐĂNG TIN MẶT BẰNG

## 🎯 Mục lục
1. [Chuẩn bị môi trường](#chuẩn-bị-môi-trường)
2. [Test chức năng đăng tin](#1-test-chức-năng-đăng-tin)
3. [Test quản lý tin đăng](#2-test-quản-lý-tin-đăng)
4. [Test tìm kiếm](#3-test-tìm-kiếm)
5. [Test quản lý trạng thái (Admin)](#4-test-quản-lý-trạng-thái-admin)
6. [Test lịch sử chỉnh sửa](#5-test-lịch-sử-chỉnh-sửa)
7. [Test validation và bảo mật](#6-test-validation-và-bảo-mật)

---

## 📦 Chuẩn bị môi trường

### Bước 1: Kiểm tra database
```bash
# Chạy migrations nếu chưa có
php artisan migrate

# Kiểm tra bảng đã tạo
# - properties
# - property_histories
```

### Bước 2: Tạo user test (nếu cần)
```bash
php artisan tinker
```
```php
use App\Models\User;

// Tạo user thường
$user = User::create([
    'name' => 'Test User',
    'email' => 'user@test.com',
    'password' => bcrypt('password')
]);

// Tạo admin user (nếu có phân quyền)
$admin = User::create([
    'name' => 'Admin User',
    'email' => 'admin@test.com',
    'password' => bcrypt('password')
]);
```

### Bước 3: Khởi động server
```bash
php artisan serve
```
Truy cập: `http://localhost:8000`

---

## 1. 🆕 TEST CHỨC NĂNG ĐĂNG TIN

### Test Case 1.1: Đăng tin thành công

**URL:** `GET /dang-tin`

**Các bước:**
1. Truy cập `/dang-tin`
2. Điền form với dữ liệu hợp lệ:
   ```
   Tiêu đề: Cho thuê mặt bằng văn phòng tại Quận 1
   Loại hình: Văn phòng
   Giá: 15000000
   Diện tích: 100
   Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM
   Mô tả: Mặt bằng rộng rãi, thoáng mát, gần trung tâm
   ```
3. Click "Đăng tin ngay"

**Kết quả mong đợi:**
- ✅ Redirect đến `/quan-ly-tin`
- ✅ Hiển thị thông báo: "Đăng tin thành công! Tin của bạn đang chờ duyệt."
- ✅ Tin đăng xuất hiện trong bảng với status = "Chờ duyệt"
- ✅ Có 1 bản ghi trong `property_histories` với reason = "Tạo tin đăng mới"

**Kiểm tra database:**
```sql
SELECT * FROM properties WHERE title LIKE '%Quận 1%';
SELECT * FROM property_histories WHERE reason = 'Tạo tin đăng mới';
```

---

### Test Case 1.2: Validation - Thiếu trường bắt buộc

**Các bước:**
1. Truy cập `/dang-tin`
2. Bỏ trống trường "Tiêu đề"
3. Click "Đăng tin ngay"

**Kết quả mong đợi:**
- ❌ Không submit được
- ❌ Hiển thị lỗi: "Vui lòng nhập tiêu đề" (màu đỏ)
- ❌ Form vẫn giữ nguyên dữ liệu đã nhập

**Test các trường khác:**
- Bỏ trống "Mô tả" → Lỗi validation
- Bỏ trống "Địa chỉ" → Lỗi validation
- Bỏ trống "Giá" → Lỗi validation
- Bỏ trống "Loại hình" → Lỗi validation

---

### Test Case 1.3: Validation - Dữ liệu không hợp lệ

**Các bước:**
1. Nhập giá âm: `-1000000`
2. Nhập diện tích âm: `-50`
3. Nhập giá không phải số: `abc`

**Kết quả mong đợi:**
- ❌ Lỗi validation cho từng trường
- ❌ Browser validation cũng chặn (type="number")

---

## 2. ✏️ TEST QUẢN LÝ TIN ĐĂNG

### Test Case 2.1: Xem danh sách tin đăng

**URL:** `GET /quan-ly-tin`

**Các bước:**
1. Đăng nhập (nếu có auth)
2. Truy cập `/quan-ly-tin`
3. Xem danh sách tin đăng

**Kết quả mong đợi:**
- ✅ Hiển thị bảng với các cột: ID, Tiêu đề, Giá, Địa chỉ, Trạng thái, Hiển thị, Hành động
- ✅ Chỉ hiển thị tin của user hiện tại
- ✅ Badge màu sắc cho trạng thái (vàng=chờ duyệt, xanh=đã duyệt, đỏ=từ chối)

---

### Test Case 2.2: Sửa tin đăng

**URL:** `GET /property/edit/{id}`

**Các bước:**
1. Từ trang quản lý, click "Sửa" trên một tin
2. Thay đổi một số thông tin:
   - Sửa tiêu đề
   - Thay đổi giá
3. Click "Lưu thay đổi"

**Kết quả mong đợi:**
- ✅ Form pre-filled với dữ liệu hiện tại
- ✅ Sau khi lưu, redirect về `/quan-ly-tin`
- ✅ Thông báo: "Cập nhật tin đăng thành công!"
- ✅ Status chuyển về "Chờ duyệt" (vàng)
- ✅ Có bản ghi mới trong `property_histories` với reason = "Cập nhật thông tin"
- ✅ `old_data` và `new_data` có sự khác biệt

**Kiểm tra database:**
```sql
-- Xem lịch sử
SELECT * FROM property_histories 
WHERE property_id = {id} 
ORDER BY created_at DESC 
LIMIT 1;

-- Kiểm tra dữ liệu cũ/mới
SELECT old_data->>'title' as old_title, 
       new_data->>'title' as new_title 
FROM property_histories;
```

---

### Test Case 2.3: Ẩn/Hiện tin đăng

**Các bước:**
1. Từ trang quản lý, click "Ẩn" trên một tin đang hiển thị
2. Kiểm tra trạng thái
3. Click "Hiện" để hiển thị lại

**Kết quả mong đợi:**
- ✅ Nút chuyển từ "Ẩn" → "Hiện" hoặc ngược lại
- ✅ Badge "Hiển thị" thay đổi: "Hiện" ↔ "Ẩn"
- ✅ Tin bị ẩn không hiển thị ở trang chủ/tìm kiếm

**Kiểm tra:**
- Vào `/` (trang chủ) → Tin bị ẩn không xuất hiện
- Vào `/timkiem` → Tin bị ẩn không trong kết quả

---

### Test Case 2.4: Xóa tin đăng

**Các bước:**
1. Từ trang quản lý, click "Xóa"
2. Xác nhận trong popup

**Kết quả mong đợi:**
- ✅ Popup xác nhận: "Bạn có chắc chắn muốn xóa tin này?"
- ✅ Sau khi xác nhận, tin biến mất khỏi danh sách
- ✅ Thông báo: "Xóa tin đăng thành công!"
- ✅ Tin bị soft delete (vẫn còn trong DB với `deleted_at`)

**Kiểm tra database:**
```sql
-- Tin bị xóa có deleted_at
SELECT id, title, deleted_at FROM properties WHERE id = {id};
```

**Test hủy xóa:**
- Click "Xóa" → Click "Hủy" trong popup → Tin vẫn còn

---

## 3. 🔍 TEST TÌM KIẾM

### Test Case 3.1: Tìm kiếm theo keyword

**URL:** `GET /timkiem?keyword=Quận 1`

**Các bước:**
1. Truy cập `/timkiem`
2. Nhập từ khóa: "Quận 1"
3. Click "Tìm kiếm"

**Kết quả mong đợi:**
- ✅ Hiển thị các tin có "Quận 1" trong title, address, hoặc description
- ✅ Chỉ hiển thị tin có status = "approved" và is_visible = 1
- ✅ Hiển thị pagination nếu có nhiều hơn 12 kết quả

---

### Test Case 3.2: Lọc theo loại hình

**Các bước:**
1. Chọn "Loại hình": "Văn phòng"
2. Click "Tìm kiếm"

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị tin có type = "Văn phòng"
- ✅ Tin "Đất" và "Cửa hàng" không xuất hiện

---

### Test Case 3.3: Lọc theo giá

**Các bước:**
1. Chọn "Mức giá": "10 – 50 triệu" (100000000-500000000)
2. Click "Tìm kiếm"

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị tin có giá trong khoảng 100,000,000 - 500,000,000
- ✅ Tin có giá 5 triệu hoặc 100 triệu không xuất hiện

---

### Test Case 3.4: Lọc theo diện tích

**Các bước:**
1. Chọn "Diện tích": "30 – 100m²"
2. Click "Tìm kiếm"

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị tin có area trong khoảng 30-100 m²

---

### Test Case 3.5: Kết hợp nhiều bộ lọc

**Các bước:**
1. Nhập keyword: "văn phòng"
2. Chọn loại: "Văn phòng"
3. Chọn giá: "10 – 50 triệu"
4. Click "Tìm kiếm"

**Kết quả mong đợi:**
- ✅ Kết quả thỏa mãn TẤT CẢ điều kiện (AND)
- ✅ Số lượng kết quả giảm đi

---

### Test Case 3.6: Không có kết quả

**Các bước:**
1. Nhập keyword không tồn tại: "xyzabc123"
2. Click "Tìm kiếm"

**Kết quả mong đợi:**
- ✅ Hiển thị: "Không tìm thấy mặt bằng phù hợp"
- ✅ Có nút "Quay về trang chủ"

---

## 4. 👨‍💼 TEST QUẢN LÝ TRẠNG THÁI (ADMIN)

### Test Case 4.1: Xem danh sách tin chờ duyệt

**URL:** `GET /admin/properties`

**Các bước:**
1. Truy cập `/admin/properties`
2. Xem thống kê và danh sách

**Kết quả mong đợi:**
- ✅ Hiển thị 3 thẻ thống kê: Chờ duyệt, Đã duyệt, Đã từ chối
- ✅ Mặc định hiển thị tab "Chờ duyệt"
- ✅ Bảng danh sách với đầy đủ thông tin
- ✅ Nút "Duyệt" và "Từ chối" cho mỗi tin pending

---

### Test Case 4.2: Phê duyệt tin đăng

**URL:** `POST /admin/properties/{id}/approve`

**Các bước:**
1. Từ trang admin, click "Duyệt" trên một tin pending
2. Kiểm tra kết quả

**Kết quả mong đợi:**
- ✅ Tin biến mất khỏi tab "Chờ duyệt"
- ✅ Thông báo: "Đã phê duyệt tin đăng #X: {title}"
- ✅ Tin chuyển sang trạng thái "Đã duyệt"
- ✅ `is_visible` = 1
- ✅ Có bản ghi trong `property_histories` với reason = "Admin phê duyệt tin đăng"

**Kiểm tra:**
- Vào tab "Đã duyệt" → Tin xuất hiện ở đó
- Vào `/` (trang chủ) → Tin có thể xuất hiện (nếu approved)

**Kiểm tra database:**
```sql
SELECT id, title, status, is_visible FROM properties WHERE id = {id};
SELECT * FROM property_histories WHERE property_id = {id} ORDER BY created_at DESC LIMIT 1;
```

---

### Test Case 4.3: Từ chối tin đăng

**URL:** `POST /admin/properties/{id}/reject`

**Các bước:**
1. Click "Từ chối" trên một tin pending
2. Modal hiện ra, nhập lý do: "Thông tin không chính xác"
3. Click "Xác nhận từ chối"

**Kết quả mong đợi:**
- ✅ Modal hiển thị tiêu đề tin đăng
- ✅ Form textarea để nhập lý do
- ✅ Sau khi submit, modal đóng
- ✅ Tin biến mất khỏi tab "Chờ duyệt"
- ✅ Thông báo: "Đã từ chối tin đăng #X: {title}"
- ✅ Tin chuyển sang trạng thái "Đã từ chối"
- ✅ `is_visible` = 0
- ✅ Có bản ghi trong `property_histories` với reason = "Từ chối: {lý do}"

**Test validation lý do:**
- Bỏ trống lý do → Lỗi: "Vui lòng nhập lý do từ chối"

**Kiểm tra:**
- Vào tab "Đã từ chối" → Tin xuất hiện
- Tin không hiển thị ở trang chủ/tìm kiếm

---

### Test Case 4.4: Xem tin đã duyệt/từ chối

**Các bước:**
1. Click tab "Đã duyệt" hoặc "Đã từ chối"
2. Xem danh sách

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị tin có status tương ứng
- ✅ Không có nút "Duyệt"/"Từ chối" (vì không phải pending)
- ✅ Vẫn có nút "Lịch sử"

---

### Test Case 4.5: Bộ lọc trạng thái

**Các bước:**
1. Click các tab: "Chờ duyệt", "Đã duyệt", "Đã từ chối", "Tất cả"
2. Kiểm tra URL và kết quả

**Kết quả mong đợi:**
- ✅ URL thay đổi: `?status=pending`, `?status=approved`, etc.
- ✅ Tab được chọn có màu nền khác biệt
- ✅ Danh sách thay đổi theo tab

---

## 5. 📜 TEST LỊCH SỬ CHỈNH SỬA

### Test Case 5.1: Xem lịch sử từ trang quản lý

**URL:** `GET /property/{id}/history`

**Các bước:**
1. Từ `/quan-ly-tin`, click "Lịch sử" trên một tin
2. Xem trang lịch sử

**Kết quả mong đợi:**
- ✅ Hiển thị thông tin tin đăng ở đầu trang
- ✅ Timeline các thay đổi theo thứ tự mới nhất trước
- ✅ Mỗi thay đổi hiển thị:
  - Người thực hiện
  - Thời gian (format: dd/mm/yyyy HH:mm:ss)
  - Lý do thay đổi (badge màu xanh)
  - So sánh dữ liệu cũ (màu đỏ) vs mới (màu xanh)

---

### Test Case 5.2: Kiểm tra các loại lịch sử

**Các bước:**
1. Tạo một tin → Xem lịch sử
2. Sửa tin → Xem lịch sử
3. Admin duyệt → Xem lịch sử
4. Admin từ chối → Xem lịch sử

**Kết quả mong đợi:**
- ✅ Lịch sử "Tạo tin đăng mới": `old_data` = null, `new_data` có đầy đủ
- ✅ Lịch sử "Cập nhật thông tin": So sánh được old vs new
- ✅ Lịch sử "Admin phê duyệt": Status thay đổi từ pending → approved
- ✅ Lịch sử "Từ chối: {lý do}": Status thay đổi từ pending → rejected

**Kiểm tra database:**
```sql
SELECT 
    id,
    reason,
    old_data->>'status' as old_status,
    new_data->>'status' as new_status,
    changed_by,
    created_at
FROM property_histories 
WHERE property_id = {id}
ORDER BY created_at DESC;
```

---

### Test Case 5.3: Xem lịch sử từ trang admin

**Các bước:**
1. Từ `/admin/properties`, click "Lịch sử" trên bất kỳ tin nào
2. Xem lịch sử

**Kết quả mong đợi:**
- ✅ Tương tự Test 5.1
- ✅ Admin có thể xem lịch sử của mọi tin (không chỉ tin của mình)

---

### Test Case 5.4: Tin chưa có lịch sử

**Các bước:**
1. Tạo tin nhưng chưa có thao tác gì (nếu có trường hợp này)
2. Hoặc xem lịch sử tin mới tạo

**Kết quả mong đợi:**
- ✅ Ít nhất có 1 bản ghi: "Tạo tin đăng mới"
- ✅ Nếu không có lịch sử nào: Hiển thị "Chưa có lịch sử chỉnh sửa"

---

## 6. 🔒 TEST VALIDATION VÀ BẢO MẬT

### Test Case 6.1: CSRF Protection

**Các bước:**
1. Mở DevTools → Network tab
2. Submit form đăng tin
3. Kiểm tra request có `_token`

**Kết quả mong đợi:**
- ✅ Mọi POST request đều có field `_token`
- ✅ Nếu thiếu token → Lỗi 419 (Page Expired)

---

### Test Case 6.2: Authorization - Sửa tin của người khác

**Các bước:**
1. User A tạo tin #1
2. User B cố gắng sửa tin #1 bằng cách thay đổi URL: `/property/edit/1`

**Kết quả mong đợi:**
- ❌ Lỗi 403 hoặc 404 (firstOrFail)
- ✅ Tin không được cập nhật

**Kiểm tra code:**
```php
Property::where('id', $id)
    ->where('user_id', Auth::id())  // Chỉ user sở hữu mới sửa được
    ->firstOrFail();
```

---

### Test Case 6.3: Authorization - Xóa tin của người khác

**Tương tự Test 6.2:**
- ❌ User khác không thể xóa tin không phải của mình

---

### Test Case 6.4: SQL Injection Protection

**Các bước:**
1. Trong form đăng tin, nhập:
   ```
   Title: Test' OR '1'='1
   ```
2. Submit form

**Kết quả mong đợi:**
- ✅ Dữ liệu được escape/an toàn
- ✅ Không có lỗi SQL
- ✅ Dữ liệu được lưu đúng như đã nhập (bao gồm cả ký tự đặc biệt)

---

### Test Case 6.5: XSS Protection

**Các bước:**
1. Nhập script trong mô tả:
   ```
   <script>alert('XSS')</script>
   ```
2. Xem tin đã đăng

**Kết quả mong đợi:**
- ✅ Script không chạy
- ✅ Ký tự HTML được escape: `&lt;script&gt;...&lt;/script&gt;`

---

## 7. 🎨 TEST UI/UX

### Test Case 7.1: Responsive Design

**Các bước:**
1. Mở trang trên mobile (DevTools → Responsive mode)
2. Kiểm tra các trang: create, manage, admin, history

**Kết quả mong đợi:**
- ✅ Layout không bị vỡ
- ✅ Bảng có thể scroll ngang (overflow-x-auto)
- ✅ Form vẫn dễ sử dụng trên mobile

---

### Test Case 7.2: Dark Mode

**Các bước:**
1. Thêm class "dark" vào `<html>`
2. Kiểm tra màu sắc

**Kết quả mong đợi:**
- ✅ Tất cả element có màu tương ứng dark mode
- ✅ Text dễ đọc
- ✅ Contrast đủ

---

### Test Case 7.3: Loading States

**Các bước:**
1. Throttle network trong DevTools (Slow 3G)
2. Submit form hoặc load trang

**Kết quả mong đợi:**
- ✅ Không có flash/bug UI khi loading
- ✅ User biết đang chờ (spinner hoặc disabled state)

---

## 8. 🐛 TEST EDGE CASES

### Test Case 8.1: Dữ liệu biên

**Test các giá trị:**
- Giá = 0 → Hợp lệ (nếu validation cho phép)
- Giá = 999,999,999,999 → Kiểm tra hiển thị
- Diện tích = 0 → Hợp lệ (nullable)
- Title rất dài (500 ký tự) → Hiển thị bị cắt?
- Mô tả rất dài → Scroll được?

---

### Test Case 8.2: Xóa tin đã được duyệt

**Các bước:**
1. Admin duyệt tin
2. User xóa tin của mình

**Kết quả mong đợi:**
- ✅ User vẫn có thể xóa tin của mình (dù đã được duyệt)
- ✅ Tin biến mất khỏi tất cả trang (home, search)

---

### Test Case 8.3: Sửa tin đã bị từ chối

**Các bước:**
1. Admin từ chối tin
2. User sửa tin

**Kết quả mong đợi:**
- ✅ User có thể sửa tin
- ✅ Status reset về "pending" (chờ duyệt lại)

---

## 📝 CHECKLIST TỔNG HỢP

### Chức năng cơ bản
- [ ] Đăng tin thành công
- [ ] Validation form hoạt động
- [ ] Sửa tin đăng
- [ ] Xóa tin đăng
- [ ] Ẩn/Hiện tin đăng

### Tìm kiếm
- [ ] Tìm theo keyword
- [ ] Lọc theo loại hình
- [ ] Lọc theo giá
- [ ] Lọc theo diện tích
- [ ] Kết hợp nhiều bộ lọc
- [ ] Không có kết quả

### Admin
- [ ] Xem danh sách tin chờ duyệt
- [ ] Phê duyệt tin
- [ ] Từ chối tin với lý do
- [ ] Bộ lọc trạng thái
- [ ] Thống kê hiển thị đúng

### Lịch sử
- [ ] Xem lịch sử từ trang quản lý
- [ ] Xem lịch sử từ trang admin
- [ ] So sánh dữ liệu cũ/mới
- [ ] Hiển thị người thay đổi và thời gian

### Bảo mật
- [ ] CSRF protection
- [ ] Authorization (chỉ sửa/xóa tin của mình)
- [ ] SQL Injection protection
- [ ] XSS protection

### UI/UX
- [ ] Responsive design
- [ ] Dark mode
- [ ] Loading states
- [ ] Error messages rõ ràng

---

## 🔧 DEBUG TIPS

### Kiểm tra log
```bash
tail -f storage/logs/laravel.log
```

### Kiểm tra database trực tiếp
```bash
php artisan tinker
```
```php
// Xem tất cả properties
App\Models\Property::all();

// Xem property với histories
$property = App\Models\Property::with('histories')->first();
$property->histories;

// Xem histories với user
App\Models\PropertyHistory::with('changedByUser')->get();
```

### Clear cache (nếu cần)
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

---

## ✅ KẾT QUẢ MONG ĐỢI

Sau khi test tất cả, bạn nên có:
- ✅ Tất cả chức năng hoạt động đúng
- ✅ Validation hoạt động tốt
- ✅ Bảo mật được đảm bảo
- ✅ UI/UX mượt mà
- ✅ Không có lỗi trong console/log
- ✅ Database data nhất quán

---

**Chúc bạn test thành công! 🎉**
