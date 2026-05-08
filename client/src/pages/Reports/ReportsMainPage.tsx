import { useEffect, useMemo, useState } from "react";

import { Droplets, LayoutGrid, BadgeCheck, XCircle, CircleDotDashed, DollarSign } from "lucide-react";

import Spinner from "../../components/Spinner/Spinner";
import ToastMessage from "../../components/ToastMessage/ToastMessage";

import { useToastMessage } from "../../hooks/useToastMessage";
import ReportService from "../../Services/ReportService";
import type { DailyMonthlySalesResponse, TotalsResponse } from "../../interfaces/ReportInterface";

const formatCurrency = (value: number) => {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "PHP",
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
        document.title = "Reports Management";
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApply = async () => {
        await loadAll();
    };

    const statCards = [
        {
            label: "Daily Delivered Sales",
            value: loading ? null : formatCurrency(dailySales),
            iconBg: "bg-cyan-50 border-cyan-100 text-cyan-700",
            icon: Droplets,
        },
        {
            label: "Monthly Delivered Sales",
            value: loading ? null : formatCurrency(monthlySales),
            iconBg: "bg-blue-50 border-blue-100 text-blue-700",
            icon: LayoutGrid,
        },
        {
            label: "Total Delivered Orders",
            value: loading ? null : totals.totalDeliveredOrders,
            iconBg: "bg-indigo-50 border-indigo-100 text-indigo-700",
            icon: CircleDotDashed,
        },
    ];

    return (
        <>
            <ToastMessage message={toastMessage} isVisible={toastMessageIsVisible} onClose={closeToastMessage} />

            <div className="min-h-[calc(100vh-5rem)]">
                <div className="rounded-2xl bg-linear-to-b from-blue-600/10 via-cyan-600/5 to-transparent border border-blue-200/60 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Reports Management</h1>
                            <p className="text-sm text-gray-600 mt-1">Track delivered sales and order totals.</p>
                        </div>
                    </div>

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

                    <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-bold text-gray-900">Monthly Filters</h2>
                                    <p className="text-sm text-gray-600 mt-1">Uses Delivered data only.</p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Month</label>
                                    <select
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                            </div>

                            <div className="mt-4 flex items-center justify-end">
                                <button
                                    type="button"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleApply}
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Apply"}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-linear-to-br from-green-500 to-green-600 text-white shadow-sm hover:shadow-lg transition-shadow p-5 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl" />
                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-bold">Report Totals</h2>
                                        <p className="text-sm text-white/75 mt-1">Across all delivered orders.</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-white/90">Total Income</p>
                                            <BadgeCheck className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="mt-2 text-3xl font-extrabold tracking-tight">
                                            {loading ? <Spinner size="md" /> : formatCurrency(totals.totalIncome)}
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-white/90">Delivered Orders</p>
                                            <XCircle className="w-5 h-5 text-white/90 opacity-80" />
                                        </div>
                                        <div className="mt-2 text-3xl font-extrabold tracking-tight">
                                            {loading ? <Spinner size="md" /> : totals.totalDeliveredOrders}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                        Tip: Use Month/Year filters to update daily & monthly delivered sales.
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportsMainPage;


