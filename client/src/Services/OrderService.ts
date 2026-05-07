import AxiosInstance from "./AxiosInstance";

export type OrderPayload = {
    customer_id: number;
    product_id: number;
    quantity: number;
};

export type OrderUpdatePayload = {
    status: "Pending" | "Processing" | "Delivered";
};

const OrderService = {
    loadOrders: async (page: number, search?: string) => {
        return AxiosInstance.get(
            search
                ? `/orders/loadOrders?page=${page}&search=${encodeURIComponent(search)}`
                : `/orders/loadOrders?page=${page}`
        );
    },

    storeOrder: async (data: OrderPayload) => {
        return AxiosInstance.post("/orders/storeOrder", data);
    },

    getOrder: async (orderId: string | number) => {
        return AxiosInstance.get(`/orders/getOrder/${orderId}`);
    },

    updateOrder: async (orderId: string | number, data: OrderUpdatePayload) => {
        return AxiosInstance.put(`/orders/updateOrder/${orderId}`, data);
    },
};

export default OrderService;

