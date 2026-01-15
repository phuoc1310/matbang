import os

from flask import Flask, request, jsonify
from dotenv import load_dotenv
from payos import PayOS
from payos.types import CreatePaymentLinkRequest
from flask_cors import CORS


load_dotenv()

PAYOS_CLIENT_ID = os.getenv("PAYOS_CLIENT_ID")
PAYOS_API_KEY = os.getenv("PAYOS_API_KEY")
PAYOS_CHECKSUM_KEY = os.getenv("PAYOS_CHECKSUM_KEY")

# Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# URL public mà PayOS sẽ redirect về sau thanh toán
# Ví dụ: đang chạy frontend bằng live-server trên cổng 5500
FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL",
    "http://localhost:5500/web_HTTM-main",
)

if not (PAYOS_CLIENT_ID and PAYOS_API_KEY and PAYOS_CHECKSUM_KEY):
    print("⚠️ Thiếu PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY trong .env")

payos = PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY)

app = Flask(__name__)

# Cho phép CORS để frontend (ở origin khác) gọi được API
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/create-payment-link", methods=["POST"])
def create_payment_link():
    """
    API backend để tạo link thanh toán PayOS.

    Body JSON từ frontend (ví dụ):
    {
      "orderCode": 1768322077952,
      "amount": 249000,
      "description": "Thanh toán VIP 3 tháng - SpaceRent",
      "items": [
        { "name": "VIP 3 tháng", "quantity": 1, "price": 249000 }
      ]
    }
    """
    data = request.get_json(force=True) or {}

    order_code = data.get("orderCode")
    amount = data.get("amount")
    description = data.get("description") or "Thanh toán đơn hàng SpaceRent"
    items = data.get("items") or [
        {
            "name": "Gói VIP SpaceRent",
            "quantity": 1,
            "price": amount,
        }
    ]

    if not order_code or not amount:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Thiếu orderCode hoặc amount",
                }
            ),
            400,
        )

    # PayOS sẽ redirect về các URL này sau khi thanh toán
    return_url = f"{FRONTEND_BASE_URL}/payos-success.html?orderCode={order_code}"
    cancel_url = f"{FRONTEND_BASE_URL}/payos-cancel.html?orderCode={order_code}"

    try:
        # Tạo request theo đúng kiểu của SDK payOS Python
        req = CreatePaymentLinkRequest(
            order_code=int(order_code),
            amount=int(amount),
            description=description,
            items=items,
            return_url=return_url,
            cancel_url=cancel_url,
        )

        # Gọi SDK để tạo payment link
        payment_link = payos.payment_requests.create(req)

        # Trả về cho frontend thông tin quan trọng (checkout_url,...)
        return jsonify(
            {
                "success": True,
                "data": {
                    "checkoutUrl": payment_link.checkout_url,
                    "orderCode": payment_link.order_code,
                    "amount": payment_link.amount,
                    "status": payment_link.status,
                },
            }
        )
    except Exception as e:
        print("❌ Error create_payment_link:", e)
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )


@app.route("/api/payos/webhook", methods=["POST"])
def payos_webhook():
    """
    Webhook (tuỳ chọn) – để PayOS chủ động bắn trạng thái thanh toán về backend.
    Với đồ án hiện tại bạn có thể chỉ log ra, chưa cần xử lý DB thật.
    """
    payload = request.get_json(force=True) or {}
    print("📩 PayOS webhook payload:", payload)

    # TODO: verify chữ ký và cập nhật trạng thái đơn hàng / VIP trong DB thật

    return jsonify({"success": True})


@app.route("/api/chatbot/gemini", methods=["POST"])
def chatbot_gemini():
    """
    API backend để gọi Gemini AI cho chatbot.
    API key được lưu trong .env để bảo mật.
    
    Body JSON từ frontend:
    {
      "message": "Câu hỏi của người dùng",
      "context": {
        "user": {...},
        "page": "...",
        "timestamp": "..."
      }
    }
    """
    if not GEMINI_API_KEY:
        return (
            jsonify({
                "success": False,
                "message": "Gemini API Key chưa được cấu hình trong .env"
            }),
            500,
        )
    
    data = request.get_json(force=True) or {}
    user_message = data.get("message", "")
    context = data.get("context", {})
    
    if not user_message:
        return (
            jsonify({
                "success": False,
                "message": "Thiếu message"
            }),
            400,
        )
    
    try:
        import requests
        
        # System prompt
        system_prompt = """Bạn là trợ lý AI thân thiện của SpaceRent - nền tảng kết nối không gian kinh doanh hàng đầu Việt Nam.

Nhiệm vụ của bạn:
- Trả lời các câu hỏi về tìm kiếm mặt bằng, đăng tin cho thuê, gói VIP
- Hướng dẫn người dùng sử dụng website
- Tư vấn về thuê/cho thuê mặt bằng
- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện và hữu ích

Thông tin về SpaceRent:
- Gói VIP: 1 tháng (99k), 3 tháng (249k), 6 tháng (449k), 12 tháng (799k)
- Miễn phí: Đăng ký, đăng tin, tìm kiếm, xem chi tiết
- Email hỗ trợ: contact@spacerent.vn

Hãy trả lời câu hỏi của người dùng một cách tự nhiên và hữu ích."""
        
        full_prompt = f"{system_prompt}\n\nNgười dùng hỏi: {user_message}"
        
        # Gọi Gemini API
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
        
        response = requests.post(
            url,
            json={
                "contents": [{
                    "parts": [{
                        "text": full_prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                }
            },
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            error_data = response.json() if response.content else {}
            return (
                jsonify({
                    "success": False,
                    "message": f"Gemini API error: {error_data.get('error', {}).get('message', response.status_code)}"
                }),
                500,
            )
        
        result = response.json()
        
        # Extract text từ response
        if result.get("candidates") and result["candidates"][0].get("content"):
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({
                "success": True,
                "response": text.strip()
            })
        else:
            return (
                jsonify({
                    "success": False,
                    "message": "Không nhận được phản hồi từ Gemini API"
                }),
                500,
            )
            
    except requests.exceptions.Timeout:
        return (
            jsonify({
                "success": False,
                "message": "Timeout khi gọi Gemini API"
            }),
            500,
        )
    except Exception as e:
        print("❌ Error chatbot_gemini:", e)
        return (
            jsonify({
                "success": False,
                "message": str(e)
            }),
            500,
        )


if __name__ == "__main__":
    # Chạy backend: http://localhost:5000
    app.run(host="0.0.0.0", port=5000, debug=True)

