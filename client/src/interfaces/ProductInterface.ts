export type ProductColumns = {
    product_id: number;
    product_name: string;
    price: number | string;
    stock: number;
    description?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
};

export type ProductFieldErrors = {
    product_name?: string[];
    price?: string[];
    stock?: string[];
    description?: string[];
};

