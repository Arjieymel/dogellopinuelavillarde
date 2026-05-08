<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    public function cancelDelivery(Request $request, Delivery $delivery)
    {
        $request->validate([
            'delivery_status' => ['sometimes', 'string'],
        ]);

        try {
            DB::transaction(function () use ($delivery) {
                $current = $delivery->delivery_status;

                if ($current === 'Delivered') {
                    throw new \Exception('Cannot cancel a delivered delivery.');
                }

                if ($current === 'Cancelled') {
                    throw new \Exception('Delivery is already cancelled.');
                }

                if (!in_array($current, ['Pending', 'Out for Delivery'], true)) {
                    throw new \Exception('Delivery cannot be cancelled in its current status.');
                }

                $delivery->update(['delivery_status' => 'Cancelled']);

                $order = $delivery->order;
                if ($order) {
                    $order->update(['status' => 'Cancelled']);
                }
            });
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $delivery->refresh();

        return response()->json([
            'delivery' => $delivery->fresh('order'),
            'message' => 'Delivery cancelled successfully.',
        ], 200);
    }

    public function loadDeliveries(Request $request)
    {
        $search = $request->input('search');
        $archived = $request->boolean('archived', false);

        $deliveries = Delivery::query()
            ->with(['order.customer', 'order.product'])
            ->where('tbl_deliveries.is_deleted', false)
            ->where('tbl_deliveries.is_archived', $archived)
            ->orderBy('tbl_deliveries.delivery_date', 'desc');

        if ($search) {
            $deliveries->where(function ($q) use ($search) {
                $q->where('driver_name', 'like', "%{$search}%")
                    ->orWhere('delivery_status', 'like', "%{$search}%")
                    ->orWhereHas('order.customer', function ($qc) use ($search) {
                        $qc->where('fullname', 'like', "%{$search}%")
                           ->orWhere('contact_number', 'like', "%{$search}%");
                    });
            });
        }

        $deliveries = $deliveries->paginate(15);

        return response()->json(['deliveries' => $deliveries], 200);
    }

    public function storeDelivery(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:tbl_orders,order_id'],
            'driver_name' => ['required', 'string', 'max:100'],
            'delivery_date' => ['required', 'date'],
            'delivery_status' => ['required', 'in:Pending,Out for Delivery,Delivered'],
        ]);

        DB::transaction(function () use ($validated) {
            Delivery::create([
                'order_id' => $validated['order_id'],
                'driver_name' => $validated['driver_name'],
                'delivery_date' => $validated['delivery_date'],
                'delivery_status' => $validated['delivery_status'],
            ]);

            $order = Order::find($validated['order_id']);
            if ($order) {
                $mapped = $validated['delivery_status'] === 'Delivered' ? 'Delivered' : 'Processing';
                $order->update(['status' => $mapped]);
            }
        });

        return response()->json(['message' => 'Delivery Successfully Created.'], 200);
    }

    public function updateDelivery(Request $request, Delivery $delivery)
    {
        $validated = $request->validate([
            'driver_name' => ['required', 'string', 'max:100'],
            'delivery_date' => ['required', 'date'],
            'delivery_status' => ['required', 'in:Pending,Out for Delivery,Delivered'],
        ]);

        DB::transaction(function () use ($delivery, $validated) {
            $delivery->update([
                'driver_name' => $validated['driver_name'],
                'delivery_date' => $validated['delivery_date'],
                'delivery_status' => $validated['delivery_status'],
            ]);

            $order = $delivery->order;
            if ($order) {
                $mapped = $validated['delivery_status'] === 'Delivered' ? 'Delivered' : 'Processing';
                $order->update(['status' => $mapped]);
            }
        });

        return response()->json([
            'delivery' => $delivery->fresh('order'),
            'message' => 'Delivery Successfully Updated.',
        ], 200);
    }

    public function archiveDelivery(Request $request, Delivery $delivery)
    {
        $current = $delivery->delivery_status;

        if (!in_array($current, ['Delivered', 'Cancelled'], true)) {
            return response()->json(['message' => 'Only delivered or cancelled deliveries can be archived.'], 422);
        }

        $delivery->update(['is_archived' => true]);

        $order = $delivery->order;
        if ($order) {
            // Keep order status consistent for history/reporting
            if ($current === 'Cancelled') {
                $order->update(['status' => 'Cancelled']);
            }
        }

        return response()->json([
            'delivery' => $delivery->fresh('order'),
            'message' => 'Delivery archived successfully.',
        ], 200);
    }

    public function getDelivery($deliveryId)
    {
        $delivery = Delivery::with(['order.customer', 'order.product'])
            ->where('delivery_id', $deliveryId)
            ->where('is_deleted', false)
            ->first();

        return response()->json(['delivery' => $delivery], 200);
    }
}

