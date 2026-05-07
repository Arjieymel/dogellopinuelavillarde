import type { CustomerColumns } from "./CustomerInterface";
import type { ProductColumns } from "./ProductInterface";

export type OrderStatus = "Pending" | "Processing" | "Delivered";

export type OrderColumns = {
    order_id: number;
    customer_id: number;
    product_id: number;
    quantity: number;
    total_amount: number | string;
    status: OrderStatus;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    customer?: CustomerColumns;
    product?: ProductColumns;
};

export type OrderFieldErrors = {
    customer_id?: string[];
    product_id?: string[];
    quantity?: string[];
    status?: string[];
};

