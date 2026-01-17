// ================== PAYOS CONFIG CHECKER ==================
// File này để kiểm tra và debug cấu hình PayOS

// Hàm đợi PayOS SDK load - Kiểm tra nhiều cách
function waitForPayOSSDK(callback, maxAttempts = 50) {
    // Kiểm tra nhiều cách PayOS có thể được expose
    const isPayOSAvailable = typeof PayOS !== 'undefined' || 
                             typeof window.PayOS !== 'undefined' ||
                             window.PayOS !== undefined;
    
    if (isPayOSAvailable) {
        // Nếu có PayOS, gán vào global scope để dùng dễ dàng
        if (typeof PayOS === 'undefined' && typeof window.PayOS !== 'undefined') {
            window.PayOS = window.PayOS;
        }
        callback(true);
    } else if (maxAttempts > 0) {
        setTimeout(() => waitForPayOSSDK(callback, maxAttempts - 1), 200);
    } else {
        callback(false); // Timeout sau 10 giây
    }
}

// Chạy script này trong Console để kiểm tra
function checkPayOSSetup() {
    console.log('=== KIỂM TRA CẤU HÌNH PAYOS ===\n');
    
    // Đợi PayOS SDK load
    waitForPayOSSDK((sdkReady) => {
        // Kiểm tra PayOS SDK - kiểm tra nhiều cách
        const payosAvailable = typeof PayOS !== 'undefined' || 
                               typeof window.PayOS !== 'undefined';
        
        if (!sdkReady || !payosAvailable) {
            console.error('❌ PayOS SDK chưa được load!');
            console.log('\n📋 Kiểm tra:');
            console.log('- typeof PayOS:', typeof PayOS);
            console.log('- typeof window.PayOS:', typeof window.PayOS);
            console.log('- window.PayOS:', window.PayOS);
            console.log('\n🔍 Có thể do:');
            console.log('1. Script chưa được thêm vào HTML');
            console.log('2. CDN PayOS đang lỗi hoặc chậm');
            console.log('3. Đang chặn script từ CDN (adblocker, firewall)');
            console.log('4. PayOS SDK cần thời gian khởi tạo lâu hơn');
            console.log('\n💡 Thử:');
            console.log('- Kiểm tra Network tab xem script có load không');
            console.log('- Kiểm tra Console xem có lỗi gì không');
            console.log('- Chờ thêm vài giây rồi chạy lại checkPayOSSetup()');
            console.log('\n📝 Script cần thêm:');
            console.log('<script src="https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js"></script>');
            
            // Vẫn tiếp tục kiểm tra config để hiển thị demo mode
            checkPayOSConfigInternal();
            return;
        } else {
            console.log('✅ PayOS SDK đã được load và sẵn sàng');
        }
        
        // Tiếp tục kiểm tra config
        checkPayOSConfigInternal();
    });
}

