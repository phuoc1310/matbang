# 🚀 HƯỚNG DẪN SETUP N8N WORKFLOW - KIỂM DUYỆT TỰ ĐỘNG

## 📋 Tổng quan

Hệ thống đã được tích hợp sẵn với n8n để tự động kiểm duyệt tin đăng. Khi có tin đăng mới:

1. **Laravel** → Gửi webhook đến n8n
2. **n8n** → Xử lý theo rules đã cấu hình
3. **n8n** → Gửi phản hồi về Laravel (approve/reject)
4. **Laravel** → Cập nhật trạng thái và lưu lịch sử

---

## ⚙️ BƯỚC 1: Cấu hình Laravel

### 1.1. Cập nhật file `.env`

Thêm các dòng sau vào file `renthub/.env`:

```env
# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/property-review
MODERATION_WEBHOOK_SECRET=your-secret-key-change-this-to-something-secure
MODERATION_AUTO_APPROVE=false
```

**Giải thích:**
- `N8N_WEBHOOK_URL`: URL webhook của n8n (sẽ có sau khi tạo workflow)
- `MODERATION_WEBHOOK_SECRET`: Secret key để xác thực (phải khớp với n8n)
- `MODERATION_AUTO_APPROVE`: `false` = dùng n8n, `true` = tự động duyệt theo rules trong config

### 1.2. Clear cache

```bash
cd D:\KDTM\web_HTTM-main\renthub
php artisan config:clear
php artisan cache:clear
```

---

## 🔧 BƯỚC 2: Tạo n8n Workflow

### 2.1. Tạo Workflow mới trong n8n

1. Mở n8n dashboard
2. Click **"New Workflow"**
3. Đặt tên: **"Property Auto Moderation"**

### 2.2. Thêm Webhook Trigger

1. Kéo thả node **"Webhook"** vào canvas
2. Cấu hình:
   - **HTTP Method**: `POST`
   - **Path**: `property-review` (hoặc tùy chọn)
   - **Response Mode**: `Respond to Webhook`
   - **Authentication**: None (hoặc Basic nếu cần)
3. Click **"Execute Node"** để lấy Webhook URL
4. Copy **Webhook URL** và dán vào `.env`:
   ```
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/property-review
   ```

### 2.3. Thêm Node Parse Data

1. Thêm node **"Code"** (hoặc **"Function"**)
2. Đặt tên: **"Parse Data"**
3. Code:

```javascript
// Parse dữ liệu từ Laravel
const body = $input.item.json.body || $input.item.json;
const property = body.property;
const event = body.event;
const webhookSecret = body.webhook_secret;

// Validate webhook secret
const expectedSecret = 'your-secret-key-change-this'; // Thay bằng secret trong .env
if (webhookSecret !== expectedSecret) {
  throw new Error('Invalid webhook secret');
}

// Trả về dữ liệu để xử lý
return {
  property_id: property.id,
  title: property.title,
  description: property.description || '',
  price: property.price,
  area: property.area,
  type: property.type,
  address: property.address || '',
  user_id: property.user_id,
  created_at: property.created_at
};
```

### 2.4. Thêm các Node kiểm tra Rules

#### Rule 1: Kiểm tra giá tối thiểu

1. Thêm node **"IF"**
2. Đặt tên: **"Check Price"**
3. Condition:
   ```
   {{ $json.price }} >= 1000000
   ```
   - **True**: Tiếp tục
   - **False**: Reject

#### Rule 2: Kiểm tra độ dài tiêu đề

1. Thêm node **"IF"**
2. Đặt tên: **"Check Title Length"**
3. Condition:
   ```
   {{ $json.title.length }} >= 10
   ```

#### Rule 3: Kiểm tra độ dài mô tả

1. Thêm node **"IF"**
2. Đặt tên: **"Check Description"**
3. Condition:
   ```
   {{ ($json.description || '').length }} >= 20
   ```

#### Rule 4: Kiểm tra từ khóa spam

1. Thêm node **"Code"**
2. Đặt tên: **"Check Spam Keywords"**
3. Code:

```javascript
const spamKeywords = ['spam', 'lừa đảo', 'fake', 'scam', 'lừa'];
const text = (($json.title || '') + ' ' + ($json.description || '')).toLowerCase();
const hasSpam = spamKeywords.some(keyword => text.includes(keyword));

return {
  no_spam: !hasSpam,
  reason: hasSpam ? 'Chứa từ khóa spam' : ''
};
```

### 2.5. Merge tất cả kết quả

1. Thêm node **"Merge"**
2. Đặt tên: **"Merge All Checks"**
3. Mode: **"Combine All"**

### 2.6. Quyết định Duyệt/Từ chối

1. Thêm node **"IF"**
2. Đặt tên: **"All Rules Passed?"**
3. Condition: Tất cả rules đều pass

### 2.7. Gửi phản hồi về Laravel

#### Node Approve:

1. Thêm node **"HTTP Request"**
2. Đặt tên: **"Approve Request"**
3. Cấu hình:
   - **Method**: `POST`
   - **URL**: `http://127.0.0.1:8000/api/webhook/n8n` (hoặc domain của bạn)
   - **Body (JSON)**:
   ```json
   {
     "property_id": {{ $('Parse Data').item.json.property_id }},
     "status": "approved",
     "reason": "Tự động duyệt - Tin đăng đáp ứng tất cả điều kiện",
     "webhook_secret": "your-secret-key-change-this"
   }
   ```

#### Node Reject:

1. Thêm node **"HTTP Request"**
2. Đặt tên: **"Reject Request"**
3. Cấu hình tương tự nhưng:
   - **status**: `"rejected"`
   - **reason**: `"Tự động từ chối - Tin đăng vi phạm điều kiện"`

