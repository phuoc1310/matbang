// ================== SENTIMENT ANALYSIS MODULE ==================
// AI-powered sentiment analysis using Gemini API

const SENTIMENT_CONFIG = {
    GEMINI_API_KEY: 'AIzaSyBJh3BzogTLSA7JooEKTE04o1WiiKpInUc',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
    CACHE_ENABLED: true,
    CACHE_KEY_PREFIX: 'sentiment_cache_'
};

// ================== ANALYZE SENTIMENT ==================
async function analyzeSentiment(text, type = 'contact') {
    if (!text || text.trim().length < 10) {
        return {
            sentiment: 'neutral',
            confidence: 0,
            keywords: [],
            priority: 3,
            tags: [],
            summary: 'Nội dung quá ngắn để phân tích',
            error: 'Text too short'
        };
    }
    
    // Check cache first
    if (SENTIMENT_CONFIG.CACHE_ENABLED) {
        const cached = getCachedSentiment(text);
        if (cached) {
            return cached;
        }
    }
    
    // Use fallback if configured (for testing/demo)
    if (SENTIMENT_CONFIG.USE_FALLBACK_FIRST) {
        console.log('Using fallback analysis (configured)');
        return getFallbackSentiment(text);
    }
    
    try {
        const result = await callGeminiForSentiment(text, type);
        
        // Cache result
        if (SENTIMENT_CONFIG.CACHE_ENABLED) {
            cacheSentiment(text, result);
        }
        
        return result;
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        console.log('Falling back to keyword-based analysis');
        return getFallbackSentiment(text);
    }
}

// ================== CALL GEMINI API ==================
async function callGeminiForSentiment(text, type) {
    const prompt = `Phân tích cảm xúc (sentiment analysis) của văn bản sau đây từ một ${type === 'contact' ? 'liên hệ' : 'phản hồi'} khách hàng.

Văn bản: "${text}"

Hãy trả về kết quả phân tích theo định dạng JSON chính xác như sau (KHÔNG thêm markdown, chỉ JSON thuần):
{
    "sentiment": "positive|neutral|negative",
    "confidence": 0.0-1.0,
    "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"],
    "priority": 1-5 (1=thấp, 5=cao),
    "tags": ["tag1", "tag2"],
    "summary": "Tóm tắt ngắn gọn cảm xúc và nội dung chính (1 câu)"
}

Quy tắc phân tích:
- sentiment: positive (tích cực), neutral (trung lập), negative (tiêu cực)
- confidence: độ tin cậy từ 0-1
- keywords: 3-5 từ khóa quan trọng nhất
- priority: 1-5, ưu tiên cao nếu khẩn cấp, phàn nàn, vấn đề nghiêm trọng
- tags: gợi ý 2-3 tag phân loại (ví dụ: "hỗ trợ", "khiếu nại", "khen ngợi", "góp ý", "vip", "kỹ thuật")
- summary: tóm tắt ngắn gọn bằng tiếng Việt

Chỉ trả về JSON, không thêm text nào khác.`;

    const response = await fetch(`${SENTIMENT_CONFIG.GEMINI_API_URL}?key=${SENTIMENT_CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 1024
            }
        })
    });
    
    if (!response.ok) {
        // More detailed error for 429
        if (response.status === 429) {
            throw new Error(`Rate limit exceeded (429). Vui lòng chờ 1-2 phút và thử lại.`);
        }
        throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if response was truncated
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        console.warn('API response incomplete:', finishReason);
        throw new Error(`Gemini API response incomplete: ${finishReason}`);
    }
    
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('AI Response:', aiResponse); // Debug
    
    // Parse JSON from AI response (handle markdown code blocks)
    let jsonText = aiResponse;
    
    // Remove markdown code blocks if present
    if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    } else if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\s*/g, '');
    }
    
    // Try to extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
        console.error('Cannot extract JSON from:', aiResponse);
        throw new Error('Invalid JSON response from AI - No JSON object found');
    }
    
    let result;
    try {
        result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        console.error('Raw AI response:', aiResponse);
        throw new Error('Invalid JSON response from AI - Parse failed (response may be incomplete)');
    }
    
    // Validate and normalize
    return {
        sentiment: result.sentiment || 'neutral',
        confidence: parseFloat(result.confidence) || 0.5,
        keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 5) : [],
        priority: parseInt(result.priority) || 3,
        tags: Array.isArray(result.tags) ? result.tags.slice(0, 3) : [],
        summary: result.summary || 'Không có tóm tắt'
    };
}

// ================== FALLBACK SENTIMENT ==================
function getFallbackSentiment(text) {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based analysis
    const positiveKeywords = ['tốt', 'hay', 'hài lòng', 'chuyên nghiệp', 'nhanh', 'tuyệt', 'ok', 'oke', 'cảm ơn', 'thanks'];
    const negativeKeywords = ['tệ', 'kém', 'chậm', 'không tốt', 'thất vọng', 'tồi', 'lỗi', 'bug', 'sai', 'khó'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) positiveCount++;
    });
    
    negativeKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) negativeCount++;
    });
    
    let sentiment = 'neutral';
    let priority = 3;
    
    if (positiveCount > negativeCount) {
        sentiment = 'positive';
        priority = 2;
    } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        priority = 4;
    }
    
    // Extract keywords (first 3 words > 4 chars)
    const words = text.split(/\s+/).filter(w => w.length > 4).slice(0, 3);
    
    return {
        sentiment: sentiment,
        confidence: 0.6,
        keywords: words,
        priority: priority,
        tags: [sentiment === 'positive' ? 'khen ngợi' : sentiment === 'negative' ? 'góp ý' : 'thông tin'],
        summary: 'Phân tích tự động (fallback)',
        fallback: true
    };
}

// ================== CACHE MANAGEMENT ==================
function getCachedSentiment(text) {
    try {
        const cacheKey = SENTIMENT_CONFIG.CACHE_KEY_PREFIX + hashString(text);
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const data = JSON.parse(cached);
            
            // Check if cache is still valid (24 hours)
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                return data.result;
            }
        }
    } catch (error) {
        console.error('Cache retrieval error:', error);
    }
    
    return null;
}

function cacheSentiment(text, result) {
    try {
        const cacheKey = SENTIMENT_CONFIG.CACHE_KEY_PREFIX + hashString(text);
        const data = {
            result: result,
            timestamp: Date.now()
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
        console.error('Cache storage error:', error);
    }
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// ================== BATCH ANALYSIS ==================
async function analyzeBatch(items, type = 'contact') {
    const results = [];
    
    for (const item of items) {
        const text = type === 'contact' ? item.content : item.comment;
        
        try {
            const analysis = await analyzeSentiment(text, type);
            results.push({
                id: item.id,
                ...analysis
            });
            
            // Longer delay to avoid rate limiting (1 second)
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error analyzing ${item.id}:`, error);
            
            // If rate limit error (429), use fallback instead of retrying
            if (error.message.includes('429')) {
                console.warn('Rate limit exceeded, using fallback analysis');
                results.push({
                    id: item.id,
                    ...getFallbackSentiment(text)
                });
            } else {
                results.push({
                    id: item.id,
                    ...getFallbackSentiment(text)
                });
            }
        }
    }
    
    return results;
}

