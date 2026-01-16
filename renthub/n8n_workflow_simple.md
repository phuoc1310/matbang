# 🎯 N8N WORKFLOW ĐƠN GIẢN - HƯỚNG DẪN TỪNG BƯỚC

## 📝 Workflow đơn giản nhất (5 nodes)

### Node 1: Webhook Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `property-review`
- **Response Mode**: Respond to Webhook

### Node 2: Parse & Validate
- **Type**: Code
- **Code**:
```javascript
const body = $input.item.json.body || $input.item.json;
const property = body.property;

// Validate secret
if (body.webhook_secret !== 'your-secret-key-change-this') {
  throw new Error('Invalid secret');
}

return {
  id: property.id,
  title: property.title,
  price: property.price,
  description: property.description || ''
};
```

### Node 3: Check Rules
- **Type**: Code
- **Code**:
```javascript
const data = $input.item.json;

// Rule 1: Giá >= 1 triệu
const priceOk = data.price >= 1000000;

// Rule 2: Tiêu đề >= 10 ký tự
const titleOk = (data.title || '').length >= 10;

// Rule 3: Mô tả >= 20 ký tự
const descOk = (data.description || '').length >= 20;

// Rule 4: Không có spam
const spamKeywords = ['spam', 'lừa đảo', 'fake'];
const text = ((data.title || '') + ' ' + (data.description || '')).toLowerCase();
const noSpam = !spamKeywords.some(k => text.includes(k));

const allPassed = priceOk && titleOk && descOk && noSpam;

return {
  property_id: data.id,
  status: allPassed ? 'approved' : 'rejected',
  reason: allPassed 
    ? 'Tự động duyệt - Đáp ứng tất cả điều kiện'
    : 'Tự động từ chối - Vi phạm điều kiện'
};
```

### Node 4: Send to Laravel
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://127.0.0.1:8000/api/webhook/n8n`
- **Body (JSON)**:
```json
{
  "property_id": {{ $json.property_id }},
  "status": "{{ $json.status }}",
  "reason": "{{ $json.reason }}",
  "webhook_secret": "your-secret-key-change-this"
}
```

### Node 5: Respond
- **Type**: Respond to Webhook
- **Response**: 
```json
{
  "success": true,
  "property_id": {{ $('Check Rules').item.json.property_id }}
}
```

---

## 🔗 Kết nối

```
Webhook → Parse & Validate → Check Rules → Send to Laravel → Respond
```

---

## ✅ Test

1. **Activate workflow** trong n8n
2. **Đăng tin mới** tại Laravel
3. **Kiểm tra** n8n execution log
4. **Kiểm tra** Laravel log
5. **Kiểm tra** database - property status đã thay đổi?
