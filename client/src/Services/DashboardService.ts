import AxiosInstance from "./AxiosInstance";

const DashboardService = {
    summary: async () => {
        return AxiosInstance.get("/dashboard/summary");
    },
};

export default DashboardService;

