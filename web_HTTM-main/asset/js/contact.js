// ================== CONTACT MODULE ==================
// Quản lý form liên hệ và lưu vào localStorage

const CONTACT_STORAGE_KEY = 'contacts';

// ================== INITIALIZE ==================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleContactSubmit);
}

// ================== HANDLE SUBMIT ==================
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');
    
    // Hide previous messages
    if (successMsg) successMsg.classList.add('hidden');
    if (errorMsg) errorMsg.classList.add('hidden');
    
    // Get form data
    const formData = {
        id: 'contact_' + Date.now(),
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        subject: document.getElementById('subject').value,
        content: document.getElementById('content').value.trim(),
        status: 'pending', // pending, processed, resolved
        createdAt: new Date().toISOString(),
        processedAt: null,
        processedBy: null
    };
    
    // Validate
    if (!formData.fullName || !formData.email || !formData.subject || !formData.content) {
        showError('Vui lòng điền đầy đủ các trường bắt buộc.');
        return;
    }
    
    if (!validateEmail(formData.email)) {
        showError('Email không hợp lệ.');
        return;
    }
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Đang gửi...</span><span class="material-symbols-outlined animate-spin">hourglass_empty</span>';
    }
    
    try {
        // Save to localStorage
        saveContact(formData);
        
        // Simulate API call (có thể thay bằng API thật)
        await simulateAPICall();
        
        // Show success message
        showSuccess();
        
        // Reset form
        document.getElementById('contact-form').reset();
        
        // Scroll to success message
        if (successMsg) {
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } catch (error) {
        console.error('Error submitting contact:', error);
        showError('Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại sau.');
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Gửi liên hệ</span><span class="material-symbols-outlined">send</span>';
        }
    }
}

// ================== SAVE CONTACT ==================
function saveContact(contactData) {
    try {
        const contacts = getContacts();
        contacts.push(contactData);
        localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contacts));
        return true;
    } catch (error) {
        console.error('Error saving contact:', error);
        throw error;
    }
}

// ================== GET CONTACTS ==================
function getContacts() {
    try {
        const contactsStr = localStorage.getItem(CONTACT_STORAGE_KEY);
        return contactsStr ? JSON.parse(contactsStr) : [];
    } catch (error) {
        console.error('Error getting contacts:', error);
        return [];
    }
}

// ================== GET CONTACT BY ID ==================
function getContactById(id) {
    const contacts = getContacts();
    return contacts.find(c => c.id === id);
}

// ================== UPDATE CONTACT STATUS ==================
function updateContactStatus(id, status, processedBy = null) {
    try {
        const contacts = getContacts();
        const index = contacts.findIndex(c => c.id === id);
        
        if (index === -1) return false;
        
        contacts[index].status = status;
        contacts[index].processedAt = new Date().toISOString();
        if (processedBy) {
            contacts[index].processedBy = processedBy;
        }
        
        localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contacts));
        return true;
    } catch (error) {
        console.error('Error updating contact status:', error);
        return false;
    }
}

// ================== DELETE CONTACT ==================
function deleteContact(id) {
    try {
        const contacts = getContacts();
        const filtered = contacts.filter(c => c.id !== id);
        localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting contact:', error);
        return false;
    }
}

// ================== VALIDATE EMAIL ==================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ================== SHOW MESSAGES ==================
function showSuccess() {
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');
    
    if (errorMsg) errorMsg.classList.add('hidden');
    if (successMsg) successMsg.classList.remove('hidden');
}

function showError(message) {
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (successMsg) successMsg.classList.add('hidden');
    if (errorMsg) {
        if (errorText && message) errorText.textContent = message;
        errorMsg.classList.remove('hidden');
    }
}

// ================== SIMULATE API CALL ==================
function simulateAPICall() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 500);
    });
}

// ================== EXPORT ==================
if (typeof window !== 'undefined') {
    window.initContactForm = initContactForm;
    window.getContacts = getContacts;
    window.getContactById = getContactById;
    window.updateContactStatus = updateContactStatus;
    window.deleteContact = deleteContact;
    window.saveContact = saveContact;
}

// Auto initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}
