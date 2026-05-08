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

    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [selectedCancelOrderId, setSelectedCancelOrderId] = useState<number | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [selectedArchiveOrderId, setSelectedArchiveOrderId] = useState<number | null>(null);
    const [archiveLoading, setArchiveLoading] = useState(false);


    const tableRef = useRef<HTMLDivElement>(null);

    const handleConfirmCancelOrder = async () => {
        if (!selectedCancelOrderId) return;
        setCancelLoading(true);
        try {
            const res = await OrderService.cancelOrder(selectedCancelOrderId);
            if (res.status >= 200 && res.status < 300) {
                const cancelledOrder: OrderColumns | undefined = res.data.order;
                setOrders((prev) =>
                    prev.map((x) =>
                        x.order_id === selectedCancelOrderId
                            ? {
                                ...x,
                                status: "Cancelled" as OrderStatus,
                                ...(cancelledOrder ?? {}),
                            }
                            : x,
                    ),
                );
                showToastMessage(res.data.message ?? "Order cancelled");
                setIsCancelOpen(false);
                setSelectedCancelOrderId(null);
            }
        } catch (err: any) {
            showToastMessage(err?.response?.data?.message ?? "Failed to cancel order", true);
        } finally {
            setCancelLoading(false);
        }
    };

    const handleConfirmArchiveOrder = async () => {
        if (!selectedArchiveOrderId) return;
        setArchiveLoading(true);
        try {
            const res = await OrderService.archiveOrder(selectedArchiveOrderId);
            if (res.status >= 200 && res.status < 300) {
                await loadOrders(1, false, debouncedSearch);
                showToastMessage(res.data.message ?? "Order archived");
                setIsArchiveOpen(false);
                setSelectedArchiveOrderId(null);
            }
        } catch (err: any) {
            showToastMessage(err?.response?.data?.message ?? "Failed to archive order", true);
        } finally {
            setArchiveLoading(false);
        }
    };






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

            <div className="min-h-[calc(100vh-6rem)]">
                {/* Page shell */}
                <div className="rounded-2xl bg-linear-to-b from-blue-600/10 via-cyan-600/5 to-transparent border border-blue-200/60 p-5 sm:p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Orders Management</h1>
                            <p className="text-sm text-gray-600 mt-1">Create orders and manage their delivery status.</p>
                        </div>
                    </div>

                    {/* Top controls */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Search (bigger - 2/3 width) */}
                        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="w-full">
                                    <FloatingLabelInput
                                        label="Search"
                                        type="text"
                                        name="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Add Order (smaller - 1/3 width) */}
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex items-center justify-center">
                            <button
                                type="button"
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition cursor-pointer whitespace-nowrap"
                                onClick={openAdd}
                            >
                                Add Order
                            </button>
                        </div>

                    </div>
                    {/* Table section */}
                    <div className="mt-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-0 overflow-hidden">
                        <div ref={tableRef} className="relative max-w-full max-h-[calc(100vh-11rem)] overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-200 bg-linear-to-r from-blue-600 to-cyan-500 sticky top-0 text-white text-xs z-10">
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
                                            <TableRow className="hover:bg-blue-50/40 transition-colors" key={o.order_id}>
                                                <TableCell className="px-4 py-3 text-center">{idx + 1}</TableCell>
                                                <TableCell className="px-4 py-3 text-start">{o.customer?.fullname ?? "-"}</TableCell>
                                                <TableCell className="px-4 py-3 text-start">{o.product?.product_name ?? "-"}</TableCell>
                                                <TableCell className="px-4 py-3 text-start">{o.quantity}</TableCell>
                                                <TableCell className="px-4 py-3 text-start">
                                                    {typeof o.total_amount === "string" ? o.total_amount : Number(o.total_amount).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <span
                                                        className={
                                                            o.status === "Delivered"
                                                                ? "text-green-700 font-semibold"
                                                                : o.status === "Processing"
                                                                    ? "text-yellow-700 font-semibold"
                                                                    : "text-blue-700 font-semibold"
                                                        }
                                                    >
                                                        {o.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => openEdit(o)}
                                                        >
                                                            Update Status
                                                        </button>

                                                        {((o.status as string) === "Pending" || (o.status as string) === "Processing") && (
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                onClick={() => {
                                                                    setSelectedCancelOrderId(o.order_id);
                                                                    setIsCancelOpen(true);
                                                                }}
                                                                disabled={cancelLoading && selectedCancelOrderId === o.order_id}
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}

                                                        {(o.status === "Delivered" || o.status === ("Cancelled" as OrderStatus)) && (
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                onClick={() => {
                                                                    setSelectedArchiveOrderId(o.order_id);
                                                                    setIsArchiveOpen(true);
                                                                }}
                                                                disabled={archiveLoading && selectedArchiveOrderId === o.order_id}
                                                            >
                                                                {archiveLoading && selectedArchiveOrderId === o.order_id ? "Archiving..." : "Archive"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-4 py-10 text-center font-medium">
                                                No Records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-4 py-10 text-center">
                                                <Spinner size="md" />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Order Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} showCloseButton>
                <form onSubmit={handleSubmitAdd} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Add Order</h2>

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

            {/* Cancel Order Modal */}
            <Modal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} showCloseButton>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Confirm Cancel</h2>
                        <CloseButton label="Close" onClose={() => setIsCancelOpen(false)} />
                    </div>

                    <p className="text-sm text-gray-600">
                        Are you sure you want to cancel order <span className="font-semibold text-gray-800">#{selectedCancelOrderId}</span>?
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsCancelOpen(false)}
                            disabled={cancelLoading}
                        >
                            No
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleConfirmCancelOrder}
                            disabled={cancelLoading}
                        >
                            {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Archive Order Modal */}
            <Modal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} showCloseButton>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Confirm Archive</h2>
                        <CloseButton label="Close" onClose={() => setIsArchiveOpen(false)} />
                    </div>

                    <p className="text-sm text-gray-600">
                        Are you sure you want to archive order <span className="font-semibold text-gray-800">#{selectedArchiveOrderId}</span>?
                        <br />
                        Archived orders will be hidden from active list but kept for history.
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsArchiveOpen(false)}
                            disabled={archiveLoading}
                        >
                            No
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleConfirmArchiveOrder}
                            disabled={archiveLoading}
                        >
                            {archiveLoading ? "Archiving..." : "Yes, Archive"}
                        </button>
                    </div>
                </div>
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


