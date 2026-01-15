// ================== FEEDBACK MODULE ==================
// Quản lý form phản hồi và lưu vào localStorage

const FEEDBACK_STORAGE_KEY = 'feedbacks';

// ================== INITIALIZE ==================
function initFeedbackForm() {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    // Setup rating buttons
    setupRatingButtons();
    
    // Setup form submit
    form.addEventListener('submit', handleFeedbackSubmit);
    
    // Load recent feedbacks
    loadRecentFeedbacks();
}

// ================== SETUP RATING BUTTONS ==================
function setupRatingButtons() {
    const ratingBtns = document.querySelectorAll('.rating-btn');
    const ratingInput = document.getElementById('rating');
    const ratingText = document.getElementById('rating-text');
    
    if (!ratingBtns.length || !ratingInput) return;
    
    ratingBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const rating = index + 1;
            ratingInput.value = rating;
            
            // Update stars
            ratingBtns.forEach((b, i) => {
                const star = b.querySelector('.material-symbols-outlined');
                if (i < rating) {
                    star.textContent = 'star';
                    star.classList.add('text-yellow-400');
                    star.classList.remove('text-gray-300', 'dark:text-gray-600');
                } else {
                    star.textContent = 'star';
                    star.classList.remove('text-yellow-400');
                    star.classList.add('text-gray-300', 'dark:text-gray-600');
                }
            });
            
            // Update text
            if (ratingText) {
                const texts = ['Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];
                ratingText.textContent = texts[rating - 1];
            }
        });
        
        // Hover effect
        btn.addEventListener('mouseenter', () => {
            const hoverRating = index + 1;
            ratingBtns.forEach((b, i) => {
                const star = b.querySelector('.material-symbols-outlined');
                if (i < hoverRating && !ratingInput.value) {
                    star.classList.add('text-yellow-300');
                }
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            if (!ratingInput.value) {
                ratingBtns.forEach((b) => {
                    const star = b.querySelector('.material-symbols-outlined');
                    star.classList.remove('text-yellow-300');
                });
            }
        });
    });
}

// ================== HANDLE SUBMIT ==================
async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');
    
    // Hide previous messages
    if (successMsg) successMsg.classList.add('hidden');
    if (errorMsg) errorMsg.classList.add('hidden');
    
    // Get form data
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value.trim();
    const suggestion = document.getElementById('suggestion').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Validate
    if (!rating || !comment) {
        showError('Vui lòng chọn đánh giá và nhập nhận xét.');
        return;
    }
    
    if (email && !validateEmail(email)) {
        showError('Email không hợp lệ.');
        return;
    }
    
    const feedbackData = {
        id: 'feedback_' + Date.now(),
        rating: parseInt(rating),
        comment: comment,
        suggestion: suggestion || null,
        email: email || null,
        status: 'pending', // pending, reviewed
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null
    };
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Đang gửi...</span><span class="material-symbols-outlined animate-spin">hourglass_empty</span>';
    }
    
    try {
        // Save to localStorage
        saveFeedback(feedbackData);
        
        // Simulate API call
        await simulateAPICall();
        
        // Show success message
        showSuccess();
        
        // Reset form
        document.getElementById('feedback-form').reset();
        
        // Reset rating
        const ratingBtns = document.querySelectorAll('.rating-btn');
        ratingBtns.forEach((b) => {
            const star = b.querySelector('.material-symbols-outlined');
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300', 'dark:text-gray-600');
        });
        document.getElementById('rating').value = '';
        if (document.getElementById('rating-text')) {
            document.getElementById('rating-text').textContent = 'Chọn số sao đánh giá';
        }
        
        // Reload recent feedbacks
        loadRecentFeedbacks();
        
        // Scroll to success message
        if (successMsg) {
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showError('Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.');
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Gửi phản hồi</span><span class="material-symbols-outlined">send</span>';
        }
    }
}

// ================== SAVE FEEDBACK ==================
function saveFeedback(feedbackData) {
    try {
        const feedbacks = getFeedbacks();
        feedbacks.push(feedbackData);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
        return true;
    } catch (error) {
        console.error('Error saving feedback:', error);
        throw error;
    }
}

// ================== GET FEEDBACKS ==================
function getFeedbacks() {
    try {
        const feedbacksStr = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        return feedbacksStr ? JSON.parse(feedbacksStr) : [];
    } catch (error) {
        console.error('Error getting feedbacks:', error);
        return [];
    }
}

// ================== GET FEEDBACK BY ID ==================
function getFeedbackById(id) {
    const feedbacks = getFeedbacks();
    return feedbacks.find(f => f.id === id);
}

// ================== UPDATE FEEDBACK STATUS ==================
function updateFeedbackStatus(id, status, reviewedBy = null) {
    try {
        const feedbacks = getFeedbacks();
        const index = feedbacks.findIndex(f => f.id === id);
        
        if (index === -1) return false;
        
        feedbacks[index].status = status;
        feedbacks[index].reviewedAt = new Date().toISOString();
        if (reviewedBy) {
            feedbacks[index].reviewedBy = reviewedBy;
        }
        
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
        return true;
    } catch (error) {
        console.error('Error updating feedback status:', error);
        return false;
    }
}

// ================== DELETE FEEDBACK ==================
function deleteFeedback(id) {
    try {
        const feedbacks = getFeedbacks();
        const filtered = feedbacks.filter(f => f.id !== id);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting feedback:', error);
        return false;
    }
}

// ================== LOAD RECENT FEEDBACKS ==================
function loadRecentFeedbacks() {
    const container = document.getElementById('feedbacks-list');
    if (!container) return;
    
    const feedbacks = getFeedbacks();
    
    // Sort by date (newest first) and take top 5
    const recentFeedbacks = feedbacks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentFeedbacks.length === 0) {
        container.innerHTML = '<p class="text-text-sub-light dark:text-text-sub-dark text-center py-8">Chưa có phản hồi nào.</p>';
        return;
    }
    
    container.innerHTML = recentFeedbacks.map(feedback => {
        const stars = '⭐'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
        const date = new Date(feedback.createdAt).toLocaleDateString('vi-VN');
        
        return `
            <div class="border border-border-light dark:border-border-dark rounded-lg p-4">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">${stars}</span>
                        <span class="text-sm text-text-sub-light dark:text-text-sub-dark">${date}</span>
                    </div>
                </div>
                <p class="text-sm mb-2">${escapeHtml(feedback.comment)}</p>
                ${feedback.suggestion ? `<p class="text-xs text-text-sub-light dark:text-text-sub-dark italic">💡 Gợi ý: ${escapeHtml(feedback.suggestion)}</p>` : ''}
            </div>
        `;
    }).join('');
}

// ================== VALIDATE EMAIL ==================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ================== ESCAPE HTML ==================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    window.initFeedbackForm = initFeedbackForm;
    window.getFeedbacks = getFeedbacks;
    window.getFeedbackById = getFeedbackById;
    window.updateFeedbackStatus = updateFeedbackStatus;
    window.deleteFeedback = deleteFeedback;
    window.saveFeedback = saveFeedback;
    window.loadRecentFeedbacks = loadRecentFeedbacks;
}

// Auto initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedbackForm);
} else {
    initFeedbackForm();
}
