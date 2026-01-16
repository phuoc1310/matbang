<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use SoftDeletes;

    protected $table = 'properties';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'address',
        'price',
        'area',
        'type',
        'status',
        'is_visible',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    /**
     * Lấy user sở hữu tin đăng
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy lịch sử thay đổi của tin đăng
     */
    public function histories(): HasMany
    {
        return $this->hasMany(PropertyHistory::class);
    }
}
