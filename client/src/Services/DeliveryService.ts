import AxiosInstance from "./AxiosInstance";

export type DeliveryPayload = {
    order_id: number;
    driver_name: string;
    delivery_date: string; // YYYY-MM-DD
    delivery_status: "Pending" | "Out for Delivery" | "Delivered";
};

export type DeliveryUpdatePayload = {
    driver_name: string;
    delivery_date: string;
    delivery_status: "Pending" | "Out for Delivery" | "Delivered";
};

const DeliveryService = {
    loadDeliveries: async (page: number, search?: string) => {
        // Backend doesn't require page but uses paginate(15), so we pass page.
        return AxiosInstance.get(
            search
                ? `/deliveries/loadDeliveries?page=${page}&search=${encodeURIComponent(search)}`
                : `/deliveries/loadDeliveries?page=${page}`
        );
    },

    storeDelivery: async (data: DeliveryPayload) => {
        return AxiosInstance.post("/deliveries/storeDelivery", data);
    },

    getDelivery: async (deliveryId: string | number) => {
        return AxiosInstance.get(`/deliveries/getDelivery/${deliveryId}`);
    },

    updateDelivery: async (deliveryId: string | number, data: DeliveryUpdatePayload) => {
        return AxiosInstance.put(`/deliveries/updateDelivery/${deliveryId}`, data);
    },

    cancelDelivery: async (deliveryId: string | number) => {
        return AxiosInstance.put(`/deliveries/cancelDelivery/${deliveryId}`, {});
    },

    archiveDelivery: async (deliveryId: string | number) => {
        return AxiosInstance.put(`/deliveries/archiveDelivery/${deliveryId}`, {});
    },
};

export default DeliveryService;


