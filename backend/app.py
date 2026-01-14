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


if __name__ == "__main__":
    # Chạy backend: http://localhost:5000
    app.run(host="0.0.0.0", port=5000, debug=True)

