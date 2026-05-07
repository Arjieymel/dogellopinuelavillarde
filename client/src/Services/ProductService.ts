import AxiosInstance from "./AxiosInstance";

export type ProductPayload = {
    product_name: string;
    price: number;
    stock: number;
    description?: string;
};

const ProductService = {
    loadProducts: async (page: number, search?: string) => {
        return AxiosInstance.get(
            search
                ? `/products/loadProducts?page=${page}&search=${encodeURIComponent(search)}`
                : `/products/loadProducts?page=${page}`
        );
    },

    storeProduct: async (data: ProductPayload) => {
        return AxiosInstance.post("/products/storeProduct", data);
    },

    getProduct: async (productId: string | number) => {
        return AxiosInstance.get(`/products/getProduct/${productId}`);
    },

    updateProduct: async (productId: string | number, data: ProductPayload) => {
        return AxiosInstance.put(`/products/updateProduct/${productId}`, data);
    },

    destroyProduct: async (productId: string | number) => {
        return AxiosInstance.put(`/products/destroyProduct/${productId}`);
    },

    lowStockCount: async (threshold?: number) => {
        return AxiosInstance.get(`/products/lowStockCount${typeof threshold === "number" ? `?threshold=${threshold}` : ""}`);
    },
};

export default ProductService;

