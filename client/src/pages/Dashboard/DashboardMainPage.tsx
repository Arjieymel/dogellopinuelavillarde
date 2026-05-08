import { useEffect, useState } from "react";
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
        document.title = "Dashboard";
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Delivered":
                return "text-green-700 font-semibold";
            case "Processing":
                return "text-yellow-700 font-semibold";
            case "Pending":
                return "text-blue-700 font-semibold";
            default:
                return "text-gray-700 font-semibold";
        }
    };

    return (
        <>
            <ToastMessage
                message={toastMessage}
                isVisible={toastMessageIsVisible}
                onClose={closeToastMessage}
            />

            <div className="space-y-4">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Water Refilling Management
                    </h1>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Total Customers</div>
                                <div className="text-3xl font-semibold text-blue-700">
                                    {loading ? <Spinner size="md" /> : data?.summary.totalCustomers ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Total Orders</div>
                                <div className="text-3xl font-semibold text-blue-700">
                                    {loading ? <Spinner size="md" /> : data?.summary.totalOrders ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Pending Deliveries</div>
                                <div className="text-3xl font-semibold text-blue-700">
                                    {loading ? <Spinner size="md" /> : data?.summary.pendingDeliveries ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancelled Orders Card */}
                    <div className="rounded-xl bg-white border border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-red-700 font-medium">Cancelled Orders</div>
                                <div className="text-3xl font-semibold text-red-700">
                                    {loading ? <Spinner size="md" /> : data?.summary.cancelledOrders ?? 0}
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 border border-red-200 text-red-700">
                                {/* X Circle */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M15 9l-6 6" />
                                    <path d="M9 9l6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>



                </div>

                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* DELIVERY STATUS */}
                    <div className="rounded-xl bg-gray-200 border border-gray-200 p-4 shadow-sm">
                        <h2 className="font-semibold text-gray-900">
                            Delivery Status Today
                        </h2>

                        <div className="mt-3 space-y-2">
                            {(data?.deliveryStatusSummary ?? []).map((row: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        {row.delivery_status}
                                    </span>
                                    <span className="font-semibold text-blue-700">
                                        {row.total}
                                    </span>
                                </div>
                            ))}

                            {!data?.deliveryStatusSummary?.length && !loading && (
                                <div className="text-sm text-gray-500">No data</div>
                            )}
                        </div>
                    </div>

                    {/* TODAY'S SALES (REPLACED TOP SELLING PRODUCTS) */}
                    <div className="rounded-xl bg-gray-200 border border-gray-200 p-4 shadow-sm">
                        <h2 className="font-semibold text-gray-900">
                            Today&apos;s Sales
                        </h2>

                        <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Total Sales
                                </span>

                                <span className="font-semibold text-blue-700">
                                    {loading ? (
                                        <Spinner size="sm" />
                                    ) : (
                                        Number(data?.summary.todaySales ?? 0).toFixed(2)
                                    )}
                                </span>
                            </div>

                            {!loading && (
                                <div className="text-xs text-gray-500 mt-2">
                                    Based on completed orders today
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RECENT ORDERS */}
                    <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                        <h2 className="font-semibold text-gray-900">
                            Recent Orders
                        </h2>

                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-sm">

                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="px-4 py-2 text-left">#</th>
                                        <th className="px-4 py-2 text-left">Customer</th>
                                        <th className="px-4 py-2 text-left">Product</th>
                                        <th className="px-4 py-2 text-left">Quantity</th>
                                        <th className="px-4 py-2 text-left">Total</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(data?.recentOrders ?? []).map((o, i) => (
                                        <tr key={o.order_id} className="border-b last:border-b-0">

                                            <td className="px-4 py-2">{i + 1}</td>

                                            <td className="px-4 py-2 text-gray-700">
                                                {o.customer?.fullname}
                                            </td>

                                            <td className="px-4 py-2 text-gray-700">
                                                {o.product?.product_name}
                                            </td>

                                            <td className="px-4 py-2 text-gray-700">
                                                {o.quantity}
                                            </td>

                                            <td className="px-4 py-2 text-gray-700">
                                                {Number(o.total_amount).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-2">
                                                <span className={getStatusColor(o.status)}>
                                                    {o.status}
                                                </span>
                                            </td>

                                        </tr>
                                    ))}

                                    {loading && (
                                        <tr>
                                            <td className="px-4 py-8 text-center" colSpan={6}>
                                                <Spinner size="md" />
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && (data?.recentOrders?.length ?? 0) === 0 && (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
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
        </>
    );
};

export default DashboardMainPage;