function checkPayOSConfigInternal() {
    // Kiểm tra config
    if (typeof loadPayOSConfig === 'undefined') {
        console.error('❌ payos-demo.js chưa được load!');
        return;
    }
    
    const config = loadPayOSConfig();
    
    console.log('\n=== THÔNG TIN CẤU HÌNH ===');
    console.log('Client ID:', config.clientId ? '✅ ' + config.clientId.substring(0, 20) + '...' : '❌ Chưa cấu hình');
    console.log('API Key:', config.apiKey ? '✅ ' + config.apiKey.substring(0, 20) + '...' : '❌ Chưa cấu hình');
    console.log('Checksum Key:', config.checksumKey ? '✅ ' + config.checksumKey.substring(0, 20) + '...' : '❌ Chưa cấu hình');
    console.log('Use Real API:', config.useRealAPI ? '✅ Đã bật' : '❌ Chưa bật');
    
    const hasConfig = config.clientId && config.apiKey && config.checksumKey;
    const isRealAPI = hasConfig && config.useRealAPI;
    
    console.log('\n=== KẾT QUẢ ===');
    if (isRealAPI) {
        console.log('%c✅ PayOS đã được cấu hình đầy đủ - Sử dụng PayOS API THẬT', 'color: green; font-weight: bold;');
        
        // Test khởi tạo PayOS
        try {
            // Sử dụng PayOS hoặc window.PayOS
            const PayOSConstructor = typeof PayOS !== 'undefined' ? PayOS : window.PayOS;
            const payos = new PayOSConstructor(config.clientId, config.apiKey, config.checksumKey);
            console.log('✅ PayOS instance đã được khởi tạo thành công');
        } catch (error) {
            console.error('❌ Lỗi khởi tạo PayOS:', error.message);
            console.error('Chi tiết lỗi:', error);
            console.log('\n💡 Kiểm tra:');
            console.log('- Client ID, API Key, Checksum Key có đúng không?');
            console.log('- Credentials có hợp lệ từ PayOS Dashboard không?');
        }
    } else if (hasConfig && !config.useRealAPI) {
        console.warn('%c⚠️ PayOS đã có credentials nhưng chưa BẬT chế độ thật', 'color: orange; font-weight: bold;');
        console.log('Để bật, chạy lệnh:');
        console.log('%cenablePayOSRealAPI()', 'background: #f0f0f0; padding: 5px;');
        console.log('Hoặc:');
        console.log('%clocalStorage.setItem("payos_use_real_api", "true");', 'background: #f0f0f0; padding: 5px;');
        console.log('Sau đó làm mới trang (F5)');
    } else {
        console.warn('%c⚠️ PayOS chưa được cấu hình đầy đủ - Đang dùng DEMO MODE', 'color: orange; font-weight: bold;');
        console.log('\nĐể cấu hình PayOS, chạy lệnh:');
        console.log('%cconfigurePayOS("YOUR_CLIENT_ID", "YOUR_API_KEY", "YOUR_CHECKSUM_KEY", true);', 'background: #f0f0f0; padding: 5px;');
    }
}

// Hàm helper để kiểm tra PayOS SDK trực tiếp (chạy từ console)
function testPayOSSDK() {
    console.log('=== KIỂM TRA PAYOS SDK ===\n');
    console.log('1. typeof PayOS:', typeof PayOS);
    console.log('2. typeof window.PayOS:', typeof window.PayOS);
    console.log('3. window.PayOS:', window.PayOS);
    console.log('4. PayOS:', PayOS);
    
    // Kiểm tra script tag
    const scripts = Array.from(document.querySelectorAll('script[src*="payos"]'));
    console.log('\n5. Script tags:', scripts.length > 0 ? '✅ Đã tìm thấy' : '❌ Không tìm thấy');
    scripts.forEach((script, idx) => {
        console.log(`   Script ${idx + 1}:`, script.src);
        console.log(`   - Loaded:`, script.complete || script.readyState === 'complete' || script.readyState === 'loaded');
    });
    
    // Kiểm tra Network
    console.log('\n💡 Để kiểm tra chi tiết:');
    console.log('- Mở Network tab (F12 > Network)');
    console.log('- Tìm file "payos-initialize.js"');
    console.log('- Xem Status code (phải là 200)');
    console.log('- Xem Response preview để đảm bảo script load đúng');
    
    return typeof PayOS !== 'undefined' || typeof window.PayOS !== 'undefined';
}

// Hàm helper để bật PayOS dễ dàng
function enablePayOSRealAPI() {
    localStorage.setItem('payos_use_real_api', 'true');
    console.log('✅ Đã bật PayOS Real API');
    console.log('Vui lòng làm mới trang (F5) để áp dụng thay đổi');
    return true;
}

// Hàm helper để tắt PayOS (dùng demo mode)
function disablePayOSRealAPI() {
    localStorage.setItem('payos_use_real_api', 'false');
    console.log('✅ Đã tắt PayOS Real API - Sử dụng Demo Mode');
    console.log('Vui lòng làm mới trang (F5) để áp dụng thay đổi');
    return true;
}

// Auto run when load
if (typeof loadPayOSConfig !== 'undefined') {
    // Chỉ log khi load page
    if (window.location.pathname.includes('taikhoan.html')) {
        setTimeout(() => {
            console.log('%c💡 Tip: Chạy checkPayOSSetup() để kiểm tra cấu hình PayOS', 'color: #137fec; font-size: 12px;');
            console.log('%c💡 Hoặc chạy testPayOSSDK() để kiểm tra PayOS SDK trực tiếp', 'color: #137fec; font-size: 12px;');
            console.log('%c💡 Hoặc chạy enablePayOSRealAPI() để bật PayOS thật', 'color: #137fec; font-size: 12px;');
        }, 1000);
    }
}
