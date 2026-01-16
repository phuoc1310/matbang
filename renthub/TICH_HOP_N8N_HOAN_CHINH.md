# 🔄 TÍCH HỢP N8N - KIỂM DUYỆT TỰ ĐỘNG HOÀN CHỈNH

## ✅ Đã tích hợp sẵn

Hệ thống đã được tích hợp đầy đủ với n8n. Các thành phần:

### 1. **WebhookController** (`app/Http/Controllers/WebhookController.php`)
- ✅ `handleN8n()` - Nhận phản hồi từ n8n
- ✅ `getPendingProperties()` - API để n8n lấy danh sách tin chờ duyệt

### 2. **AutoModerationService** (`app/Services/AutoModerationService.php`)
- ✅ `sendToN8n()` - Gửi webhook đến n8n
- ✅ `processN8nResponse()` - Xử lý phản hồi từ n8n
- ✅ `moderateProperty()` - Kiểm duyệt tự động theo rules
- ✅ `processPendingProperties()` - Xử lý hàng loạt

### 3. **Config** (`config/moderation.php`)
- ✅ Cấu hình rules kiểm duyệt
- ✅ Cấu hình webhook URL và secret
- ✅ Cấu hình auto approve

### 4. **Routes** (`routes/web.php`)
- ✅ `POST /api/webhook/n8n` - Nhận phản hồi từ n8n
- ✅ `GET /api/webhook/pending-properties` - Lấy tin chờ duyệt

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Cấu hình .env

Thêm vào `renthub/.env`:

```env
# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/property-review
MODERATION_WEBHOOK_SECRET=your-secret-key-change-this-to-something-secure
MODERATION_AUTO_APPROVE=false
```

### Bước 2: Tạo n8n Workflow

Xem file `SETUP_N8N_WORKFLOW.md` hoặc `n8n_workflow_simple.md` để biết cách tạo workflow.

### Bước 3: Test tích hợp

```bash
cd D:\KDTM\web_HTTM-main\renthub

# Test gửi webhook đến n8n
php artisan n8n:test

# Test với property cụ thể
php artisan n8n:test --property-id=1
```

### Bước 4: Đăng tin và kiểm tra

1. Đăng tin mới tại: `http://127.0.0.1:8000/dang-tin`
2. Kiểm tra n8n execution log
3. Kiểm tra Laravel log: `tail -f storage/logs/laravel.log | grep N8N`
4. Kiểm tra database - property status đã thay đổi?

---

## 🔄 QUY TRÌNH HOẠT ĐỘNG

### Khi có tin đăng mới:

1. **User đăng tin** → `POST /dang-tin`
2. **Laravel tạo property** → Status: `pending`
3. **Laravel gửi webhook** → `POST` đến n8n với thông tin property
4. **n8n xử lý** → Áp dụng rules, quyết định approve/reject
5. **n8n gửi phản hồi** → `POST /api/webhook/n8n` với status và reason
6. **Laravel cập nhật** → Property status và lưu lịch sử

### Nếu n8n không phản hồi:

- Property vẫn ở trạng thái `pending`
- Admin có thể duyệt/từ chối thủ công
- Có thể chạy lại webhook bằng command: `php artisan n8n:test`

---

## 📊 CÁC RULES MẪU

### Rule 1: Giá hợp lý (1 triệu - 1 tỷ)
```javascript
return $json.price >= 1000000 && $json.price <= 1000000000;
```

### Rule 2: Tiêu đề đầy đủ (>= 10 ký tự)
```javascript
return ($json.title || '').length >= 10;
```

### Rule 3: Mô tả chi tiết (>= 20 ký tự)
```javascript
return ($json.description || '').length >= 20;
```

### Rule 4: Chặn từ khóa spam
```javascript
const spamKeywords = ['spam', 'lừa đảo', 'fake', 'scam'];
const text = (($json.title || '') + ' ' + ($json.description || '')).toLowerCase();
return !spamKeywords.some(keyword => text.includes(keyword));
```

### Rule 5: Địa chỉ hợp lệ
```javascript
const validPatterns = ['Quận', 'Huyện', 'TP.', 'Thành phố'];
return validPatterns.some(pattern => ($json.address || '').includes(pattern));
```

---

## 🧪 TEST

### Test 1: Gửi webhook đến n8n

```bash
php artisan n8n:test --property-id=1
```

### Test 2: Test response từ n8n

```bash
curl -X POST http://127.0.0.1:8000/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "status": "approved",
    "reason": "Test approval",
    "webhook_secret": "your-secret-key-change-this"
  }'
```

### Test 3: Lấy danh sách tin chờ duyệt

```bash
curl "http://127.0.0.1:8000/api/webhook/pending-properties?secret=your-secret-key-change-this&limit=10"
```

---

## 📝 FILES ĐÃ TẠO

1. **SETUP_N8N_WORKFLOW.md** - Hướng dẫn chi tiết setup n8n workflow
2. **n8n_workflow_simple.md** - Workflow đơn giản 5 nodes
3. **n8n_workflow_example.json** - File JSON mẫu để import vào n8n
4. **TICH_HOP_N8N_HOAN_CHINH.md** - Tài liệu này

---

## 🔐 BẢO MẬT

1. ✅ **Webhook Secret** - Xác thực mọi request
2. ✅ **Validation** - Validate tất cả input
3. ✅ **Error Handling** - Xử lý lỗi an toàn
4. ✅ **Logging** - Ghi log đầy đủ

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi setup xong:

1. ✅ Đăng tin mới → Tự động gửi đến n8n
2. ✅ n8n xử lý → Quyết định approve/reject
3. ✅ n8n gửi phản hồi → Laravel cập nhật status
4. ✅ Lịch sử được ghi lại → Có thể xem trong `/property/{id}/history`

---

**Tích hợp đã sẵn sàng! Chỉ cần cấu hình n8n workflow! 🎉**
