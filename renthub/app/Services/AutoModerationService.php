<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoModerationService
{
    /**
     * Kiểm tra và tự động duyệt/từ chối tin đăng theo rules
     */
    public function moderateProperty(Property $property): array
    {
        $rules = config('moderation.rules', []);
        $reason = '';
        $status = 'pending';

        // Kiểm tra từng rule
        foreach ($rules as $ruleName => $rule) {
            $result = $this->checkRule($property, $rule);
            
            if (!$result['passed']) {
                $status = 'rejected';
                $reason = $result['reason'];
                break; // Dừng ngay khi có rule fail
            }
        }

        // Nếu tất cả rules đều pass, tự động duyệt
        if ($status !== 'rejected') {
            $autoApprove = config('moderation.auto_approve', false);
            if ($autoApprove) {
                $status = 'approved';
                $reason = 'Tự động duyệt - Tin đăng đáp ứng tất cả điều kiện';
            }
        }

        return [
            'status' => $status,
            'reason' => $reason,
            'auto_processed' => true,
        ];
    }

    /**
     * Kiểm tra một rule cụ thể
     */
    protected function checkRule(Property $property, array $rule): array
    {
        $field = $rule['field'] ?? null;
        $operator = $rule['operator'] ?? null;
        $value = $rule['value'] ?? null;
        $reason = $rule['reason'] ?? 'Vi phạm quy định';
        $skipIfNull = $rule['skip_if_null'] ?? false;

        if (!$field || !$operator) {
            return ['passed' => true]; // Skip invalid rules
        }

        $propertyValue = $property->{$field};

        // Skip rule nếu giá trị null và được cấu hình skip_if_null
        if (is_null($propertyValue) && $skipIfNull) {
            return ['passed' => true];
        }
        $passed = false;

        switch ($operator) {
            case 'min':
                $passed = $propertyValue >= $value;
                break;
            case 'max':
                $passed = $propertyValue <= $value;
                break;
            case 'equals':
                $passed = $propertyValue == $value;
                break;
            case 'not_equals':
                $passed = $propertyValue != $value;
                break;
            case 'contains':
                $passed = stripos($propertyValue, $value) !== false;
                break;
            case 'not_contains':
                $passed = stripos($propertyValue, $value) === false;
                break;
            case 'in':
                $passed = in_array($propertyValue, (array)$value);
                break;
            case 'not_in':
                $passed = !in_array($propertyValue, (array)$value);
                break;
            case 'length_min':
                $passed = strlen($propertyValue) >= $value;
                break;
            case 'length_max':
                $passed = strlen($propertyValue) <= $value;
                break;
            default:
                $passed = true; // Unknown operator, pass by default
        }

        return [
            'passed' => $passed,
            'reason' => $passed ? '' : $reason,
        ];
    }

    /**
     * Gửi webhook đến n8n khi có tin đăng mới
     */
    public function sendToN8n(Property $property, string $event = 'property.created'): bool
    {
        $webhookUrl = config('moderation.n8n_webhook_url');
        
        if (!$webhookUrl) {
            Log::warning('N8N webhook URL chưa được cấu hình');
            return false;
        }

        try {
            $payload = [
                'event' => $event,
                'property' => [
                    'id' => $property->id,
                    'title' => $property->title,
                    'description' => $property->description,
                    'address' => $property->address,
                    'price' => $property->price,
                    'area' => $property->area,
                    'type' => $property->type,
                    'status' => $property->status,
                    'user_id' => $property->user_id,
                    'created_at' => $property->created_at->toIso8601String(),
                ],
                'webhook_secret' => config('moderation.webhook_secret'),
            ];

            $response = Http::timeout(10)
                ->post($webhookUrl, $payload);

            if ($response->successful()) {
                Log::info("N8N webhook sent successfully for property #{$property->id}");
                return true;
            } else {
                Log::error("N8N webhook failed for property #{$property->id}", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error("N8N webhook exception for property #{$property->id}", [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Xử lý phản hồi từ n8n (được gọi bởi WebhookController)
     */
    public function processN8nResponse(int $propertyId, array $data): array
    {
        $property = Property::find($propertyId);
        
        if (!$property) {
            return [
                'success' => false,
                'message' => 'Property not found',
            ];
        }

        $oldData = $property->toArray();
        $status = $data['status'] ?? $property->status;
        $reason = $data['reason'] ?? 'Tự động xử lý bởi n8n workflow';

        // Validate status
        if (!in_array($status, ['approved', 'rejected', 'pending'])) {
            return [
                'success' => false,
                'message' => 'Invalid status',
            ];
        }

        // Cập nhật trạng thái
        $property->update([
            'status' => $status,
            'is_visible' => $status === 'approved' ? 1 : 0,
        ]);

        // Lưu lịch sử
        PropertyHistory::create([
            'property_id' => $property->id,
            'changed_by' => null, // System/automated
            'old_data' => $oldData,
            'new_data' => $property->toArray(),
            'reason' => $reason,
        ]);

        return [
            'success' => true,
            'message' => "Property #{$propertyId} updated to {$status}",
            'property' => $property,
        ];
    }

    /**
     * Kiểm tra và xử lý tự động (có thể được gọi bởi cron job)
     */
    public function processPendingProperties(): int
    {
        $pendingProperties = Property::where('status', 'pending')
            ->where('created_at', '>=', now()->subHours(24)) // Chỉ xử lý tin trong 24h
            ->get();

        $processed = 0;

        foreach ($pendingProperties as $property) {
            $result = $this->moderateProperty($property);
            
            if ($result['auto_processed'] && $result['status'] !== 'pending') {
                $oldData = $property->toArray();
                
                $property->update([
                    'status' => $result['status'],
                    'is_visible' => $result['status'] === 'approved' ? 1 : 0,
                ]);

                PropertyHistory::create([
                    'property_id' => $property->id,
                    'changed_by' => null,
                    'old_data' => $oldData,
                    'new_data' => $property->toArray(),
                    'reason' => $result['reason'],
                ]);

                $processed++;
            }
        }

        return $processed;
    }
}
