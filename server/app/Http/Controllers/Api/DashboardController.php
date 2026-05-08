<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $totalCustomers = DB::table('tbl_customers')->where('is_deleted', false)->count();
        $totalOrders = DB::table('tbl_orders')->where('is_deleted', false)->count();

        $pendingDeliveries = DB::table('tbl_deliveries')
            ->where('is_deleted', false)
            ->where('is_archived', false)
            ->where('delivery_status', 'Pending')
            ->count();

        $today = Carbon::today();

        // ============================
        // Revenue / sales eligibility
        // ============================
        // - Exclude archived orders/deliveries
        // - Exclude cancelled orders OR cancelled deliveries
        // - Only include successfully completed/delivered orders
        $eligibleOrderStatus = ['Delivered', 'Completed'];

        // Build a base query that represents a "successful sale".
        // We require a Delivered delivery row and a non-cancelled order.
        $salesQueryBase = DB::table('tbl_orders')
            ->join('tbl_deliveries', 'tbl_deliveries.order_id', '=', 'tbl_orders.order_id')
            ->where('tbl_orders.is_deleted', false)
            ->where('tbl_orders.is_archived', false)
            ->whereIn('tbl_orders.status', $eligibleOrderStatus)
            ->where('tbl_deliveries.is_deleted', false)
            ->where('tbl_deliveries.is_archived', false)
            ->whereNot('tbl_orders.status', 'Cancelled')
            ->whereNot('tbl_deliveries.delivery_status', 'Cancelled')
            ->where('tbl_deliveries.delivery_status', 'Delivered');

        $todaySales = (clone $salesQueryBase)
            ->whereDate('tbl_orders.created_at', $today)
            ->sum('tbl_orders.total_amount');

        // Available gallons: treat 5 Gallon Water stock * 5.
        $fiveGallonStock = Product::where('is_deleted', false)
            ->where('product_name', '5 Gallon Water')
            ->value('stock') ?? 0;

        $availableGallons = (int) $fiveGallonStock * 5;

        $lowStockThreshold = (int) $request->input('low_stock_threshold', 10);
        $lowStocks = Product::where('is_deleted', false)
            ->where('stock', '<=', $lowStockThreshold)
            ->count();

        // Sales chart for last 7 days (by order creation date)
        $labels = [];
        $values = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $labels[] = $day->format('M d');
            $values[] = (clone $salesQueryBase)
                ->whereDate('tbl_orders.created_at', $day)
                ->sum('tbl_orders.total_amount');
        }

        // Recent orders list: exclude cancelled + archived.
        $recentOrders = Order::with(['customer', 'product', 'delivery'])
            ->where('is_deleted', false)
            ->where('is_archived', false)
            ->whereIn('status', $eligibleOrderStatus)
            ->where('status', '!=', 'Cancelled')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // Cancelled orders count:
        // - Count ALL cancelled orders INCLUDING archived ones
        // - Count an order as cancelled if:
        //      tbl_orders.status = 'Cancelled'
        //      OR tbl_deliveries.delivery_status = 'Cancelled'
        // - Exclude only permanently deleted records.
        $cancelledOrders = DB::table('tbl_orders')
            ->leftJoin('tbl_deliveries', 'tbl_deliveries.order_id', '=', 'tbl_orders.order_id')
            ->where('tbl_orders.is_deleted', false)
            ->where(function ($q) {
                $q->where('tbl_orders.status', 'Cancelled')
                    ->orWhere('tbl_deliveries.delivery_status', 'Cancelled');
            })
            ->where(function ($q) {
                $q->whereNull('tbl_deliveries.delivery_id')
                    ->orWhere('tbl_deliveries.is_deleted', false);
            })
            ->distinct('tbl_orders.order_id')
            ->count('tbl_orders.order_id');


        $deliveryStatusSummary = DB::table('tbl_deliveries')
            ->where('is_deleted', false)
            ->where('is_archived', false)
            ->whereNot('delivery_status', 'Cancelled')
            ->select('delivery_status', DB::raw('count(*) as total'))
            ->groupBy('delivery_status')
            ->get();

        return response()->json([
            'summary' => [
                'totalCustomers' => $totalCustomers,
                'totalOrders' => $totalOrders,
                'pendingDeliveries' => $pendingDeliveries,
                'todaySales' => (float) $todaySales,
                'availableGallons' => $availableGallons,
                'lowStocks' => $lowStocks,
                'cancelledOrders' => (int) $cancelledOrders,
            ],
            'salesChart' => [
                'labels' => $labels,
                'values' => $values,
            ],
            'recentOrders' => $recentOrders,
            'deliveryStatusSummary' => $deliveryStatusSummary,
        ], 200);
    }
}


