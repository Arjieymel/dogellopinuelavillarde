import AxiosInstance from "./AxiosInstance";

export type CustomerPayload = {
    fullname: string;
    contact_number: string;
    email?: string;
    address?: string;
};

const CustomerService = {
    loadCustomers: async (page: number, search?: string) => {
        return AxiosInstance.get(
            search ? `/customers/loadCustomers?page=${page}&search=${encodeURIComponent(search)}` : `/customers/loadCustomers?page=${page}`
        );
    },

    storeCustomer: async (data: CustomerPayload) => {
        return AxiosInstance.post("/customers/storeCustomer", data);
    },

    getCustomer: async (customerId: string | number) => {
        return AxiosInstance.get(`/customers/getCustomer/${customerId}`);
    },

    updateCustomer: async (customerId: string | number, data: CustomerPayload) => {
        return AxiosInstance.put(`/customers/updateCustomer/${customerId}`, data);
    },

    destroyCustomer: async (customerId: string | number) => {
        return AxiosInstance.put(`/customers/destroyCustomer/${customerId}`);
    },
};

export default CustomerService;


