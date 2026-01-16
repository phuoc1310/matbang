<?php

namespace App\Http\Controllers;

use App\Services\AutoModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WebhookController extends Controller
{
    protected $moderationService;

    public function __construct(AutoModerationService $moderationService)
    {
        $this->moderationService = $moderationService;
    }

    /**
     * Webhook endpoint để nhận phản hồi từ n8n
     * 
     * POST /api/webhook/n8n
     * 
     * Body:
     * {
     *   "property_id": 123,
     *   "status": "approved" | "rejected" | "pending",
     *   "reason": "Lý do duyệt/từ chối",
     *   "webhook_secret": "secret-key"
     * }
     */
    public function handleN8n(Request $request)
    {
        // Validate webhook secret
        $secret = config('moderation.webhook_secret');
        if ($request->webhook_secret !== $secret) {
            Log::warning('Invalid webhook secret', [
                'ip' => $request->ip(),
                'provided_secret' => substr($request->webhook_secret ?? '', 0, 5) . '...',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|integer|exists:properties,id',
            'status' => 'required|in:approved,rejected,pending',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Process response from n8n
        $result = $this->moderationService->processN8nResponse(
            $request->property_id,
            $request->only(['status', 'reason'])
        );

        if ($result['success']) {
            Log::info("N8N webhook processed successfully", [
                'property_id' => $request->property_id,
                'status' => $request->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'property' => [
                    'id' => $result['property']->id,
                    'status' => $result['property']->status,
                ],
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'],
        ], 400);
    }

    /**
     * Endpoint để n8n lấy danh sách tin chờ duyệt
     * 
     * GET /api/webhook/pending-properties
     */
    public function getPendingProperties(Request $request)
    {
        // Validate webhook secret (nếu cần)
        $secret = config('moderation.webhook_secret');
        if ($request->query('secret') !== $secret) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $properties = \App\Models\Property::where('status', 'pending')
            ->with('user:id,name,email')
            ->latest()
            ->limit($request->query('limit', 10))
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'description' => $property->description,
                    'address' => $property->address,
                    'price' => $property->price,
                    'area' => $property->area,
                    'type' => $property->type,
                    'status' => $property->status,
                    'user' => [
                        'id' => $property->user->id ?? null,
                        'name' => $property->user->name ?? 'N/A',
                        'email' => $property->user->email ?? null,
                    ],
                    'created_at' => $property->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'count' => $properties->count(),
            'properties' => $properties,
        ], 200);
    }
}
