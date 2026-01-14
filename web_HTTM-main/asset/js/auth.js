// ================== AUTHENTICATION MODULE ==================
// Quản lý đăng ký, đăng nhập, đăng xuất với localStorage

// ================== INITIALIZE USERS STORAGE ==================
function initUsersStorage() {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
  
  // Tự động tạo admin mặc định nếu chưa có admin nào
  // Gọi ở đây để đảm bảo admin luôn được tạo khi hệ thống khởi động
  try {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const hasAdmin = users.some(u => u.role === 'admin');
    
    if (!hasAdmin) {
      // Tạo admin mặc định
      const defaultAdmin = {
        id: 'admin_default_' + Date.now(),
        email: 'admin@spacerent.com',
        password: 'admin123', // Mật khẩu mặc định - nên đổi sau
        fullName: 'Quản trị viên',
        phone: '',
        role: 'admin',
        avatar: '',
        address: '',
        createdAt: new Date().toISOString(),
        verified: true,
        vipStatus: false,
        vipExpiry: null,
        savedListings: [],
        viewedListings: [],
        myListings: [],
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      };
      
      users.push(defaultAdmin);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Đã tạo tài khoản admin mặc định: admin@spacerent.com / admin123');
    }
  } catch (error) {
    console.error('Lỗi khi tạo admin mặc định:', error);
  }
}

// ================== VALIDATION ==================
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function validatePassword(password) {
  return password.length >= 6;
}

// ================== REGISTER ==================
function register(userData) {
  try {
    initUsersStorage();
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Kiểm tra email đã tồn tại chưa
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        message: 'Email này đã được sử dụng. Vui lòng dùng email khác.'
      };
    }
    
    // Validate dữ liệu
    if (!validateEmail(userData.email)) {
      return {
        success: false,
        message: 'Email không hợp lệ. Vui lòng nhập email đúng định dạng.'
      };
    }
    
    if (!validatePassword(userData.password)) {
      return {
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự.'
      };
    }
    
    if (userData.phone && !validatePhone(userData.phone)) {
      return {
        success: false,
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập 10-11 số.'
      };
    }
    
    // Validate role - chỉ cho phép 'nguoithue' hoặc 'chumattbang', không cho phép 'admin'
    const allowedRoles = ['nguoithue', 'chumattbang'];
    const userRole = userData.role || 'nguoithue';
    if (!allowedRoles.includes(userRole)) {
      return {
        success: false,
        message: 'Vai trò không hợp lệ. Vui lòng chọn lại.'
      };
    }
    
    // Tạo user mới
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email: userData.email.trim().toLowerCase(),
      password: userData.password, // Plain text cho demo
      fullName: userData.fullName || '',
      phone: userData.phone || '',
      role: userRole, // Chỉ 'nguoithue' hoặc 'chumattbang'
      avatar: '',
      address: userData.address || '',
      createdAt: new Date().toISOString(),
      verified: false,
      vipStatus: false,
      vipExpiry: null,
      savedListings: [], // Cho người thuê
      viewedListings: [], // Cho người thuê
      myListings: [], // Cho chủ mặt bằng
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };
    
    // Lưu vào danh sách users
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Tự động đăng nhập sau khi đăng ký
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return {
      success: true,
      message: 'Đăng ký thành công!',
      user: newUser
    };
    
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    };
  }
}

// ================== LOGIN ==================
function login(email, password) {
  try {
    initUsersStorage();
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Tìm user theo email
    const user = users.find(u => u.email === email.trim().toLowerCase());
    
    if (!user) {
      return {
        success: false,
        message: 'Email hoặc mật khẩu không đúng.'
      };
    }
    
    // Kiểm tra mật khẩu
    if (user.password !== password) {
      return {
        success: false,
        message: 'Email hoặc mật khẩu không đúng.'
      };
    }
    
    // Lưu current user
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return {
      success: true,
      message: 'Đăng nhập thành công!',
      user: user
    };
    
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    };
  }
}

// ================== LOGOUT ==================
function logout() {
  try {
    localStorage.removeItem('currentUser');
    return {
      success: true,
      message: 'Đăng xuất thành công!'
    };
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi đăng xuất.'
    };
  }
}

// ================== GET CURRENT USER ==================
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    return null;
  }
}

// ================== CHECK IF LOGGED IN ==================
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// ================== CHECK IF ADMIN ==================
function isAdmin() {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.role === 'admin';
}

// ================== UPDATE USER ==================
function updateCurrentUser(updatedData) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Bạn chưa đăng nhập.'
      };
    }
    
    // Lấy danh sách users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Tìm và cập nhật user
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản.'
      };
    }
    
    // Merge dữ liệu mới (không cho phép đổi email và password ở đây)
    const updatedUser = {
      ...users[userIndex],
      ...updatedData,
      email: users[userIndex].email, // Giữ nguyên email
      password: users[userIndex].password // Giữ nguyên password (đổi password riêng)
    };
    
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return {
      success: true,
      message: 'Cập nhật thông tin thành công!',
      user: updatedUser
    };
    
  } catch (error) {
    console.error('Lỗi cập nhật user:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    };
  }
}

