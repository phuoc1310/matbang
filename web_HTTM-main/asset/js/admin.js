// ================== ADMIN MODULE ==================
// Quản lý tài khoản người dùng cho admin

let allUsers = [];
let filteredUsers = [];
let userToDelete = null;

// ================== INITIALIZE ==================
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is admin
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('Bạn chưa đăng nhập. Đang chuyển hướng...', 'error');
        setTimeout(() => {
            window.location.href = 'dangnhap.html';
        }, 1500);
        return;
    }
    
    if (!isAdmin()) {
        showMessage('Bạn không có quyền truy cập trang này. Chỉ admin mới có thể truy cập.', 'error');
        setTimeout(() => {
            window.location.href = 'taikhoan.html';
        }, 2000);
        return;
    }
    
    // Admin mặc định đã được tạo tự động trong initUsersStorage()
    loadUsers();
    setupEventListeners();
});

// ================== LOAD USERS ==================
function loadUsers() {
    try {
        initUsersStorage();
        allUsers = JSON.parse(localStorage.getItem('users')) || [];
        filteredUsers = [...allUsers];
        renderUsers();
        updateStatistics();
    } catch (error) {
        console.error('Lỗi tải danh sách người dùng:', error);
        showMessage('Không thể tải danh sách người dùng.', 'error');
    }
}

// ================== UPDATE STATISTICS ==================
function updateStatistics() {
    const total = allUsers.length;
    const nguoithue = allUsers.filter(u => u.role === 'nguoithue').length;
    const chumattbang = allUsers.filter(u => u.role === 'chumattbang').length;
    const admin = allUsers.filter(u => u.role === 'admin').length;
    const vip = allUsers.filter(u => u.vipStatus === true).length;
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-nguoithue').textContent = nguoithue;
    document.getElementById('stat-chumattbang').textContent = chumattbang;
    document.getElementById('stat-vip').textContent = vip;
}

