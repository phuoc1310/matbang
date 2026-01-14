// ================== PAYOS MODULE ==================
// Tích hợp PayOS API thật

// ================== PAYOS CONFIG ==================
// LƯU Ý: Thay thế các giá trị sau bằng thông tin từ PayOS Dashboard
// https://pay.payos.vn/web/developers/information

// Hàm load config từ localStorage (frontend)
function loadPayOSConfig() {
    const clientId = localStorage.getItem('payos_client_id') || 'e364be62-941b-4377-9d0a-e2c95b1a6599';
    const apiKey = localStorage.getItem('payos_api_key') || '88412370-48f8-4ffa-9124-b6ddfb9a400e';
    const checksumKey = localStorage.getItem('payos_checksum_key') || 'db2e3a7e1d26007a3e27aa11633e2d73d0f810dcf53b599b4a2a884ecf1f0cd5';
    
    // Nếu đã có credentials nhưng useRealAPI chưa được set, tự động bật
    let useRealAPI = localStorage.getItem('payos_use_real_api');
    if (useRealAPI === null && clientId && apiKey && checksumKey) {
        // Tự động bật PayOS nếu đã có credentials
        localStorage.setItem('payos_use_real_api', 'true');
        useRealAPI = 'true';
        console.log('Đã tự động bật PayOS API vì đã có credentials');
    }
    
    return {
        clientId: clientId,
        apiKey: apiKey,
        checksumKey: checksumKey,
        useRealAPI: useRealAPI === 'true'
    };
}

// Khởi tạo config
let PAYOS_CONFIG = loadPayOSConfig();

// Hàm lấy URL backend Python (nếu có). Có thể thay đổi runtime qua localStorage.
// Ví dụ: localStorage.setItem('payos_backend_url', 'http://localhost:5000');
function getBackendUrl() {
    try {
        return localStorage.getItem('payos_backend_url') || 'http://localhost:5000';
    } catch (e) {
        console.warn('Không thể đọc payos_backend_url từ localStorage, dùng mặc định http://localhost:5000');
        return 'http://localhost:5000';
    }
}

// ================== INITIALIZE PAYOS ==================
let payosInstance = null;

function initPayOS() {
    // Kiểm tra xem PayOS SDK đã được load chưa - kiểm tra an toàn, tránh ReferenceError
    let PayOSConstructor = typeof PayOS !== 'undefined' ? PayOS : undefined;

    if (!PayOSConstructor) {
        // Thử kiểm tra window.PayOS
        if (typeof window !== 'undefined' && typeof window.PayOS !== 'undefined') {
            PayOSConstructor = window.PayOS;
        }
    }

    // Nếu sau tất cả vẫn không có constructor => bỏ qua SDK, để fallback sang backend / demo
    if (!PayOSConstructor) {
        console.warn('⚠️ PayOS SDK không sẵn sàng. Bỏ qua SDK và dùng backend / demo mode.');
        return null;
    }
    
    try {
        payosInstance = new PayOSConstructor(
            PAYOS_CONFIG.clientId,
            PAYOS_CONFIG.apiKey,
            PAYOS_CONFIG.checksumKey
        );
        return payosInstance;
    } catch (error) {
        console.error('Lỗi khởi tạo PayOS:', error);
        console.error('Chi tiết lỗi:', error.message, error.stack);
        return null;
    }
}

