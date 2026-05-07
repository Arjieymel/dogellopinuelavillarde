<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dailySales()
    {
        $today = Carbon::today();

        $total = DB::table('tbl_orders')
            ->where('is_deleted', false)
            ->whereDate('created_at', $today)
            ->where('status', 'Delivered')
            ->sum('total_amount');

        return response()->json([
            'dailySales' => (float) $total,
        ], 200);
    }

    public function monthlySales(Request $request)
    {
        $month = (int) $request->input('month', Carbon::today()->month);
        $year = (int) $request->input('year', Carbon::today()->year);

        $total = DB::table('tbl_orders')
            ->where('is_deleted', false)
            ->where('status', 'Delivered')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->sum('total_amount');

        return response()->json([
            'monthlySales' => (float) $total,
            'month' => $month,
            'year' => $year,
        ], 200);
    }

    public function totals()
    {
        $totalIncome = DB::table('tbl_orders')
            ->where('is_deleted', false)
            ->where('status', 'Delivered')
            ->sum('total_amount');

        $totalDeliveredOrders = DB::table('tbl_orders')
            ->where('is_deleted', false)
            ->where('status', 'Delivered')
            ->count();

        return response()->json([
            'totalIncome' => (float) $totalIncome,
            'totalDeliveredOrders' => $totalDeliveredOrders,
        ], 200);
    }
}