// ================== RENDER USERS ==================
function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    const noResults = document.getElementById('no-results');
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    const currentUser = getCurrentUser();
    
    tbody.innerHTML = filteredUsers.map(user => {
        // Role badge
        let roleBadge = '';
        if (user.role === 'admin') {
            roleBadge = '<span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-semibold">Admin</span>';
        } else if (user.role === 'chumattbang') {
            roleBadge = '<span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-semibold">Chủ mặt bằng</span>';
        } else {
            roleBadge = '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">Người thuê</span>';
        }
        
        const vipBadge = user.vipStatus
            ? '<span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-semibold">VIP</span>'
            : '<span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs font-semibold">Thường</span>';
        
        const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        const shortId = user.id.length > 20 ? user.id.substring(0, 20) + '...' : user.id;
        
        // Admin action buttons (chỉ hiển thị nếu không phải chính mình)
        const isCurrentUser = currentUser && currentUser.id === user.id;
        let adminActionBtn = '';
        if (!isCurrentUser) {
            if (user.role === 'admin') {
                adminActionBtn = `<button onclick="confirmRemoveAdmin('${user.id}')" class="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Gỡ quyền admin">
                    <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                </button>`;
            } else {
                adminActionBtn = `<button onclick="confirmSetAdmin('${user.id}')" class="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Cấp quyền admin">
                    <span class="material-symbols-outlined text-[18px]">shield</span>
                </button>`;
            }
        }
        
        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-slate-900 dark:text-white font-mono" title="${user.id}">${shortId}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-slate-900 dark:text-white">${user.fullName || 'Chưa cập nhật'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-slate-900 dark:text-white">${user.email}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-slate-900 dark:text-white">${user.phone || 'Chưa cập nhật'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${roleBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${vipBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-600 dark:text-slate-400">${createdAt}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex gap-2">
                        <button onclick="viewUserDetail('${user.id}')" class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Xem chi tiết">
                            <span class="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button onclick="editUser('${user.id}')" class="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Chỉnh sửa">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        ${adminActionBtn}
                        <button onclick="confirmDeleteUser('${user.id}')" class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Xóa">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ================== FILTER USERS ==================
function filterUsers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const roleFilter = document.getElementById('filter-role').value;
    const vipFilter = document.getElementById('filter-vip').value;
    
    filteredUsers = allUsers.filter(user => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (user.fullName && user.fullName.toLowerCase().includes(searchTerm)) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.phone && user.phone.includes(searchTerm)) ||
            user.id.toLowerCase().includes(searchTerm);
        
        // Role filter
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        
        // VIP filter
        const matchesVip = vipFilter === 'all' || 
            (vipFilter === 'true' && user.vipStatus === true) ||
            (vipFilter === 'false' && user.vipStatus !== true);
        
        return matchesSearch && matchesRole && matchesVip;
    });
    
    renderUsers();
}

// ================== VIEW USER DETAIL ==================
function viewUserDetail(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showMessage('Không tìm thấy người dùng.', 'error');
        return;
    }
    
    let roleText = 'Người thuê';
    if (user.role === 'admin') {
        roleText = 'Quản trị viên';
    } else if (user.role === 'chumattbang') {
        roleText = 'Chủ mặt bằng';
    }
    const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : 'N/A';
    const vipExpiry = user.vipExpiry ? new Date(user.vipExpiry).toLocaleString('vi-VN') : 'N/A';
    
    const modalContent = document.getElementById('user-modal-content');
    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">ID</p>
                    <p class="text-sm font-mono text-slate-900 dark:text-white break-all">${user.id}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${user.email}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Họ và tên</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${user.fullName || 'Chưa cập nhật'}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Số điện thoại</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${user.phone || 'Chưa cập nhật'}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Địa chỉ</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${user.address || 'Chưa cập nhật'}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Vai trò</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${roleText}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Trạng thái VIP</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${user.vipStatus ? 'Có VIP' : 'Không VIP'}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">VIP hết hạn</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${vipExpiry}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Xác thực</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${user.verified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Ngày tạo</p>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${createdAt}</p>
                </div>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Thống kê</p>
                <div class="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <p class="text-slate-600 dark:text-slate-400">Tin đã lưu</p>
                        <p class="font-semibold text-slate-900 dark:text-white">${user.savedListings?.length || 0}</p>
                    </div>
                    <div>
                        <p class="text-slate-600 dark:text-slate-400">Tin đã xem</p>
                        <p class="font-semibold text-slate-900 dark:text-white">${user.viewedListings?.length || 0}</p>
                    </div>
                    <div>
                        <p class="text-slate-600 dark:text-slate-400">Tin đã đăng</p>
                        <p class="font-semibold text-slate-900 dark:text-white">${user.myListings?.length || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('user-modal').classList.remove('hidden');
}

// ================== EDIT USER ==================
let editingUserId = null;

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showMessage('Không tìm thấy người dùng.', 'error');
        return;
    }
    
    // Không cho phép chỉnh sửa admin từ đây (phải dùng chức năng riêng)
    if (user.role === 'admin') {
        showMessage('Không thể chỉnh sửa thông tin admin từ đây. Vui lòng dùng trang tài khoản cá nhân.', 'error');
        return;
    }
    
    editingUserId = userId;
    
    // Điền dữ liệu vào form
    document.getElementById('edit-user-fullName').value = user.fullName || '';
    document.getElementById('edit-user-phone').value = user.phone || '';
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-address').value = user.address || '';
    document.getElementById('edit-user-role').value = user.role === 'admin' ? 'nguoithue' : user.role;
    
    // Hiển thị modal
    document.getElementById('edit-modal').classList.remove('hidden');
}

// ================== SAVE EDITED USER ==================
function saveEditedUser() {
    if (!editingUserId) return;
    
    const user = allUsers.find(u => u.id === editingUserId);
    if (!user) {
        showMessage('Không tìm thấy người dùng.', 'error');
        return;
    }
    
    const newFullName = document.getElementById('edit-user-fullName').value.trim();
    const newPhone = document.getElementById('edit-user-phone').value.trim();
    const newAddress = document.getElementById('edit-user-address').value.trim();
    const newRole = document.getElementById('edit-user-role').value;
    
    // Validate phone if provided
    if (newPhone && !validatePhone(newPhone)) {
        showMessage('Số điện thoại không hợp lệ. Vui lòng nhập 10-11 số.', 'error');
        return;
    }
    
    // Không cho phép đổi role thành admin từ đây
    if (newRole === 'admin') {
        showMessage('Không thể đổi vai trò thành admin từ đây. Vui lòng dùng nút "Cấp quyền admin".', 'error');
        return;
    }
    
    // Update user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === editingUserId);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            fullName: newFullName,
            phone: newPhone,
            address: newAddress,
            role: newRole
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Nếu là user đang đăng nhập, cập nhật currentUser
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === editingUserId) {
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        }
        
        loadUsers(); // Reload
        showMessage('Cập nhật thông tin người dùng thành công!', 'success');
        
        // Đóng modal
        document.getElementById('edit-modal').classList.add('hidden');
        editingUserId = null;
    }
}