// ================== CREATE PAYMENT LINK ==================
async function createPayOSPaymentLink(orderData) {
    // ƯU TIÊN: gọi backend Python nếu đã cấu hình
    const backendUrl = getBackendUrl();

    if (backendUrl) {
        try {
            console.log('🔄 Gọi backend Python tạo payment link...', {
                backendUrl,
                orderData
            });

            const response = await fetch(`${backendUrl}/api/create-payment-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderCode: orderData.orderCode,
                    amount: orderData.amount,
                    description: orderData.description || `Thanh toán gói VIP - SpaceRent`,
                    items: orderData.items || undefined
                })
            });

            const result = await response.json();

            if (response.ok && result.success && result.data && result.data.checkoutUrl) {
                console.log('✅ Backend tạo payment link thành công:', result.data);
                return {
                    success: true,
                    checkoutUrl: result.data.checkoutUrl,
                    orderCode: orderData.orderCode
                };
            } else {
                console.warn('⚠️ Backend tạo link thất bại, fallback sang frontend PayOS/demo.', result);
            }
        } catch (err) {
            console.error('❌ Lỗi gọi backend Python:', err);
            console.warn('⚠️ Fallback sang frontend PayOS/demo.');
        }
    }

    // Reload config từ localStorage để đảm bảo có giá trị mới nhất
    PAYOS_CONFIG = loadPayOSConfig();
    
    console.log('PayOS Config:', {
        hasClientId: !!PAYOS_CONFIG.clientId,
        hasApiKey: !!PAYOS_CONFIG.apiKey,
        hasChecksumKey: !!PAYOS_CONFIG.checksumKey,
        useRealAPI: PAYOS_CONFIG.useRealAPI,
        clientIdPreview: PAYOS_CONFIG.clientId ? PAYOS_CONFIG.clientId.substring(0, 8) + '...' : 'null'
    });
    
    // Kiểm tra xem có cấu hình PayOS thật chưa
    const hasRealConfig = PAYOS_CONFIG.clientId && 
                          PAYOS_CONFIG.apiKey && 
                          PAYOS_CONFIG.checksumKey &&
                          PAYOS_CONFIG.useRealAPI;
    
    // Nếu chưa enable PayOS thật hoặc chưa có config đầy đủ, dùng demo mode
    if (!hasRealConfig) {
        const missing = [];
        if (!PAYOS_CONFIG.clientId) missing.push('Client ID');
        if (!PAYOS_CONFIG.apiKey) missing.push('API Key');
        if (!PAYOS_CONFIG.checksumKey) missing.push('Checksum Key');
        if (!PAYOS_CONFIG.useRealAPI) missing.push('useRealAPI chưa bật');
        
        console.warn('⚠️ PayOS chưa được cấu hình đầy đủ. Sử dụng DEMO MODE.');
        console.warn('Thiếu: ' + missing.join(', '));
        console.warn('Để dùng PayOS thật, chạy: localStorage.setItem("payos_use_real_api", "true")');
        return createPayOSPaymentLinkDemo(orderData);
    }
    
    console.log('✅ Đang sử dụng PayOS API THẬT...');
    
    try {
        // Khởi tạo PayOS nếu chưa có
        if (!payosInstance) {
            payosInstance = initPayOS();
            if (!payosInstance) {
                throw new Error('Không thể khởi tạo PayOS. Vui lòng kiểm tra cấu hình.');
            }
        }
        
        // Lấy thông tin gói VIP
        const vipPackage = VIP_PACKAGES.find(pkg => pkg.id === orderData.packageId);
        if (!vipPackage) {
            throw new Error('Gói VIP không hợp lệ.');
        }
        
        // Tạo base URL cho callback
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        
        // Tạo payment link với PayOS API
        const requestData = {
            orderCode: orderData.orderCode,
            amount: orderData.amount,
            description: `Thanh toán ${vipPackage.name} - SpaceRent`,
            items: [
                {
                    name: vipPackage.name,
                    quantity: 1,
                    price: orderData.amount
                }
            ],
            cancelUrl: `${baseUrl}payos-cancel.html?orderCode=${orderData.orderCode}`,
            returnUrl: `${baseUrl}payos-success.html?orderCode=${orderData.orderCode}`
        };
        
        console.log('Tạo payment link với PayOS API...', requestData);
        const paymentLinkData = await payosInstance.createPaymentLink(requestData);
        
        console.log('Payment link created:', paymentLinkData);
        
        return {
            success: true,
            checkoutUrl: paymentLinkData.checkoutUrl,
            orderCode: orderData.orderCode
        };
        
    } catch (error) {
        console.error('Lỗi tạo PayOS payment link:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            config: {
                clientId: PAYOS_CONFIG.clientId ? 'Set' : 'Not set',
                apiKey: PAYOS_CONFIG.apiKey ? 'Set' : 'Not set',
                checksumKey: PAYOS_CONFIG.checksumKey ? 'Set' : 'Not set'
            }
        });
        
        // Nếu lỗi khi tạo link, fallback về demo mode
        console.warn('PayOS API lỗi, chuyển sang demo mode...');
        return createPayOSPaymentLinkDemo(orderData);
    }
}

// ================== CREATE PAYMENT LINK (DEMO MODE) ==================
function createPayOSPaymentLinkDemo(orderData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const orderCode = orderData.orderCode;
                const amount = orderData.amount;
                const checkoutUrl = `payos-checkout.html?orderCode=${orderCode}&amount=${amount}&packageId=${orderData.packageId}`;
                
                resolve({
                    success: true,
                    checkoutUrl: checkoutUrl,
                    orderCode: orderCode
                });
            } catch (error) {
                resolve({
                    success: false,
                    message: 'Không thể tạo link thanh toán. Vui lòng thử lại.'
                });
            }
        }, 500);
    });
}

// ================== VERIFY PAYMENT ==================
async function verifyPayOSPayment(orderCode, status) {
    // Reload config
    PAYOS_CONFIG = loadPayOSConfig();
    
    const hasRealConfig = PAYOS_CONFIG.clientId && 
                          PAYOS_CONFIG.apiKey && 
                          PAYOS_CONFIG.checksumKey &&
                          PAYOS_CONFIG.useRealAPI;
    
    // Nếu dùng demo mode
    if (!hasRealConfig) {
        // Trong demo mode, chỉ thành công khi status === 'success'
        // KHÔNG dùng random để tránh kích hoạt VIP khi thất bại
        const isSuccess = status === 'success';
        return {
            success: isSuccess,
            orderCode: orderCode,
            status: isSuccess ? 'PAID' : 'CANCELLED',
            message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'
        };
    }
    
    // Verify với PayOS API thật qua SDK (chỉ khi SDK sẵn sàng)
    try {
        // Nếu SDK không có (PayOS undefined) thì coi như không verify được, tránh nổ lỗi
        if (typeof PayOS === 'undefined' && (typeof window === 'undefined' || typeof window.PayOS === 'undefined')) {
            console.warn('⚠️ PayOS SDK không sẵn sàng trong verifyPayOSPayment. Bỏ qua verify thật, xử lý như demo.');
            const isSuccess = status === 'success';
            return {
                success: isSuccess,
                orderCode: orderCode,
                status: isSuccess ? 'PAID' : 'CANCELLED',
                message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa được xác nhận (SDK thiếu)'
            };
        }

        if (!payosInstance) {
            payosInstance = initPayOS();
        }

        if (!payosInstance) {
            console.warn('⚠️ Không khởi tạo được PayOS instance. Bỏ qua verify thật, xử lý như demo.');
            const isSuccess = status === 'success';
            return {
                success: isSuccess,
                orderCode: orderCode,
                status: isSuccess ? 'PAID' : 'CANCELLED',
                message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa được xác nhận (không khởi tạo được SDK)'
            };
        }
        
        // Lấy thông tin payment từ PayOS
        const paymentInfo = await payosInstance.getPaymentLinkInformation(orderCode);
        
        // Kiểm tra trạng thái thanh toán
        if (paymentInfo.status === 'PAID') {
            return {
                success: true,
                orderCode: orderCode,
                status: 'PAID',
                message: 'Thanh toán thành công'
            };
        } else {
            return {
                success: false,
                orderCode: orderCode,
                status: paymentInfo.status || 'CANCELLED',
                message: 'Thanh toán chưa được xác nhận'
            };
        }
    } catch (error) {
        console.error('Lỗi verify payment:', error);
        return {
            success: false,
            orderCode: orderCode,
            status: 'ERROR',
            message: 'Không thể xác minh thanh toán. Vui lòng liên hệ hỗ trợ.'
        };
    }
}

// ================== HANDLE PAYMENT CALLBACK ==================
async function handlePayOSCallback(orderCode, status) {
    // Lấy thông tin order từ localStorage
    const orderData = JSON.parse(localStorage.getItem(`payos_order_${orderCode}`) || 'null');
    
    if (!orderData) {
        return {
            success: false,
            message: 'Không tìm thấy thông tin đơn hàng.'
        };
    }
    
    // Verify payment (với PayOS API thật nếu đã cấu hình)
    // LƯU Ý: Hàm này chỉ nên được gọi sau khi đã verify thành công
    // Đây là bước kích hoạt VIP, không phải verify
    const verification = await verifyPayOSPayment(orderCode, status);
    
    if (!verification.success) {
        // KHÔNG kích hoạt VIP nếu verify thất bại
        return {
            success: false,
            message: verification.message || 'Thanh toán chưa được xác nhận. VIP không được kích hoạt.'
        };
    }
    
    // Chỉ activate VIP khi verify thành công
    try {
        const result = activateVip(orderData.packageId, orderCode);
        
        // Xóa order data tạm sau khi kích hoạt thành công
        if (result.success) {
            localStorage.removeItem(`payos_order_${orderCode}`);
        }
        
        return result;
    } catch (error) {
        console.error('Lỗi kích hoạt VIP:', error);
        return {
            success: false,
            message: 'Đã xảy ra lỗi khi kích hoạt VIP. Vui lòng liên hệ hỗ trợ.'
        };
    }
}

// ================== CONFIGURE PAYOS ==================
// Hàm này để cấu hình PayOS credentials (có thể gọi từ admin panel)
function configurePayOS(clientId, apiKey, checksumKey, useRealAPI = true) {
    if (!clientId || !apiKey || !checksumKey) {
        return {
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin PayOS.'
        };
    }
    
    localStorage.setItem('payos_client_id', clientId);
    localStorage.setItem('payos_api_key', apiKey);
    localStorage.setItem('payos_checksum_key', checksumKey);
    localStorage.setItem('payos_use_real_api', useRealAPI.toString());
    
    // Reload config
    PAYOS_CONFIG = loadPayOSConfig();
    
    // Reset instance để khởi tạo lại với config mới
    payosInstance = null;
    
    return {
        success: true,
        message: 'Đã cấu hình PayOS thành công! Vui lòng làm mới trang để áp dụng thay đổi.'
    };
}

// ================== CHECK PAYOS CONFIG ==================
// Hàm kiểm tra trạng thái cấu hình PayOS
function checkPayOSConfig() {
    PAYOS_CONFIG = loadPayOSConfig();
    
    const hasConfig = PAYOS_CONFIG.clientId && 
                      PAYOS_CONFIG.apiKey && 
                      PAYOS_CONFIG.checksumKey;
    
    return {
        hasConfig: hasConfig,
        useRealAPI: PAYOS_CONFIG.useRealAPI,
        clientId: PAYOS_CONFIG.clientId ? 'Đã cấu hình' : 'Chưa cấu hình',
        apiKey: PAYOS_CONFIG.apiKey ? 'Đã cấu hình' : 'Chưa cấu hình',
        checksumKey: PAYOS_CONFIG.checksumKey ? 'Đã cấu hình' : 'Chưa cấu hình',
        mode: (hasConfig && PAYOS_CONFIG.useRealAPI) ? 'PayOS Thật' : 'Demo Mode'
    };
}
