import type { OrderColumns } from "./OrderInterface";

export type DeliveryStatus = "Pending" | "Out for Delivery" | "Delivered";

export type DeliveryColumns = {
    delivery_id: number;
    order_id: number;
    driver_name: string;
    delivery_date: string;
    delivery_status: DeliveryStatus;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    order?: OrderColumns;
};

export type DeliveryFieldErrors = {
    order_id?: string[];
    driver_name?: string[];
    delivery_date?: string[];
    delivery_status?: string[];
};

