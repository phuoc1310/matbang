<?php

namespace App\Console\Commands;

use App\Models\Property;
use App\Services\AutoModerationService;
use Illuminate\Console\Command;

class TestN8nIntegration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'n8n:test {--property-id= : ID của property để test}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test tích hợp n8n - Gửi webhook đến n8n';

    protected $moderationService;

    public function __construct(AutoModerationService $moderationService)
    {
        parent::__construct();
        $this->moderationService = $moderationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $propertyId = $this->option('property-id');
        
        if ($propertyId) {
            $property = Property::find($propertyId);
            if (!$property) {
                $this->error("Property #{$propertyId} không tồn tại!");
                return 1;
            }
        } else {
            // Lấy property mới nhất
            $property = Property::latest()->first();
            if (!$property) {
                $this->error("Không có property nào trong database!");
                return 1;
            }
        }

        $this->info("Testing n8n integration với Property #{$property->id}");
        $this->line("Title: {$property->title}");
        $this->line("Price: " . number_format($property->price) . " đ");
        $this->line("Status: {$property->status}");
        $this->newLine();

        // Kiểm tra config
        $webhookUrl = config('moderation.n8n_webhook_url');
        if (!$webhookUrl) {
            $this->warn("⚠️  N8N_WEBHOOK_URL chưa được cấu hình trong .env");
            $this->line("Thêm vào .env: N8N_WEBHOOK_URL=https://your-n8n.com/webhook/...");
            return 1;
        }

        $this->info("📤 Gửi webhook đến: {$webhookUrl}");

        // Gửi webhook
        $result = $this->moderationService->sendToN8n($property, 'property.created');

        if ($result) {
            $this->info("✅ Webhook đã được gửi thành công!");
            $this->line("Kiểm tra n8n execution log để xem kết quả.");
        } else {
            $this->error("❌ Gửi webhook thất bại!");
            $this->line("Kiểm tra log: storage/logs/laravel.log");
        }

        return 0;
    }
}
