<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function cancelOrder(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'string'],
        ]);

        $current = $order->status;

        if ($current === 'Delivered') {
            return response()->json(['message' => 'Cannot cancel a delivered order.'], 422);
        }

        if ($current === 'Cancelled') {
            return response()->json(['message' => 'Order is already cancelled.'], 422);
        }

        if (!in_array($current, ['Pending', 'Processing'], true)) {
            return response()->json(['message' => 'Order cannot be cancelled in its current status.'], 422);
        }

        $order->update(['status' => 'Cancelled']);

        return response()->json([
            'order' => $order->fresh(),
            'message' => 'Order cancelled successfully.',
        ], 200);
    }

    public function loadOrders(Request $request)
    {
        $search = $request->input('search');
        $archived = $request->boolean('archived', false);

        $orders = Order::query()
            ->with(['customer', 'product'])
            ->where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.is_archived', $archived)
            ->orderBy('tbl_orders.created_at', 'desc');

        if ($search) {
            $orders->where(function ($q) use ($search) {
                $q->where('tbl_orders.status', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($qc) use ($search) {
                        $qc->where('fullname', 'like', "%{$search}%")
                           ->orWhere('contact_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('product', function ($qp) use ($search) {
                        $qp->where('product_name', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $orders->paginate(15);

        return response()->json([
            'orders' => $orders,
        ], 200);
    }

    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:tbl_customers,customer_id'],
            'product_id' => ['required', 'integer', 'exists:tbl_products,product_id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $customer = Customer::where('customer_id', $validated['customer_id'])
            ->where('is_deleted', false)
            ->first();

        $product = Product::where('product_id', $validated['product_id'])
            ->where('is_deleted', false)
            ->first();

        if (!$customer || !$product) {
            return response()->json(['message' => 'Invalid customer or product.'], 422);
        }

        if ((int) $product->stock < (int) $validated['quantity']) {
            return response()->json(['message' => 'Insufficient stock.'], 422);
        }

        $quantity = (int) $validated['quantity'];
        $totalAmount = (float) $product->price * $quantity;

        DB::transaction(function () use ($validated, $quantity, $totalAmount, $product) {
            // Decrement stock on order creation (as confirmed)
            $product->decrement('stock', $quantity);

            Order::create([
                'customer_id' => $validated['customer_id'],
                'product_id' => $validated['product_id'],
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'status' => 'Pending',
            ]);
        });

        return response()->json([
            'message' => 'Order Successfully Created.',
        ], 200);
    }

    public function getOrder($orderId)
    {
        $order = Order::with(['customer', 'product', 'delivery'])
            ->where('order_id', $orderId)
            ->where('is_deleted', false)
            ->first();

        return response()->json(['order' => $order], 200);
    }

    public function archiveOrder(Request $request, Order $order)
    {
        $current = $order->status;

        if (!in_array($current, ['Delivered', 'Cancelled'], true)) {
            return response()->json(['message' => 'Only delivered or cancelled orders can be archived.'], 422);
        }

        $order->update(['is_archived' => true]);

        return response()->json([
            'order' => $order->fresh(),
            'message' => 'Order archived successfully.',
        ], 200);
    }

    public function updateOrder(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Pending,Processing,Delivered'],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'order' => $order->fresh(),
            'message' => 'Order Successfully Updated.',
        ], 200);
    }
}