// ================== CONFIRM DELETE USER ==================
function confirmDeleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showMessage('Không tìm thấy người dùng.', 'error');
        return;
    }
    
    userToDelete = userId;
    document.getElementById('delete-confirm-text').textContent = 
        `Bạn có chắc chắn muốn xóa tài khoản "${user.fullName || user.email}"? Hành động này không thể hoàn tác.`;
    document.getElementById('delete-modal').classList.remove('hidden');
}

// ================== DELETE USER ==================
function deleteUser(userId) {
    try {
        const user = allUsers.find(u => u.id === userId);
        
        // Không cho phép xóa admin (bảo vệ hệ thống)
        if (user && user.role === 'admin') {
            showMessage('Không thể xóa tài khoản admin. Vui lòng gỡ quyền admin trước.', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = users.filter(u => u.id !== userId);
        
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        // Also remove from currentUser if it's the deleted user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.removeItem('currentUser');
        }
        
        loadUsers(); // Reload
        showMessage('Xóa tài khoản thành công!', 'success');
    } catch (error) {
        console.error('Lỗi xóa người dùng:', error);
        showMessage('Đã xảy ra lỗi khi xóa tài khoản.', 'error');
    }
}

// ================== CONFIRM SET ADMIN ==================
let adminActionUserId = null;
let adminActionType = null; // 'set' or 'remove'

function confirmSetAdmin(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showMessage('Không tìm thấy người dùng.', 'error');
        return;
    }
    
    adminActionUserId = userId;
    adminActionType = 'set';
    document.getElementById('admin-confirm-text').textContent = 
        `Bạn có chắc chắn muốn cấp quyền admin cho "${user.fullName || user.email}"?`;
    document.getElementById('admin-confirm-title').textContent = 'Cấp quyền admin';
    document.getElementById('admin-confirm-icon').textContent = 'shield';
    document.getElementById('admin-confirm-btn').textContent = 'Cấp quyền';
    document.getElementById('admin-confirm-btn').className = 'flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors';
    document.getElementById('admin-modal').classList.remove('hidden');
}

// ================== CONFIRM REMOVE ADMIN ==================
function confirmRemoveAdmin(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showMessage('Không tìm thấy người dùng.', 'error');
        return;
    }
    
    adminActionUserId = userId;
    adminActionType = 'remove';
    document.getElementById('admin-confirm-text').textContent = 
        `Bạn có chắc chắn muốn gỡ quyền admin của "${user.fullName || user.email}"?`;
    document.getElementById('admin-confirm-title').textContent = 'Gỡ quyền admin';
    document.getElementById('admin-confirm-icon').textContent = 'admin_panel_settings';
    document.getElementById('admin-confirm-btn').textContent = 'Gỡ quyền';
    document.getElementById('admin-confirm-btn').className = 'flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors';
    document.getElementById('admin-modal').classList.remove('hidden');
}

