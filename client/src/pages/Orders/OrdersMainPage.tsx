import { useEffect, useRef, useState } from "react";

import FloatingLabelInput from "../../components/Input/FloatingLabelInput";
import Spinner from "../../components/Spinner/Spinner";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/Table";

import SubmitButton from "../../components/Button/SubmitButton";
import CloseButton from "../../components/Button/CloseButton";
import Modal from "../../components/Modal";

import { useToastMessage } from "../../hooks/useToastMessage";
import OrderService, { type OrderPayload, type OrderUpdatePayload } from "../../Services/OrderService";
import type { OrderColumns, OrderFieldErrors, OrderStatus } from "../../interfaces/OrderInterface";


import ProductService from "../../Services/ProductService";
import CustomerService from "../../Services/CustomerService";

import type { CustomerColumns } from "../../interfaces/CustomerInterface";
import type { ProductColumns } from "../../interfaces/ProductInterface";

const OrdersMainPage = () => {
    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage,
    } = useToastMessage("", false, false);

    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<OrderColumns[]>([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [lastPage, setLastPage] = useState(1);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState<OrderColumns | null>(null);

    const [customers, setCustomers] = useState<CustomerColumns[]>([]);
    const [products, setProducts] = useState<ProductColumns[]>([]);
    const [listsLoading, setListsLoading] = useState(false);

    const [form, setForm] = useState<OrderPayload>({
        customer_id: 0,
        product_id: 0,
        quantity: 1,
    });

    const [updateForm, setUpdateForm] = useState<OrderUpdatePayload>({ status: "Pending" });

    const [errors, setErrors] = useState<OrderFieldErrors>({});
    const [formLoading, setFormLoading] = useState(false);

    const tableRef = useRef<HTMLDivElement>(null);

    const loadCustomers = async () => {
        setListsLoading(true);
        try {
            // Reuse CustomerService patterns (most modules use loadCustomers(page, search))
            const res = await CustomerService.loadCustomers(1);
            if (res.status >= 200 && res.status < 300) {
                const payload = res.data.customers;
                const data = payload?.data ?? payload ?? [];
                setCustomers(data);
            }
        } finally {
            setListsLoading(false);
        }
    };

    const loadProducts = async () => {
        setListsLoading(true);
        try {
            const res = await ProductService.loadProducts(1);
            if (res.status >= 200 && res.status < 300) {
                const payload = res.data.products;
                const data = payload?.data ?? payload ?? [];
                setProducts(data);
            }
        } finally {
            setListsLoading(false);
        }
    };

    const ensureListsLoaded = async () => {
        if (customers.length === 0) await loadCustomers();
        if (products.length === 0) await loadProducts();
    };

    const resetAddForm = () => {
        setForm({ customer_id: 0, product_id: 0, quantity: 1 });
        setErrors({});
    };

    const resetEditForm = () => {
        setSelectedOrder(null);
        setUpdateForm({ status: "Pending" });
    };

    const loadOrders = async (targetPage: number, append = false, s = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await OrderService.loadOrders(targetPage, s || undefined);
            if (res.status >= 200 && res.status < 300) {
                const payload = res.data.orders;
                const data = payload?.data ?? payload ?? [];
                const lp = payload?.last_page ?? payload?.lastPage ?? lastPage;
                setOrders(append ? [...orders, ...data] : data);
                setPage(targetPage);
                setLastPage(lp);
                setHasMore(targetPage < lp);
            } else {
                setOrders(append ? orders : []);
                setHasMore(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const onScroll = () => {
        const el = tableRef.current;
        if (!el) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && hasMore && !loading) {
            loadOrders(page + 1, true);
        }
    };

    useEffect(() => {
        const el = tableRef.current;
        if (!el) return;
        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loading, page, debouncedSearch]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setOrders([]);
        setPage(1);
        setLastPage(1);
        setHasMore(true);
        loadOrders(1, false, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const openAdd = async () => {
        resetAddForm();
        setIsAddOpen(true);
        await ensureListsLoaded();
    };

    const openEdit = (o: OrderColumns) => {
        setSelectedOrder(o);
        setUpdateForm({ status: o.status as OrderStatus });
        setErrors({});
        setIsEditOpen(true);
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            setErrors({});
            const res = await OrderService.storeOrder({
                ...form,
                customer_id: Number(form.customer_id),
                product_id: Number(form.product_id),
                quantity: Number(form.quantity),
            });
            if (res.status >= 200 && res.status < 300) {
                showToastMessage(res.data.message ?? "Order created");
                setIsAddOpen(false);
                resetAddForm();
                setDebouncedSearch((x) => x);
                await loadOrders(1, false, debouncedSearch);
            }
        } catch (err: any) {
            if (err?.response?.status === 422) {
                setErrors(err.response.data.errors || err.response.data);
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setFormLoading(true);
        try {
            setErrors({});
            const res = await OrderService.updateOrder(selectedOrder.order_id, updateForm);
            if (res.status >= 200 && res.status < 300) {
                showToastMessage(res.data.message ?? "Order updated");
                setIsEditOpen(false);
                resetEditForm();
                await loadOrders(1, false, debouncedSearch);
            }
        } catch (err: any) {
            if (err?.response?.status === 422) {
                setErrors(err.response.data.errors || err.response.data);
            }
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <>
            <ToastMessage message={toastMessage} isVisible={toastMessageIsVisible} onClose={closeToastMessage} />

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div ref={tableRef} className="relative max-w-full max-h-[calc(100vh-8.5rem)] overflow-x-auto">
                    <Table>
                        <caption className="mb-4">
                            <div className="border-b border-gray-100">
                                <div className="p-4 flex justify-between">
                                    <div className="w-64">
                                        <FloatingLabelInput
                                            label="Search"
                                            type="text"
                                            name="search"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition cursor-pointer"
                                        onClick={openAdd}
                                    >
                                        Add Order
                                    </button>
                                </div>
                            </div>
                        </caption>

                        <TableHeader className="border-b border-gray-200 bg-blue-600 sticky top-0 text-white text-xs z-10">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">No.</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Customer</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Product</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Quantity</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Total Amount</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">Status</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 text-gray-500 text-sm">
                            {orders.length > 0 ? (
                                orders.map((o, idx) => (
                                    <TableRow className="hover:bg-gray-100" key={o.order_id}>
                                        <TableCell className="px-4 py-3 text-center">{idx + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {o.customer?.fullname ?? "-"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {o.product?.product_name ?? "-"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">{o.quantity}</TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {typeof o.total_amount === "string" ? o.total_amount : Number(o.total_amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <span className={
                                                o.status === "Delivered"
                                                    ? "text-green-700 font-semibold"
                                                    : o.status === "Processing"
                                                        ? "text-yellow-700 font-semibold"
                                                        : "text-blue-700 font-semibold"
                                            }>
                                                {o.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button type="button" className="text-green-600 hover:underline" onClick={() => openEdit(o)}>
                                                    Update Status
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : !loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-3 text-center font-medium">
                                        No Records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="px-4 py-3 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Order Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} showCloseButton>
                <form onSubmit={handleSubmitAdd} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Add Order</h2>
                        <CloseButton label="Close" onClose={() => setIsAddOpen(false)} />
                    </div>

                    {listsLoading ? (
                        <div className="flex justify-center py-6">
                            <Spinner size="md" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <label className="block text-sm font-medium text-gray-700">Customer</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                value={form.customer_id}
                                onChange={(e) => setForm((p) => ({ ...p, customer_id: Number(e.target.value) }))}
                            >
                                <option value={0}>Select customer</option>
                                {customers.map((c) => (
                                    <option key={c.customer_id} value={c.customer_id}>
                                        {c.fullname}
                                    </option>
                                ))}
                            </select>
                            {errors.customer_id?.length ? <p className="text-xs text-red-600">{errors.customer_id[0]}</p> : null}

                            <label className="block text-sm font-medium text-gray-700">Product</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                value={form.product_id}
                                onChange={(e) => setForm((p) => ({ ...p, product_id: Number(e.target.value) }))}
                            >
                                <option value={0}>Select product</option>
                                {products.map((p) => (
                                    <option key={p.product_id} value={p.product_id}>
                                        {p.product_name}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id?.length ? <p className="text-xs text-red-600">{errors.product_id[0]}</p> : null}

                            <input
                                className="block w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-blue-600"
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                min={1}
                                onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
                            />
                            {errors.quantity?.length ? <p className="text-xs text-red-600">{errors.quantity[0]}</p> : null}

                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsAddOpen(false)}
                        >
                            Cancel
                        </button>
                        <SubmitButton label={formLoading ? "Saving..." : "Save"} loading={formLoading} />
                    </div>
                </form>
            </Modal>

            {/* Edit Order Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} showCloseButton>
                <form onSubmit={handleSubmitEdit} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Update Order Status</h2>
                        <CloseButton label="Close" onClose={() => setIsEditOpen(false)} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={updateForm.status}
                            onChange={(e) => setUpdateForm({ status: e.target.value as OrderStatus })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                        {errors.status?.length ? <p className="text-xs text-red-600">{errors.status[0]}</p> : null}

                        {selectedOrder ? (
                            <p className="text-sm text-gray-600">
                                Updating order <span className="font-semibold text-gray-800">#{selectedOrder.order_id}</span>
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsEditOpen(false)}
                        >
                            Cancel
                        </button>
                        <SubmitButton label={formLoading ? "Updating..." : "Update"} loading={formLoading} />
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default OrdersMainPage;


