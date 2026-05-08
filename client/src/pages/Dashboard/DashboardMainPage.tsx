import { useEffect, useMemo, useState } from "react";
import { Droplets, LayoutGrid, BadgeCheck, XCircle, CircleDotDashed, DollarSign } from "lucide-react";

import DashboardService from "../../Services/DashboardService";
import Spinner from "../../components/Spinner/Spinner";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import type { DashboardSummaryResponse } from "../../interfaces/DashboardInterface";

const DashboardMainPage = () => {
    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage,
    } = useToastMessage("", false, false);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DashboardSummaryResponse | null>(null);

    useEffect(() => {
        document.title = "Water Refilling Management";
    }, []);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const res = await DashboardService.summary();
                if (res.status >= 200 && res.status < 300) {
                    setData(res.data as DashboardSummaryResponse);
                } else {
                    showToastMessage("Failed to load dashboard.");
                }
            } catch {
                showToastMessage("Failed to load dashboard.");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [showToastMessage]);

    const deliveryCounts = useMemo(() => {
        const delivered = data?.deliveryStatusSummary?.find((x) => x.delivery_status === "Delivered")?.total;
        return {
            delivered: typeof delivered === "string" ? Number(delivered) : (delivered ?? 0),
            cancelled: data?.summary.cancelledOrders ?? 0,
        };
    }, [data]);

    const statCards = [
        {
            label: "Total Customers",
            value: loading ? null : data?.summary.totalCustomers ?? 0,
            iconBg: "bg-cyan-50 border-cyan-100 text-cyan-700",
            icon: LayoutGrid,
        },
        {
            label: "Total Orders",
            value: loading ? null : data?.summary.totalOrders ?? 0,
            iconBg: "bg-blue-50 border-blue-100 text-blue-700",
            icon: Droplets,
        },
        {
            label: "Pending Deliveries",
            value: loading ? null : data?.summary.pendingDeliveries ?? 0,
            iconBg: "bg-indigo-50 border-indigo-100 text-indigo-700",
            icon: CircleDotDashed,
        },
    ];

    const getBadge = (status: string) => {
        const normalized = status.trim();
        if (normalized === "Delivered") {
            return "bg-green-50 text-green-700 border-green-200";
        }
        if (normalized === "Cancelled" || normalized === "Canceled") {
            return "bg-red-50 text-red-700 border-red-200";
        }
        if (normalized === "Pending") {
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
        }
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    };

    return (
        <>
            <ToastMessage message={toastMessage} isVisible={toastMessageIsVisible} onClose={closeToastMessage} />

            <div className="min-h-[calc(100vh-5rem)]">
                {/* Page shell */}
                <div className="rounded-2xl bg-gradient-to-b from-blue-600/10 via-cyan-600/5 to-transparent border border-blue-200/60 p-5 sm:p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Water Refilling Management</h1>
                            <p className="text-sm text-gray-600 mt-1">Overview of customers, orders, deliveries and sales.</p>
                        </div>
                    </div>

                    {/* Top cards */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {statCards.map((c) => {
                            const Icon = c.icon;
                            return (
                                <div
                                    key={c.label}
                                    className="group rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-5"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">{c.label}</p>
                                            <div className="text-3xl font-bold text-blue-700">
                                                {loading ? <Spinner size="md" /> : c.value}
                                            </div>
                                        </div>
                                        <div
                                            className={`w-12 h-12 rounded-full border flex items-center justify-center ${c.iconBg} transition-colors group-hover:scale-105`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main sections */}
                    <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Delivery Status */}
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-gray-900">Delivery Status</h2>
                                    <p className="text-sm text-gray-600 mt-1">Counts from recent deliveries</p>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-green-700">Delivered</p>
                                        <BadgeCheck className="w-5 h-5 text-green-700" />
                                    </div>
                                    <div className="mt-2 text-3xl font-extrabold text-green-700">
                                        {loading ? <Spinner size="sm" /> : deliveryCounts.delivered}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-red-700">Cancelled</p>
                                        <XCircle className="w-5 h-5 text-red-700" />
                                    </div>
                                    <div className="mt-2 text-3xl font-extrabold text-red-700">
                                        {loading ? <Spinner size="sm" /> : deliveryCounts.cancelled}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today Sales */}
                        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm hover:shadow-lg transition-shadow p-5 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl" />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/90">Today&apos;s Sales</p>
                                        <p className="text-xs text-white/75 mt-1">Based on completed orders today</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />

                                    </div>
                                </div>
                                <div className="mt-4 text-4xl font-extrabold tracking-tight">
                                    {loading ? <Spinner size="md" /> : `₱ ${Number(data?.summary.todaySales ?? 0).toFixed(2)}`}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Table */}
                        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-gray-900">Recent Orders</h2>
                            </div>

                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">#</th>
                                            <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                            <th className="px-4 py-3 text-left font-semibold">Product</th>
                                            <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                                            <th className="px-4 py-3 text-left font-semibold">Total</th>
                                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(data?.recentOrders ?? []).map((o, idx) => (
                                            <tr
                                                key={o.order_id}
                                                className="hover:bg-blue-50/50 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-gray-800">{idx + 1}</td>
                                                <td className="px-4 py-3 text-gray-800">{o.customer?.fullname ?? "-"}</td>
                                                <td className="px-4 py-3 text-gray-800">{o.product?.product_name ?? "-"}</td>
                                                <td className="px-4 py-3 text-gray-800">{o.quantity}</td>
                                                <td className="px-4 py-3 text-gray-800">{Number(o.total_amount).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${getBadge(o.status)}`}
                                                    >
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {loading && (
                                            <tr>
                                                <td className="px-4 py-10 text-center" colSpan={6}>
                                                    <Spinner size="md" />
                                                </td>
                                            </tr>
                                        )}

                                        {!loading && (data?.recentOrders?.length ?? 0) === 0 && (
                                            <tr>
                                                <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                                                    No recent orders
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardMainPage;