// ================== CHANGE PASSWORD ==================
function changePassword(oldPassword, newPassword) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Bạn chưa đăng nhập.'
      };
    }
    
    // Kiểm tra mật khẩu cũ
    if (currentUser.password !== oldPassword) {
      return {
        success: false,
        message: 'Mật khẩu cũ không đúng.'
      };
    }
    
    // Validate mật khẩu mới
    if (!validatePassword(newPassword)) {
      return {
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.'
      };
    }
    
    // Cập nhật mật khẩu
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      currentUser.password = newPassword;
      
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      return {
        success: true,
        message: 'Đổi mật khẩu thành công!'
      };
    }
    
    return {
      success: false,
      message: 'Không tìm thấy tài khoản.'
    };
    
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    };
  }
}

// ================== CHECK IF ADMIN ==================
function isAdmin() {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.role === 'admin';
}

// ================== CREATE DEFAULT ADMIN ==================
// Phương án A: Tạo admin mặc định đầu tiên nếu chưa có admin nào
function createDefaultAdmin() {
  try {
    initUsersStorage();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Kiểm tra xem đã có admin chưa
    const hasAdmin = users.some(u => u.role === 'admin');
    if (hasAdmin) {
      return {
        success: false,
        message: 'Đã có admin trong hệ thống.'
      };
    }
    
    // Tạo admin mặc định
    const defaultAdmin = {
      id: 'admin_default_' + Date.now(),
      email: 'admin@spacerent.com',
      password: 'admin123', // Mật khẩu mặc định - nên đổi sau
      fullName: 'Quản trị viên',
      phone: '',
      role: 'admin',
      avatar: '',
      address: '',
      createdAt: new Date().toISOString(),
      verified: true,
      vipStatus: false,
      vipExpiry: null,
      savedListings: [],
      viewedListings: [],
      myListings: [],
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };
    
    users.push(defaultAdmin);
    localStorage.setItem('users', JSON.stringify(users));
    
    return {
      success: true,
      message: 'Đã tạo tài khoản admin mặc định!',
      admin: defaultAdmin
    };
    
  } catch (error) {
    console.error('Lỗi tạo admin mặc định:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi tạo admin mặc định.'
    };
  }
}

// ================== SET USER AS ADMIN ==================
// Phương án B: Admin có thể set admin cho user khác
function setUserAsAdmin(userId) {
  try {
    const currentUser = getCurrentUser();
    
    // Chỉ admin mới có thể set admin
    if (!isAdmin()) {
      return {
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này. Chỉ admin mới có thể set admin.'
      };
    }
    
    // Không cho phép set chính mình (bảo vệ admin cuối cùng)
    if (currentUser.id === userId) {
      return {
        success: false,
        message: 'Bạn không thể thay đổi quyền của chính mình.'
      };
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'Không tìm thấy người dùng.'
      };
    }
    
    // Set role admin
    users[userIndex].role = 'admin';
    localStorage.setItem('users', JSON.stringify(users));
    
    // Nếu user đang đăng nhập, cập nhật currentUser
    if (users[userIndex].id === currentUser.id) {
      localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    }
    
    return {
      success: true,
      message: 'Đã cấp quyền admin cho người dùng thành công!',
      user: users[userIndex]
    };
    
  } catch (error) {
    console.error('Lỗi set admin:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    };
  }
}

// ================== REMOVE ADMIN ROLE ==================
// Admin có thể gỡ quyền admin của user khác (nhưng không được gỡ chính mình)
function removeAdminRole(userId) {
  try {
    const currentUser = getCurrentUser();
    
    // Chỉ admin mới có thể gỡ quyền admin
    if (!isAdmin()) {
      return {
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này.'
      };
    }
    
    // Không cho phép gỡ quyền của chính mình
    if (currentUser.id === userId) {
      return {
        success: false,
        message: 'Bạn không thể gỡ quyền admin của chính mình.'
      };
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'Không tìm thấy người dùng.'
      };
    }
    
    // Kiểm tra xem user có phải admin không
    if (users[userIndex].role !== 'admin') {
      return {
        success: false,
        message: 'Người dùng này không phải admin.'
      };
    }
    
    // Đếm số admin còn lại
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return {
        success: false,
        message: 'Không thể gỡ quyền admin. Hệ thống cần ít nhất 1 admin.'
      };
    }
    
    // Chuyển về role mặc định (nguoithue)
    users[userIndex].role = 'nguoithue';
    localStorage.setItem('users', JSON.stringify(users));
    
    return {
      success: true,
      message: 'Đã gỡ quyền admin thành công!',
      user: users[userIndex]
    };
    
  } catch (error) {
    console.error('Lỗi gỡ quyền admin:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
    };
  }
}