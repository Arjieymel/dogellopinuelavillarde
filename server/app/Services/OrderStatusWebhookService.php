<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrderStatusWebhookService
{
    private const N8N_DEFAULT_WEBHOOK_URL = 'http://localhost:5678/webhook-test/order-status';

    /**
     * Send order status updates to n8n webhook.
     *
     * Payload schema (required):
     * - order_id
     * - order_status (Pending, Processing, Delivered, Cancelled)
     * - event_type (created, confirmed, delivered, cancelled)
     * - customer_name
     * - customer_email
     * - product_name
     * - quantity
     * - total_amount
     */
    public function sendOrderStatus(Order $order, string $eventType): void
    {
        $webhookUrl = env('N8N_WEBHOOK_URL', self::N8N_DEFAULT_WEBHOOK_URL);

        // Ensure relations are loaded
        $order->loadMissing(['customer', 'product']);

        $normalizedEventType = $this->normalizeAndValidateEventType($eventType);

        $payload = $this->buildPayload($order, $normalizedEventType);
        if ($payload === null) {
            // buildPayload already logged a warning with details
            return;
        }

        Log::info('[n8n-webhook] Sending webhook request.', [
            'order_id' => $order->order_id,
            'event_type' => $normalizedEventType,
            'webhook_url' => $webhookUrl,
            'payload' => $payload,
        ]);

        try {
            $response = Http::timeout(10)
                ->retry(3, 500)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($webhookUrl, $payload);

            if (!$response->successful()) {
                Log::error('[n8n-webhook] Non-success response from n8n.', [
                    'order_id' => $order->order_id,
                    'event_type' => $normalizedEventType,
                    'http_status' => $response->status(),
                    'body' => $response->body(),
                ]);
            } else {
                Log::info('[n8n-webhook] Webhook delivered successfully.', [
                    'order_id' => $order->order_id,
                    'event_type' => $normalizedEventType,
                    'http_status' => $response->status(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('[n8n-webhook] Failed to send webhook.', [
                'order_id' => $order->order_id,
                'event_type' => $normalizedEventType,
                'webhook_url' => $webhookUrl,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function buildPayload(Order $order, string $eventType): ?array
    {
        $customer = $order->customer;
        $product = $order->product;

        $customerEmail = $customer?->email;
        $customerName = $customer?->fullname;
        $productName = $product?->product_name;

        // Strict required fields (per requirements). If missing, skip + log.
        if (!$customerEmail || !$customerName) {
            Log::warning('[n8n-webhook] Missing customer_name/customer_email. Skipping notification.', [
                'order_id' => $order->order_id,
                'event_type' => $eventType,
                'customer_email' => $customerEmail,
                'customer_name' => $customerName,
            ]);

            return null;
        }

        if (!$productName) {
            Log::warning('[n8n-webhook] Missing product_name. Skipping notification.', [
                'order_id' => $order->order_id,
                'event_type' => $eventType,
            ]);

            return null;
        }

        return [
            'order_id' => $order->order_id,
            'event_type' => $eventType,
            'order_status' => $this->mapEventTypeToOrderStatus($eventType),
            'customer_name' => $customerName,
            'customer_email' => $customerEmail,
            'product_name' => $productName,
            'quantity' => (int) $order->quantity,
            'total_amount' => $order->total_amount,
        ];
    }

    private function normalizeAndValidateEventType(string $eventType): string
    {
        $normalized = strtolower(trim($eventType));

        $allowed = ['created', 'confirmed', 'delivered', 'cancelled'];
        if (!in_array($normalized, $allowed, true)) {
            Log::warning('[n8n-webhook] Invalid event_type provided. Using default: created.', [
                'event_type' => $eventType,
            ]);

            return 'created';
        }

        return $normalized;
    }

    private function mapEventTypeToOrderStatus(string $eventType): string
    {
        return match ($eventType) {
            'created' => 'Pending',
            'confirmed' => 'Processing',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            default => 'Pending',
        };
    }
}




