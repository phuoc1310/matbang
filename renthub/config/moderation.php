<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Auto Approve
    |--------------------------------------------------------------------------
    |
    | Nếu true, tin đăng sẽ tự động được duyệt nếu pass tất cả rules.
    | Nếu false, tin sẽ ở trạng thái pending và chờ admin duyệt.
    |
    */
    'auto_approve' => env('MODERATION_AUTO_APPROVE', false),

    /*
    |--------------------------------------------------------------------------
    | N8N Webhook URL
    |--------------------------------------------------------------------------
    |
    | URL của n8n webhook để nhận thông báo khi có tin đăng mới.
    | Để trống nếu không sử dụng n8n.
    |
    */
    'n8n_webhook_url' => env('N8N_WEBHOOK_URL', ''),

    /*
    |--------------------------------------------------------------------------
    | Webhook Secret
    |--------------------------------------------------------------------------
    |
    | Secret key để xác thực webhook từ n8n.
    |
    */
    'webhook_secret' => env('MODERATION_WEBHOOK_SECRET', 'your-secret-key-here'),

    /*
    |--------------------------------------------------------------------------
    | Moderation Rules
    |--------------------------------------------------------------------------
    |
    | Các rules để tự động kiểm duyệt tin đăng.
    | Tin đăng sẽ bị từ chối nếu vi phạm bất kỳ rule nào.
    |
    | Operators có sẵn:
    | - min: Giá trị >= value
    | - max: Giá trị <= value
    | - equals: Giá trị == value
    | - not_equals: Giá trị != value
    | - contains: Chuỗi chứa value
    | - not_contains: Chuỗi không chứa value
    | - in: Giá trị nằm trong array value
    | - not_in: Giá trị không nằm trong array value
    | - length_min: Độ dài chuỗi >= value
    | - length_max: Độ dài chuỗi <= value
    |
    */
    'rules' => [
        // Rule 1: Giá tối thiểu
        'min_price' => [
            'field' => 'price',
            'operator' => 'min',
            'value' => 1000000, // 1 triệu
            'reason' => 'Giá cho thuê quá thấp (dưới 1 triệu)',
        ],

        // Rule 2: Giá tối đa (nếu cần)
        'max_price' => [
            'field' => 'price',
            'operator' => 'max',
            'value' => 1000000000, // 1 tỷ
            'reason' => 'Giá cho thuê quá cao (trên 1 tỷ)',
        ],

        // Rule 3: Tiêu đề tối thiểu
        'title_length' => [
            'field' => 'title',
            'operator' => 'length_min',
            'value' => 10,
            'reason' => 'Tiêu đề quá ngắn (ít hơn 10 ký tự)',
        ],

        // Rule 4: Mô tả tối thiểu
        'description_length' => [
            'field' => 'description',
            'operator' => 'length_min',
            'value' => 20,
            'reason' => 'Mô tả quá ngắn (ít hơn 20 ký tự)',
        ],

        // Rule 5: Chặn từ khóa spam
        'spam_keywords' => [
            'field' => 'description',
            'operator' => 'not_contains',
            'value' => 'spam, lừa đảo, fake', // Có thể expand thành array
            'reason' => 'Mô tả chứa từ khóa không được phép',
        ],

        // Rule 6: Loại hình hợp lệ
        'valid_type' => [
            'field' => 'type',
            'operator' => 'in',
            'value' => ['Đất', 'Văn phòng', 'Cửa hàng'],
            'reason' => 'Loại hình không hợp lệ',
        ],

        // Rule 7: Diện tích tối thiểu (nếu có)
        'min_area' => [
            'field' => 'area',
            'operator' => 'min',
            'value' => 5, // 5 m²
            'reason' => 'Diện tích quá nhỏ (dưới 5 m²)',
            'skip_if_null' => true, // Bỏ qua nếu area = null
        ],
    ],
];
