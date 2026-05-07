import type { OrderColumns } from "./OrderInterface";

export type DashboardSummaryResponse = {
    summary: {
        totalCustomers: number;
        totalOrders: number;
        pendingDeliveries: number;
        todaySales: number;
        availableGallons: number;
        lowStocks: number;
    };
    salesChart: {
        labels: string[];
        values: number[];
    };
    recentOrders: OrderColumns[];
    deliveryStatusSummary: Array<{ delivery_status: string; total: number | string }>;
};

