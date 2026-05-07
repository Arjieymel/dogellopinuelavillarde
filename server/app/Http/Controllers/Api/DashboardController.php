<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
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
            ->where('delivery_status', 'Pending')
            ->count();

        $today = Carbon::today();

        $todaySales = DB::table('tbl_orders')
            ->where('is_deleted', false)
            ->whereDate('created_at', $today)
            ->sum('total_amount');

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
            $values[] = DB::table('tbl_orders')
                ->where('is_deleted', false)
                ->whereDate('created_at', $day)
                ->sum('total_amount');
        }

        $recentOrders = Order::with(['customer', 'product', 'delivery'])
            ->where('is_deleted', false)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        $deliveryStatusSummary = DB::table('tbl_deliveries')
            ->where('is_deleted', false)
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

