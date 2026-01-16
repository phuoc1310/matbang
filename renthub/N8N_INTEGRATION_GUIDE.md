# 🔄 HƯỚNG DẪN TÍCH HỢP N8N - TỰ ĐỘNG KIỂM DUYỆT TIN ĐĂNG

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Cấu hình Laravel](#cấu-hình-laravel)
3. [Setup n8n Workflow](#setup-n8n-workflow)
4. [Các luật kiểm duyệt](#các-luật-kiểm-duyệt)
5. [Test và Debug](#test-và-debug)

---

## 🎯 Tổng quan

Hệ thống tích hợp n8n để tự động kiểm duyệt tin đăng dựa trên các luật (rules) được định nghĩa. Khi có tin đăng mới:

1. **Laravel** gửi webhook đến n8n với thông tin tin đăng
2. **n8n** xử lý theo workflow đã cấu hình
3. **n8n** gửi phản hồi về Laravel (approve/reject)
4. **Laravel** cập nhật trạng thái và lưu lịch sử

---

## ⚙️ Cấu hình Laravel

### Bước 1: Cấu hình Environment

Thêm vào file `.env`:

```env
# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/property-review
MODERATION_WEBHOOK_SECRET=your-secret-key-change-this
MODERATION_AUTO_APPROVE=false
```

**Giải thích:**
- `N8N_WEBHOOK_URL`: URL webhook của n8n để nhận thông báo
- `MODERATION_WEBHOOK_SECRET`: Secret key để xác thực (cần khớp với n8n)
- `MODERATION_AUTO_APPROVE`: Nếu `true`, tự động duyệt nếu pass rules (không cần n8n)

### Bước 2: Cấu hình Rules (Tùy chọn)

File `config/moderation.php` đã có sẵn các rules mặc định. Bạn có thể chỉnh sửa:

```php
'rules' => [
    'min_price' => [
        'field' => 'price',
        'operator' => 'min',
        'value' => 1000000, // 1 triệu
        'reason' => 'Giá cho thuê quá thấp',
    ],
    // Thêm rules khác...
],
```

**Các operators có sẵn:**
- `min`: Giá trị >= value
- `max`: Giá trị <= value
- `equals`: Giá trị == value
- `contains`: Chuỗi chứa value
- `not_contains`: Chuỗi không chứa value
- `in`: Giá trị nằm trong array
- `length_min`: Độ dài >= value
- `length_max`: Độ dài <= value

---

## 🔧 Setup n8n Workflow

### Workflow 1: Nhận webhook từ Laravel và xử lý

#### Bước 1: Tạo Webhook Trigger

1. Trong n8n, tạo workflow mới
2. Thêm node **Webhook**
3. Cấu hình:
   - **HTTP Method**: POST
   - **Path**: `/property-review` (hoặc tùy chọn)
   - **Response Mode**: Respond to Webhook
   - Lưu lại **Webhook URL**

4. Copy Webhook URL và dán vào `.env`:
   ```
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/property-review
   ```

#### Bước 2: Xử lý dữ liệu

**Node: Function** - Parse dữ liệu từ Laravel

```javascript
// Lấy dữ liệu từ webhook
const property = $json.body.property;
const event = $json.body.event;

// Validate webhook secret
const expectedSecret = 'your-secret-key-change-this'; // Phải khớp với MODERATION_WEBHOOK_SECRET
const receivedSecret = $json.body.webhook_secret;

if (receivedSecret !== expectedSecret) {
  throw new Error('Invalid webhook secret');
}

// Trả về dữ liệu để các node tiếp theo xử lý
return {
  property_id: property.id,
  title: property.title,
  description: property.description,
  price: property.price,
  area: property.area,
  type: property.type,
  address: property.address,
  user_id: property.user_id,
  created_at: property.created_at,
};
```

#### Bước 3: Áp dụng Rules

**Node: IF** - Kiểm tra giá tối thiểu

```javascript
// Condition: property.price >= 1000000
$json.price >= 1000000
```

**Node: IF** - Kiểm tra tiêu đề không rỗng

```javascript
// Condition: property.title.length >= 10
$json.title.length >= 10
```

**Node: IF** - Kiểm tra từ khóa spam

```javascript
// Condition: description không chứa spam keywords
const spamKeywords = ['spam', 'lừa đảo', 'fake'];
const description = ($json.description || '').toLowerCase();
const hasSpam = spamKeywords.some(keyword => description.includes(keyword));

!hasSpam // Trả về true nếu không có spam
```

#### Bước 4: Quyết định Duyệt/Từ chối

**Node: Switch** - Phân nhánh theo kết quả

- **Route 1**: Tất cả rules pass → Duyệt
- **Route 2**: Có rule fail → Từ chối

#### Bước 5: Gửi phản hồi về Laravel

**Node: HTTP Request** - Gửi kết quả về Laravel

**Cấu hình cho APPROVE:**
- **Method**: POST
- **URL**: `http://your-laravel-app.com/api/webhook/n8n`
- **Body (JSON)**:
```json
{
  "property_id": {{ $json.property_id }},
  "status": "approved",
  "reason": "Tự động duyệt - Tin đăng đáp ứng tất cả điều kiện",
  "webhook_secret": "your-secret-key-change-this"
}
```

**Cấu hình cho REJECT:**
- **Method**: POST
- **URL**: `http://your-laravel-app.com/api/webhook/n8n`
- **Body (JSON)**:
```json
{
  "property_id": {{ $json.property_id }},
  "status": "rejected",
  "reason": "Giá cho thuê quá thấp (dưới 1 triệu)",
  "webhook_secret": "your-secret-key-change-this"
}
```

#### Bước 6: Response cho Webhook Trigger

**Node: Respond to Webhook**

```javascript
return {
  success: true,
  message: "Webhook processed successfully",
  property_id: $json.property_id,
  status: $json.status || "pending"
};
```

---

### Workflow 2: Polling (Lấy tin chờ duyệt định kỳ)

Nếu bạn muốn n8n tự động lấy tin chờ duyệt thay vì chờ webhook:

#### Bước 1: Schedule Trigger

1. Thêm node **Cron**
2. Cấu hình: Chạy mỗi 5 phút (hoặc tùy chọn)
   ```
   0 */5 * * * *
   ```

#### Bước 2: Lấy danh sách tin chờ duyệt

**Node: HTTP Request**

- **Method**: GET
- **URL**: `http://your-laravel-app.com/api/webhook/pending-properties?secret=your-secret-key-change-this&limit=10`

#### Bước 3: Loop qua từng tin

**Node: Split In Batches** hoặc **Loop Over Items**

Với mỗi tin, áp dụng workflow tương tự Workflow 1.

---

## 📐 Các luật kiểm duyệt mẫu

### Luật 1: Giá hợp lý
```javascript
// Giá từ 1 triệu đến 1 tỷ
const minPrice = 1000000;
const maxPrice = 1000000000;
return property.price >= minPrice && property.price <= maxPrice;
```

### Luật 2: Tiêu đề đầy đủ
```javascript
// Tiêu đề ít nhất 10 ký tự
return property.title && property.title.length >= 10;
```

### Luật 3: Mô tả chi tiết
```javascript
// Mô tả ít nhất 20 ký tự
return property.description && property.description.length >= 20;
```

### Luật 4: Chặn từ khóa spam
```javascript
const spamKeywords = ['spam', 'lừa đảo', 'fake', 'scam'];
const text = (property.title + ' ' + property.description).toLowerCase();
return !spamKeywords.some(keyword => text.includes(keyword));
```

### Luật 5: Địa chỉ hợp lệ
```javascript
// Địa chỉ phải có "Quận" hoặc "Huyện" hoặc tên thành phố
const validAddressPatterns = ['Quận', 'Huyện', 'TP.', 'Thành phố'];
return validAddressPatterns.some(pattern => 
  property.address.includes(pattern)
);
```

### Luật 6: Kiểm tra lặp lại (Duplicate check)
```javascript
// So sánh với các tin đã duyệt (nếu có API)
// Nếu tiêu đề và địa chỉ giống > 80% → Reject
```

---

## 🧪 Test và Debug

### Test 1: Test Webhook từ Laravel đến n8n

**Sử dụng cURL:**
```bash
curl -X POST https://your-laravel-app.com/dang-tin \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cho thuê mặt bằng văn phòng",
    "type": "Văn phòng",
    "price": 15000000,
    "area": 100,
    "address": "123 Nguyễn Huệ, Quận 1",
    "description": "Mặt bằng rộng rãi, thoáng mát"
  }'
```

**Kiểm tra:**
1. Xem log n8n → Webhook có nhận được dữ liệu?
2. Xem log Laravel (`storage/logs/laravel.log`) → Webhook có được gửi?

### Test 2: Test Response từ n8n về Laravel

**Sử dụng cURL:**
```bash
curl -X POST http://your-laravel-app.com/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "status": "approved",
    "reason": "Test approval",
    "webhook_secret": "your-secret-key-change-this"
  }'
```

**Kiểm tra:**
1. Database → Property status đã thay đổi?
2. PropertyHistory → Có bản ghi mới?

### Test 3: Test Validation

**Test thiếu secret:**
```bash
curl -X POST http://your-laravel-app.com/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "status": "approved"
  }'
```
→ Kỳ vọng: 401 Unauthorized

**Test sai secret:**
```bash
curl -X POST http://your-laravel-app.com/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "status": "approved",
    "webhook_secret": "wrong-secret"
  }'
```
→ Kỳ vọng: 401 Unauthorized

**Test status không hợp lệ:**
```bash
curl -X POST http://your-laravel-app.com/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "status": "invalid",
    "webhook_secret": "your-secret-key-change-this"
  }'
```
→ Kỳ vọng: 422 Validation Error

### Debug trong n8n

1. **Xem Execution Log**: Click vào mỗi node → Xem output
2. **Sử dụng Debug mode**: Bật "Execute Workflow" → Xem từng bước
3. **Thêm node Set** để log dữ liệu giữa các bước

### Debug trong Laravel

**Xem log:**
```bash
tail -f storage/logs/laravel.log
```

**Tìm webhook logs:**
```bash
grep "N8N" storage/logs/laravel.log
```

---

## 📊 Workflow Diagram

```
┌─────────────┐
│   Laravel   │
│  New Post   │
└──────┬──────┘
       │ POST webhook
       ▼
┌─────────────┐
│  n8n Webhook│
│   Trigger   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Function  │
│ Parse Data  │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│  Rule Check │──────│   Switch    │
│    (IF)     │      │  (Route)    │
└─────────────┘      └──────┬──────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
         ┌───────────┐         ┌───────────┐
         │  Approve  │         │  Reject   │
         └─────┬─────┘         └─────┬─────┘
               │                     │
               └──────────┬──────────┘
                          │ POST response
                          ▼
                   ┌─────────────┐
                   │   Laravel   │
                   │   Webhook   │
                   │   Handler   │
                   └─────────────┘
```

---

## 🔐 Bảo mật

1. **Webhook Secret**: Luôn sử dụng secret key để xác thực
2. **HTTPS**: Sử dụng HTTPS cho webhook URLs
3. **Rate Limiting**: N8N có thể rate limit để tránh spam
4. **IP Whitelist**: (Tùy chọn) Chỉ cho phép IP của n8n

---

## 🚀 Production Checklist

- [ ] Đã cấu hình `N8N_WEBHOOK_URL` trong `.env`
- [ ] Đã đặt `MODERATION_WEBHOOK_SECRET` an toàn
- [ ] Đã test webhook từ Laravel → n8n
- [ ] Đã test response từ n8n → Laravel
- [ ] Đã cấu hình rules trong n8n
- [ ] Đã test với dữ liệu thực tế
- [ ] Đã monitor logs để đảm bảo hoạt động ổn định
- [ ] Đã có backup plan nếu n8n down

---

## 📝 Ghi chú

- **Async Processing**: Webhook được gửi async, không block response
- **Error Handling**: Nếu n8n không phản hồi, tin vẫn ở trạng thái pending
- **Manual Override**: Admin vẫn có thể duyệt/từ chối thủ công
- **History Logging**: Mọi thay đổi đều được ghi vào PropertyHistory

---

**Chúc bạn tích hợp thành công! 🎉**
