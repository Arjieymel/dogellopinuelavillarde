export type CustomerColumns = {
    customer_id: number;
    fullname: string;
    contact_number: string;
    email?: string | null;
    address?: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
};

export type CustomerFieldErrors = {
    fullname?: string[];
    contact_number?: string[];
    email?: string[];
    address?: string[];
};



