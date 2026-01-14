// ================== VIP MODULE ==================
// Quản lý VIP và tích hợp PayOS (demo)

// ================== VIP PACKAGES ==================
const VIP_PACKAGES = [
    {
        id: 'vip_1_month',
        name: 'VIP 1 tháng',
        duration: 1, // tháng
        price: 99000,
        originalPrice: 99000,
        discount: 0,
        popular: false,
        description: 'Phù hợp để thử nghiệm'
    },
    {
        id: 'vip_3_months',
        name: 'VIP 3 tháng',
        duration: 3,
        price: 249000,
        originalPrice: 297000,
        discount: 16,
        popular: true,
        description: 'Tiết kiệm 16% - Gói phổ biến nhất'
    },
    {
        id: 'vip_6_months',
        name: 'VIP 6 tháng',
        duration: 6,
        price: 449000,
        originalPrice: 594000,
        discount: 24,
        popular: false,
        description: 'Tiết kiệm 24%'
    },
    {
        id: 'vip_12_months',
        name: 'VIP 1 năm',
        duration: 12,
        price: 799000,
        originalPrice: 1188000,
        discount: 33,
        popular: false,
        description: 'Tiết kiệm 33% - Giá tốt nhất'
    }
];

// ================== CHECK VIP STATUS ==================
function checkVipStatus() {
    const user = getCurrentUser();
    if (!user) return { isVip: false, daysLeft: 0, expired: true };
    
    if (!user.vipStatus || !user.vipExpiry) {
        return { isVip: false, daysLeft: 0, expired: true };
    }
    
    const expiryDate = new Date(user.vipExpiry);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
        // VIP đã hết hạn
        return { isVip: false, daysLeft: 0, expired: true };
    }
    
    return {
        isVip: true,
        daysLeft: daysLeft,
        expired: false,
        expiryDate: expiryDate
    };
}

// ================== PURCHASE VIP ==================
function purchaseVip(packageId) {
    const user = getCurrentUser();
    if (!user) {
        return {
            success: false,
            message: 'Bạn cần đăng nhập để mua VIP.'
        };
    }
    
    const vipPackage = VIP_PACKAGES.find(pkg => pkg.id === packageId);
    if (!vipPackage) {
        return {
            success: false,
            message: 'Gói VIP không hợp lệ.'
        };
    }
    
    // Tạo order code (demo)
    const orderCode = Date.now();
    
    return {
        success: true,
        orderCode: orderCode,
        package: vipPackage,
        user: user
    };
}

// ================== ACTIVATE VIP ==================
function activateVip(packageId, orderCode) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return {
                success: false,
                message: 'Bạn chưa đăng nhập.'
            };
        }
        
        const vipPackage = VIP_PACKAGES.find(pkg => pkg.id === packageId);
        if (!vipPackage) {
            return {
                success: false,
                message: 'Gói VIP không hợp lệ.'
            };
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex === -1) {
            return {
                success: false,
                message: 'Không tìm thấy tài khoản.'
            };
        }
        
        // Tính ngày hết hạn
        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setMonth(expiryDate.getMonth() + vipPackage.duration);
        
        // Nếu đã có VIP và chưa hết hạn, cộng thêm vào ngày hết hạn hiện tại
        if (users[userIndex].vipStatus && users[userIndex].vipExpiry) {
            const currentExpiry = new Date(users[userIndex].vipExpiry);
            if (currentExpiry > now) {
                expiryDate.setTime(currentExpiry.getTime());
                expiryDate.setMonth(expiryDate.getMonth() + vipPackage.duration);
            }
        }
        
        // Cập nhật VIP status
        users[userIndex].vipStatus = true;
        users[userIndex].vipExpiry = expiryDate.toISOString();
        
        // Lưu lịch sử giao dịch
        if (!users[userIndex].transactions) {
            users[userIndex].transactions = [];
        }
        
        users[userIndex].transactions.push({
            id: 'txn_' + Date.now(),
            orderCode: orderCode,
            packageId: packageId,
            packageName: vipPackage.name,
            amount: vipPackage.price,
            status: 'completed',
            createdAt: new Date().toISOString(),
            expiryDate: expiryDate.toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Cập nhật currentUser
        const updatedUser = users[userIndex];
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return {
            success: true,
            message: `Kích hoạt VIP thành công! VIP của bạn sẽ hết hạn vào ${expiryDate.toLocaleDateString('vi-VN')}`,
            user: updatedUser,
            expiryDate: expiryDate
        };
        
    } catch (error) {
        console.error('Lỗi kích hoạt VIP:', error);
        return {
            success: false,
            message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
        };
    }
}

// ================== GET TRANSACTION HISTORY ==================
function getTransactionHistory() {
    const user = getCurrentUser();
    if (!user) return [];
    
    return user.transactions || [];
}

// ================== FORMAT CURRENCY ==================
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ================== FORMAT DATE ==================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