// ================== SENTIMENT STATISTICS ==================
function getSentimentStats(analyses) {
    const stats = {
        total: analyses.length,
        positive: 0,
        neutral: 0,
        negative: 0,
        avgConfidence: 0,
        avgPriority: 0,
        topKeywords: {},
        topTags: {}
    };
    
    let totalConfidence = 0;
    let totalPriority = 0;
    
    analyses.forEach(analysis => {
        // Count sentiments
        stats[analysis.sentiment]++;
        
        // Sum confidence and priority
        totalConfidence += analysis.confidence || 0;
        totalPriority += analysis.priority || 0;
        
        // Count keywords
        (analysis.keywords || []).forEach(keyword => {
            stats.topKeywords[keyword] = (stats.topKeywords[keyword] || 0) + 1;
        });
        
        // Count tags
        (analysis.tags || []).forEach(tag => {
            stats.topTags[tag] = (stats.topTags[tag] || 0) + 1;
        });
    });
    
    stats.avgConfidence = analyses.length > 0 ? (totalConfidence / analyses.length).toFixed(2) : 0;
    stats.avgPriority = analyses.length > 0 ? (totalPriority / analyses.length).toFixed(1) : 0;
    
    // Sort keywords and tags
    stats.topKeywords = Object.entries(stats.topKeywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    
    stats.topTags = Object.entries(stats.topTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    
    return stats;
}

// ================== UI HELPERS ==================
function getSentimentBadgeHTML(sentiment, confidence = 0) {
    const badges = {
        positive: {
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            icon: 'sentiment_satisfied',
            text: 'Tích cực'
        },
        neutral: {
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            icon: 'sentiment_neutral',
            text: 'Trung lập'
        },
        negative: {
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            icon: 'sentiment_dissatisfied',
            text: 'Tiêu cực'
        }
    };
    
    const badge = badges[sentiment] || badges.neutral;
    const confidencePercent = (confidence * 100).toFixed(0);
    
    return `
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}">
            <span class="material-symbols-outlined text-sm">${badge.icon}</span>
            <span>${badge.text}</span>
            ${confidence > 0 ? `<span class="text-xs opacity-75">(${confidencePercent}%)</span>` : ''}
        </span>
    `;
}

function getPriorityBadgeHTML(priority) {
    const colors = {
        1: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        2: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        4: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        5: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    
    const labels = {
        1: 'Rất thấp',
        2: 'Thấp',
        3: 'Trung bình',
        4: 'Cao',
        5: 'Rất cao'
    };
    
    return `
        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${colors[priority] || colors[3]}">
            <span class="material-symbols-outlined text-xs">flag</span>
            <span>${labels[priority] || 'Trung bình'}</span>
        </span>
    `;
}

// ================== EXPORT ==================
if (typeof window !== 'undefined') {
    window.analyzeSentiment = analyzeSentiment;
    window.analyzeBatch = analyzeBatch;
    window.getSentimentStats = getSentimentStats;
    window.getSentimentBadgeHTML = getSentimentBadgeHTML;
    window.getPriorityBadgeHTML = getPriorityBadgeHTML;
    window.getCachedSentiment = getCachedSentiment;
}