// ================== SETUP EVENT LISTENERS ==================
function setupEventListeners() {
    // Search input
    document.getElementById('search-input').addEventListener('input', filterUsers);
    
    // Filter selects
    document.getElementById('filter-role').addEventListener('change', filterUsers);
    document.getElementById('filter-vip').addEventListener('change', filterUsers);
    
    // Modal close
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('user-modal').classList.add('hidden');
    });
    
    // Click outside modal to close
    document.getElementById('user-modal').addEventListener('click', (e) => {
        if (e.target.id === 'user-modal') {
            document.getElementById('user-modal').classList.add('hidden');
        }
    });
    
    // Delete confirmation
    document.getElementById('confirm-delete').addEventListener('click', () => {
        if (userToDelete) {
            deleteUser(userToDelete);
            document.getElementById('delete-modal').classList.add('hidden');
            userToDelete = null;
        }
    });
    
    document.getElementById('cancel-delete').addEventListener('click', () => {
        document.getElementById('delete-modal').classList.add('hidden');
        userToDelete = null;
    });
    
    // Click outside delete modal to close
    document.getElementById('delete-modal').addEventListener('click', (e) => {
        if (e.target.id === 'delete-modal') {
            document.getElementById('delete-modal').classList.add('hidden');
            userToDelete = null;
        }
    });
    
    // Edit modal
    document.getElementById('close-edit-modal').addEventListener('click', () => {
        document.getElementById('edit-modal').classList.add('hidden');
        editingUserId = null;
    });
    
    document.getElementById('cancel-edit-user').addEventListener('click', () => {
        document.getElementById('edit-modal').classList.add('hidden');
        editingUserId = null;
    });
    
    // Click outside edit modal to close
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') {
            document.getElementById('edit-modal').classList.add('hidden');
            editingUserId = null;
        }
    });
    
    // Edit user form submit
    document.getElementById('edit-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEditedUser();
    });
    
    // Admin action confirmation
    document.getElementById('admin-confirm-btn').addEventListener('click', () => {
        if (adminActionUserId && adminActionType) {
            if (adminActionType === 'set') {
                const result = setUserAsAdmin(adminActionUserId);
                if (result.success) {
                    showMessage(result.message, 'success');
                    loadUsers();
                } else {
                    showMessage(result.message, 'error');
                }
            } else if (adminActionType === 'remove') {
                const result = removeAdminRole(adminActionUserId);
                if (result.success) {
                    showMessage(result.message, 'success');
                    loadUsers();
                } else {
                    showMessage(result.message, 'error');
                }
            }
            document.getElementById('admin-modal').classList.add('hidden');
            adminActionUserId = null;
            adminActionType = null;
        }
    });
    
    document.getElementById('cancel-admin-action').addEventListener('click', () => {
        document.getElementById('admin-modal').classList.add('hidden');
        adminActionUserId = null;
        adminActionType = null;
    });
    
    // Click outside admin modal to close
    document.getElementById('admin-modal').addEventListener('click', (e) => {
        if (e.target.id === 'admin-modal') {
            document.getElementById('admin-modal').classList.add('hidden');
            adminActionUserId = null;
            adminActionType = null;
        }
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        const result = logout();
        if (result.success) {
            showMessage('Đăng xuất thành công! Đang chuyển hướng...', 'success');
            setTimeout(() => {
                window.location.href = 'dangnhap.html';
            }, 800);
        } else {
            showMessage('Có lỗi xảy ra: ' + result.message, 'error');
        }
    });
}

// ================== SHOW MESSAGE ==================
function showMessage(message, type = 'error') {
    const messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;
    messageContainer.className = `mb-4 p-4 rounded-lg text-sm font-medium ${
        type === 'success' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }`;
    messageContainer.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 3000);
    }
}