### 2.8. Response cho Webhook

1. Thêm node **"Respond to Webhook"**
2. Đặt tên: **"Respond to Webhook"**
3. Response:
   ```json
   {
     "success": true,
     "message": "Webhook processed",
     "property_id": {{ $('Parse Data').item.json.property_id }}
   }
   ```

---

## 🔗 Kết nối các Node

Kết nối theo thứ tự:
```
Webhook → Parse Data → Check Price
                              ├─→ Check Title Length → Check Spam Keywords
                              └─→ Check Description → Check Spam Keywords
                                                              ↓
                                                    Merge All Checks
                                                              ↓
                                                    All Rules Passed?
                                                              ├─→ Approve Request
                                                              └─→ Reject Request
                                                                      ↓
                                                          Respond to Webhook
```

---

## 🧪 BƯỚC 3: Test Workflow

### 3.1. Test trong n8n

1. Click **"Execute Workflow"** trong n8n
2. Gửi test data:
   ```json
   {
     "event": "property.created",
     "property": {
       "id": 1,
       "title": "Cho thuê mặt bằng văn phòng tại Quận 1",
       "description": "Mặt bằng rộng rãi, thoáng mát, gần trung tâm",
       "price": 15000000,
       "area": 100,
       "type": "Văn phòng",
       "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
       "user_id": 1,
       "created_at": "2024-01-16T10:00:00Z"
     },
     "webhook_secret": "your-secret-key-change-this"
   }
   ```
3. Kiểm tra từng node có chạy đúng không

### 3.2. Test từ Laravel

1. Đăng tin mới tại: `http://127.0.0.1:8000/dang-tin`
2. Kiểm tra log n8n → Webhook có nhận được?
3. Kiểm tra log Laravel:
   ```bash
   tail -f storage/logs/laravel.log | grep N8N
   ```
4. Kiểm tra database → Property status đã thay đổi?

### 3.3. Test Response từ n8n

Sử dụng cURL hoặc Postman:

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

---

## 📊 Các Rules mẫu

### Rule 1: Giá hợp lý
```javascript
// Giá từ 1 triệu đến 1 tỷ
return $json.price >= 1000000 && $json.price <= 1000000000;
```

### Rule 2: Tiêu đề đầy đủ
```javascript
// Tiêu đề ít nhất 10 ký tự
return ($json.title || '').length >= 10;
```

### Rule 3: Mô tả chi tiết
```javascript
// Mô tả ít nhất 20 ký tự
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
// Địa chỉ phải có "Quận" hoặc "Huyện" hoặc tên thành phố
const validPatterns = ['Quận', 'Huyện', 'TP.', 'Thành phố'];
return validPatterns.some(pattern => ($json.address || '').includes(pattern));
```

### Rule 6: Loại hình hợp lệ
```javascript
const validTypes = ['Đất', 'Văn phòng', 'Cửa hàng'];
return validTypes.includes($json.type);
```

---

## 🔄 Workflow Polling (Tùy chọn)

Nếu muốn n8n tự động lấy tin chờ duyệt thay vì chờ webhook:

### Bước 1: Thêm Cron Trigger

1. Thêm node **"Cron"**
2. Cấu hình: Chạy mỗi 5 phút
   ```
   0 */5 * * * *
   ```

### Bước 2: Lấy danh sách tin chờ duyệt

1. Thêm node **"HTTP Request"**
2. Cấu hình:
   - **Method**: `GET`
   - **URL**: `http://127.0.0.1:8000/api/webhook/pending-properties?secret=your-secret-key-change-this&limit=10`

### Bước 3: Loop qua từng tin

1. Thêm node **"Split In Batches"** hoặc **"Loop Over Items"**
2. Với mỗi tin, áp dụng workflow tương tự như trên

---

## 🐛 Debug

### Debug trong n8n

1. **Xem Execution Log**: Click vào mỗi node → Xem output
2. **Sử dụng Debug mode**: Bật "Execute Workflow" → Xem từng bước
3. **Thêm node Set** để log dữ liệu giữa các bước

### Debug trong Laravel

**Xem log:**
```bash
cd D:\KDTM\web_HTTM-main\renthub
tail -f storage/logs/laravel.log
```

**Tìm webhook logs:**
```bash
grep "N8N" storage/logs/laravel.log
```

**Kiểm tra webhook có được gửi:**
```bash
grep "webhook sent" storage/logs/laravel.log
```

---

## ✅ Checklist

- [ ] Đã cấu hình `N8N_WEBHOOK_URL` trong `.env`
- [ ] Đã đặt `MODERATION_WEBHOOK_SECRET` an toàn
- [ ] Đã tạo workflow trong n8n
- [ ] Đã test webhook từ Laravel → n8n
- [ ] Đã test response từ n8n → Laravel
- [ ] Đã cấu hình rules trong n8n
- [ ] Đã test với dữ liệu thực tế
- [ ] Đã monitor logs để đảm bảo hoạt động ổn định

---

## 🔐 Bảo mật

1. **Webhook Secret**: Luôn sử dụng secret key để xác thực
2. **HTTPS**: Sử dụng HTTPS cho webhook URLs (production)
3. **Rate Limiting**: N8N có thể rate limit để tránh spam
4. **IP Whitelist**: (Tùy chọn) Chỉ cho phép IP của n8n

---

## 📝 Lưu ý

- **Async Processing**: Webhook được gửi async, không block response
- **Error Handling**: Nếu n8n không phản hồi, tin vẫn ở trạng thái pending
- **Manual Override**: Admin vẫn có thể duyệt/từ chối thủ công
- **History Logging**: Mọi thay đổi đều được ghi vào PropertyHistory

---

**Chúc bạn tích hợp thành công! 🎉**
