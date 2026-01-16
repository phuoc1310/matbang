# 🔐 HƯỚNG DẪN TẠO TÀI KHOẢN ĐĂNG NHẬP

## ⚡ Cách 1: Chạy Seeder (Nhanh nhất)

### Bước 1: Chạy seeder
```bash
cd D:\KDTM\web_HTTM-main\renthub
php artisan db:seed
```

### Bước 2: Đăng nhập với tài khoản mẫu

**Tài khoản User:**
- Email: `user@test.com`
- Mật khẩu: `123456`

**Tài khoản Admin:**
- Email: `admin@test.com`
- Mật khẩu: `123456`

---

## 🛠️ Cách 2: Tạo bằng Tinker

### Bước 1: Mở Tinker
```bash
cd D:\KDTM\web_HTTM-main\renthub
php artisan tinker
```

### Bước 2: Tạo user
```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Tạo user thường
$user = User::create([
    'name' => 'Nguyễn Văn B',
    'email' => 'nguyenvanb@gmail.com',
    'password' => Hash::make('123456')
]);

// Hoặc tạo admin
$admin = User::create([
    'name' => 'Admin',
    'email' => 'admin@gmail.com',
    'password' => Hash::make('123456')
]);
```

### Bước 3: Thoát Tinker
```php
exit
```

---

## 📝 Cách 3: Tạo trực tiếp trong Database

Nếu bạn quen với SQL, có thể tạo user trực tiếp:

```sql
INSERT INTO users (name, email, password, created_at, updated_at) 
VALUES (
    'Nguyễn Văn C',
    'nguyenvanc@gmail.com',
    '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5K5K5K5K5K5K', -- password: 123456
    NOW(),
    NOW()
);
```

**Lưu ý:** Mật khẩu phải được hash bằng bcrypt. Tốt nhất dùng cách 1 hoặc 2.

---

## ✅ Kiểm tra user đã tạo

### Bằng Tinker:
```bash
php artisan tinker
```
```php
use App\Models\User;
User::all();
```

### Bằng SQL:
```sql
SELECT id, name, email FROM users;
```

---

## 🔑 Thông tin đăng nhập mẫu (sau khi chạy seeder)

### User thường:
- **Email:** `user@test.com`
- **Mật khẩu:** `123456`

### Admin:
- **Email:** `admin@test.com`
- **Mật khẩu:** `123456`

---

## 🚨 Lưu ý bảo mật

⚠️ **QUAN TRỌNG:** 
- Các mật khẩu mẫu trên chỉ dùng cho môi trường development
- **KHÔNG** sử dụng mật khẩu yếu trong production
- Luôn đổi mật khẩu sau khi deploy lên server thật

---

## 🆘 Nếu vẫn không đăng nhập được

1. **Kiểm tra user có tồn tại:**
   ```bash
   php artisan tinker
   ```
   ```php
   User::where('email', 'user@test.com')->first();
   ```

2. **Kiểm tra mật khẩu:**
   ```php
   $user = User::where('email', 'user@test.com')->first();
   Hash::check('123456', $user->password); // Phải trả về true
   ```

3. **Tạo lại user:**
   ```php
   User::where('email', 'user@test.com')->delete();
   // Sau đó tạo lại bằng seeder hoặc tinker
   ```

---

**Sau khi tạo tài khoản, bạn có thể đăng nhập tại:** `http://127.0.0.1:8000/dang-nhap`
