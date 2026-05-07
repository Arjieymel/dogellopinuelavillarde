import { useEffect, useMemo, useState } from "react";

import Spinner from "../../components/Spinner/Spinner";
import ToastMessage from "../../components/ToastMessage/ToastMessage";

import { useToastMessage } from "../../hooks/useToastMessage";
import ReportService, { } from "../../Services/ReportService";
import type { DailyMonthlySalesResponse, TotalsResponse } from "../../interfaces/ReportInterface";

const formatCurrency = (value: number) => {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `$${value.toFixed(2)}`;
    }
};

const ReportsMainPage = () => {
    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        closeToastMessage,
    } = useToastMessage("", false, false);

    const [loading, setLoading] = useState(false);

    const now = useMemo(() => new Date(), []);
    const [month, setMonth] = useState<number>(now.getMonth() + 1);
    const [year, setYear] = useState<number>(now.getFullYear());

    const [dailySales, setDailySales] = useState<number>(0);
    const [monthlySales, setMonthlySales] = useState<number>(0);

    const [totals, setTotals] = useState<TotalsResponse>({
        totalIncome: 0,
        totalDeliveredOrders: 0,
    });

    const loadAll = async () => {
        setLoading(true);
        try {
            const [dailyRes, monthlyRes, totalsRes] = await Promise.all([
                ReportService.dailySales(),
                ReportService.monthlySales(month, year),
                ReportService.totals(),
            ]);

            if (dailyRes.status >= 200 && dailyRes.status < 300) {
                const d: DailyMonthlySalesResponse = dailyRes.data;
                setDailySales(Number(d.dailySales ?? 0));
            }

            if (monthlyRes.status >= 200 && monthlyRes.status < 300) {
                const m: DailyMonthlySalesResponse = monthlyRes.data;
                setMonthlySales(Number(m.monthlySales ?? 0));
            }

            if (totalsRes.status >= 200 && totalsRes.status < 300) {
                const t: TotalsResponse = totalsRes.data;
                setTotals({
                    totalIncome: Number(t.totalIncome ?? 0),
                    totalDeliveredOrders: Number(t.totalDeliveredOrders ?? 0),
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Reports";
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApply = async () => {
        await loadAll();
    };

    return (
        <>
            <ToastMessage message={toastMessage} isVisible={toastMessageIsVisible} onClose={closeToastMessage} />

            <div className="p-4">
                <div className="text-2xl font-semibold text-gray-900">Reports</div>
                <div className="mt-2 text-gray-600">Sales and delivered orders statistics.</div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-600">Daily Sales (Delivered)</div>
                        <div className="mt-2 text-2xl font-semibold text-gray-900">
                            {loading ? <Spinner size="sm" /> : formatCurrency(dailySales)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-600">Monthly Sales (Delivered)</div>
                        <div className="mt-2 text-2xl font-semibold text-gray-900">
                            {loading ? <Spinner size="sm" /> : formatCurrency(monthlySales)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-600">Total Delivered Orders</div>
                        <div className="mt-2 text-2xl font-semibold text-gray-900">
                            {loading ? <Spinner size="sm" /> : totals.totalDeliveredOrders}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                        <div>
                            <div className="text-sm font-medium text-gray-700">Monthly filters</div>
                            <div className="mt-1 text-xs text-gray-500">Uses Delivered orders only.</div>
                        </div>

                        <div className="flex gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Month</label>
                                <select
                                    className="mt-1 w-36 border border-gray-300 rounded-lg px-3 py-2"
                                    value={String(month)}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                >
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        const m = i + 1;
                                        return (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Year</label>
                                <select
                                    className="mt-1 w-36 border border-gray-300 rounded-lg px-3 py-2"
                                    value={String(year)}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                >
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const y = now.getFullYear() - i;
                                        return (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <button
                                type="button"
                                className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition cursor-pointer"
                                onClick={handleApply}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Apply"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-600">Total Income (Delivered)</div>
                            <div className="mt-1 text-xl font-semibold text-gray-900">
                                {loading ? <Spinner size="sm" /> : formatCurrency(totals.totalIncome)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Delivered orders count</div>
                            <div className="mt-1 text-xl font-semibold text-gray-900">
                                {loading ? <Spinner size="sm" /> : totals.totalDeliveredOrders}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportsMainPage;

