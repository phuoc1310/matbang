// ================== AUTHENTICATION MODULE ==================
// Quản lý đăng ký, đăng nhập, đăng xuất với localStorage

// ================== INITIALIZE USERS STORAGE ==================
function initUsersStorage() {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
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
    
    // Tạo user mới
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email: userData.email.trim().toLowerCase(),
      password: userData.password, // Plain text cho demo
      fullName: userData.fullName || '',
      phone: userData.phone || '',
      role: userData.role || 'nguoithue', // 'nguoithue' hoặc 'chumattbang'
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