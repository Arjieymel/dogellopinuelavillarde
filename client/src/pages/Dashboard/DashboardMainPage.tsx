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

    return (
        <>
            <ToastMessage
                message={toastMessage}
                isVisible={toastMessageIsVisible}
                onClose={closeToastMessage}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Water Refilling Management</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white border border-gray-200 p-4  shadow-sm">
                        <div className="text-sm text-gray-500">Total Customers</div>
                        <div className="text-3xl font-semibold text-blue-700">
                            {loading ? <Spinner size="md" /> : data?.summary.totalCustomers ?? 0}
                        </div>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                        <div className="text-sm text-gray-500">Total Orders</div>
                        <div className="text-3xl font-semibold text-blue-700">
                            {loading ? <Spinner size="md" /> : data?.summary.totalOrders ?? 0}
                        </div>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                        <div className="text-sm text-gray-500">Pending Deliveries</div>
                        <div className="text-3xl font-semibold text-blue-700">
                            {loading ? <Spinner size="md" /> : data?.summary.pendingDeliveries ?? 0}
                        </div>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                        <div className="text-sm text-gray-500">Today's Sales</div>
                        <div className="text-3xl font-semibold text-blue-700">
                            {loading ? <Spinner size="md" /> : data?.summary.todaySales?.toFixed?.(2) ?? "0.00"}
                        </div>
                    </div>


                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Sales Chart</h2>
                            <span className="text-xs text-gray-500"></span>
                        </div>

                        <div className="mt-4">
                            {loading || !data ? (
                                <div className="py-12 flex justify-center">
                                    <Spinner size="lg" />
                                </div>
                            ) : (
                                <div className="h-64 flex items-end gap-2">
                                    {data.salesChart.values.map((v, idx) => {
                                        const max = Math.max(...data.salesChart.values, 1);
                                        const pct = (Number(v) / max) * 100;
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center justify-end">
                                                <div
                                                    className="w-full bg-blue-600 rounded-t-lg"
                                                    style={{ height: `${Math.max(6, pct)}%` }}
                                                    title={`${data.salesChart.labels[idx]}: ${v}`}
                                                />
                                                <div className="text-[10px] text-gray-500 mt-2 text-center">{data.salesChart.labels[idx]}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                        <h2 className="font-semibold text-gray-900">Delivery Status</h2>
                        <div className="mt-3 space-y-2">
                            {(data?.deliveryStatusSummary ?? []).map((row: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{row.delivery_status}</span>
                                    <span className="font-semibold text-blue-700">{row.total}</span>
                                </div>
                            ))}
                            {!data?.deliveryStatusSummary?.length && !loading && (
                                <div className="text-sm text-gray-500">No data</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <h2 className="font-semibold text-gray-900">Recent Orders</h2>
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
                                        <td className="px-4 py-2 text-gray-700">{o.customer?.fullname}</td>
                                        <td className="px-4 py-2 text-gray-700">{o.product?.product_name}</td>
                                        <td className="px-4 py-2 text-gray-700">{o.quantity}</td>
                                        <td className="px-4 py-2 text-gray-700">{Number(o.total_amount).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-green-700">{o.status}</td>
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
        </>
    );
};

export default DashboardMainPage;

