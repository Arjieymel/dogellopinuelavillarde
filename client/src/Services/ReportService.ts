import AxiosInstance from "./AxiosInstance";

const ReportService = {
    dailySales: async () => {
        return AxiosInstance.get("/reports/dailySales");
    },

    monthlySales: async (month?: number, year?: number) => {
        const params = new URLSearchParams();
        if (typeof month === "number") params.set("month", String(month));
        if (typeof year === "number") params.set("year", String(year));

        const qs = params.toString();
        return AxiosInstance.get(qs ? `/reports/monthlySales?${qs}` : "/reports/monthlySales");
    },

    totals: async () => {
        return AxiosInstance.get("/reports/totals");
    },
};

export default ReportService;

