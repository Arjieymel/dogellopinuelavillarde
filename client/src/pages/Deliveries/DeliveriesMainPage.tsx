import { useEffect, useRef, useState } from "react";

import FloatingLabelInput from "../../components/Input/FloatingLabelInput";
import Spinner from "../../components/Spinner/Spinner";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/Table";

import SubmitButton from "../../components/Button/SubmitButton";
import CloseButton from "../../components/Button/CloseButton";
import Modal from "../../components/Modal";

import { useToastMessage } from "../../hooks/useToastMessage";
import DeliveryService, { type DeliveryPayload, type DeliveryUpdatePayload } from "../../Services/DeliveryService";
import type { DeliveryColumns, DeliveryFieldErrors, DeliveryStatus } from "../../interfaces/DeliveryInterface";


import OrderService from "../../Services/OrderService";
import type { OrderColumns } from "../../interfaces/OrderInterface";

const DeliveriesMainPage = () => {

    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage,
    } = useToastMessage("", false, false);

    const [loading, setLoading] = useState(false);
    const [deliveries, setDeliveries] = useState<DeliveryColumns[]>([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [lastPage, setLastPage] = useState(1);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [isAddOpen, setIsAddOpen] = useState(false);

    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryColumns | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [orders, setOrders] = useState<OrderColumns[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const [form, setForm] = useState<DeliveryPayload>({
        order_id: 0,
        driver_name: "",
        delivery_date: "",
        delivery_status: "Pending",
    });

    const [updateForm, setUpdateForm] = useState<DeliveryUpdatePayload>({
        driver_name: "",
        delivery_date: "",
        delivery_status: "Pending",
    });

    const [errors, setErrors] = useState<DeliveryFieldErrors>({});
    const [formLoading, setFormLoading] = useState(false);

    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [selectedCancelDeliveryId, setSelectedCancelDeliveryId] = useState<number | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [selectedArchiveDeliveryId, setSelectedArchiveDeliveryId] = useState<number | null>(null);
    const [archiveLoading, setArchiveLoading] = useState(false);

    const tableRef = useRef<HTMLDivElement>(null);


    const handleConfirmCancelDelivery = async () => {
        if (!selectedCancelDeliveryId) return;
        setCancelLoading(true);
        try {
            const res = await DeliveryService.cancelDelivery(selectedCancelDeliveryId);
            if (res.status >= 200 && res.status < 300) {
                const cancelledDelivery: DeliveryColumns | undefined = res.data.delivery;

                // Ensure table refresh so UI is always consistent with backend (pagination/search).
                await loadDeliveries(1, false, debouncedSearch);

                // Optimistic local fallback (in case backend payload shape differs)
                if (cancelledDelivery) {
                    setDeliveries((prev) =>
                        prev.map((x) =>
                            x.delivery_id === selectedCancelDeliveryId
                                ? {
                                    ...x,
                                    ...(cancelledDelivery ?? {}),
                                    delivery_status: "Cancelled" as DeliveryStatus,
                                }
                                : x,
                        ),
                    );
                }

                showToastMessage(res.data.message ?? "Delivery cancelled");
                setIsCancelOpen(false);
                setSelectedCancelDeliveryId(null);
            }
        } catch (err: any) {
            showToastMessage(err?.response?.data?.message ?? "Failed to cancel delivery", true);
        } finally {
            setCancelLoading(false);
        }
    };

    const handleConfirmArchiveDelivery = async () => {
        if (!selectedArchiveDeliveryId) return;
        setArchiveLoading(true);
        try {
            const res = await DeliveryService.archiveDelivery(selectedArchiveDeliveryId);
            if (res.status >= 200 && res.status < 300) {
                // Optimistic remove so the row disappears immediately (no full page reload)
                setDeliveries((prev) => prev.filter((x) => x.delivery_id !== selectedArchiveDeliveryId));

                // Still refresh for pagination/search consistency
                await loadDeliveries(1, false, debouncedSearch);
                showToastMessage(res.data.message ?? "Delivery archived");
                setIsArchiveOpen(false);
                setSelectedArchiveDeliveryId(null);
            }
        } catch (err: any) {
            showToastMessage(err?.response?.data?.message ?? "Failed to archive delivery", true);
        } finally {
            setArchiveLoading(false);
        }
    };

    const loadOrdersForSelect = async () => {

        setOrdersLoading(true);
        try {
            // Reuse orders endpoint; we only need recent orders.
            const res = await OrderService.loadOrders(1);
            if (res.status >= 200 && res.status < 300) {
                const payload = res.data.orders;
                const data: OrderColumns[] = payload?.data ?? payload ?? [];
                setOrders(data);
            }
        } finally {
            setOrdersLoading(false);
        }
    };

    const ensureOrdersLoaded = async () => {
        if (orders.length === 0) await loadOrdersForSelect();
    };

    const loadDeliveries = async (targetPage: number, append = false, s = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await DeliveryService.loadDeliveries(targetPage, s || undefined);
            if (res.status >= 200 && res.status < 300) {
                const payload = res.data.deliveries;
                const data = payload?.data ?? payload ?? [];
                const lp = payload?.last_page ?? payload?.lastPage ?? lastPage;
                setDeliveries(append ? [...deliveries, ...data] : data);
                setPage(targetPage);
                setLastPage(lp);
                setHasMore(targetPage < lp);
            } else {
                setDeliveries(append ? deliveries : []);
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
            loadDeliveries(page + 1, true);
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
        setDeliveries([]);
        setPage(1);
        setLastPage(1);
        setHasMore(true);
        loadDeliveries(1, false, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        document.title = "Deliveries";
    }, []);

    const resetAddForm = () => {
        setForm({ order_id: 0, driver_name: "", delivery_date: "", delivery_status: "Pending" });
        setErrors({});
    };

    const resetEditForm = () => {
        setSelectedDelivery(null);
        setUpdateForm({ driver_name: "", delivery_date: "", delivery_status: "Pending" });
        setErrors({});
    };

    const openAdd = async () => {
        resetAddForm();
        setIsAddOpen(true);
        await ensureOrdersLoaded();
    };

    const openEdit = (d: DeliveryColumns) => {
        setSelectedDelivery(d);
        setUpdateForm({
            driver_name: d.driver_name,
            delivery_date: d.delivery_date,
            delivery_status: d.delivery_status as DeliveryStatus,
        });
        setErrors({});
        setIsEditOpen(true);
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            setErrors({});
            const res = await DeliveryService.storeDelivery({
                ...form,
                order_id: Number(form.order_id),
            });
            if (res.status >= 200 && res.status < 300) {
                showToastMessage(res.data.message ?? "Delivery created");
                setIsAddOpen(false);
                resetAddForm();
                setDebouncedSearch((x) => x);
                await loadDeliveries(1, false, debouncedSearch);
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
        if (!selectedDelivery) return;
        setFormLoading(true);
        try {
            setErrors({});
            const res = await DeliveryService.updateDelivery(selectedDelivery.delivery_id, updateForm);
            if (res.status >= 200 && res.status < 300) {
                showToastMessage(res.data.message ?? "Delivery updated");
                setIsEditOpen(false);
                resetEditForm();
                await loadDeliveries(1, false, debouncedSearch);
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
                                        Add Delivery
                                    </button>
                                </div>
                            </div>
                        </caption>

                        <TableHeader className="border-b border-gray-200 bg-blue-600 sticky top-0 text-white text-xs z-10">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">No.</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Driver</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Delivery Date</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">Status</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Order</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 text-gray-500 text-sm">
                            {deliveries.length > 0 ? (
                                deliveries.map((d, idx) => (
                                    <TableRow className="hover:bg-gray-100" key={d.delivery_id}>
                                        <TableCell className="px-4 py-3 text-center">{idx + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-start">{d.driver_name}</TableCell>
                                        <TableCell className="px-4 py-3 text-start">{d.delivery_date}</TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <span
                                                className={
                                                    d.delivery_status === "Delivered"
                                                        ? "text-green-700 font-semibold"
                                                        : d.delivery_status === "Out for Delivery"
                                                            ? "text-yellow-700 font-semibold"
                                                            : "text-blue-700 font-semibold"
                                                }
                                            >
                                                {d.delivery_status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            <div>
                                                <span className="font-semibold">#{d.order_id}</span>
                                            </div>
                                            <div className="text-xs text-gray-400">{d.order?.customer?.fullname ?? "-"}</div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button type="button" className="text-green-600 hover:underline" onClick={() => openEdit(d)}>
                                                    Update
                                                </button>


                                                {(d.delivery_status === "Pending" || d.delivery_status === "Out for Delivery") && (
                                                    <button
                                                        type="button"
                                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => {
                                                            setSelectedCancelDeliveryId(d.delivery_id);
                                                            setIsCancelOpen(true);
                                                        }}
                                                        disabled={cancelLoading && selectedCancelDeliveryId === d.delivery_id}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                                {(d.delivery_status === "Delivered" || d.delivery_status === "Cancelled") && (
                                                    <button
                                                        type="button"
                                                        className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => {
                                                            setSelectedArchiveDeliveryId(d.delivery_id);
                                                            setIsArchiveOpen(true);
                                                        }}
                                                        disabled={archiveLoading && selectedArchiveDeliveryId === d.delivery_id}
                                                    >
                                                        {archiveLoading && selectedArchiveDeliveryId === d.delivery_id ? "Archiving..." : "Archive"}
                                                    </button>
                                                )}
                                            </div>
                                        </TableCell>


                                    </TableRow>
                                ))
                            ) : !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center font-medium">
                                        No Records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center">
                                        <Spinner size="md" />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Delivery Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} showCloseButton>
                <form onSubmit={handleSubmitAdd} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Add Delivery</h2>
                        <CloseButton label="Close" onClose={() => setIsAddOpen(false)} />
                    </div>

                    {ordersLoading ? (
                        <div className="flex justify-center py-6">
                            <Spinner size="md" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <label className="block text-sm font-medium text-gray-700">Order</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                value={form.order_id}
                                onChange={(e) => setForm((p) => ({ ...p, order_id: Number(e.target.value) }))}
                            >
                                <option value={0}>Select order</option>
                                {orders.map((o) => (
                                    <option key={o.order_id} value={o.order_id}>
                                        #{o.order_id} - {o.customer?.fullname ?? "-"} ({o.product?.product_name ?? "-"})
                                    </option>
                                ))}
                            </select>
                            {errors.order_id?.length ? <p className="text-xs text-red-600">{errors.order_id[0]}</p> : null}

                            <FloatingLabelInput
                                label="Driver Name"
                                type="text"
                                name="driver_name"
                                value={form.driver_name}
                                onChange={(e) => setForm((p) => ({ ...p, driver_name: e.target.value }))}
                            />
                            {errors.driver_name?.length ? <p className="text-xs text-red-600">{errors.driver_name[0]}</p> : null}

                            <FloatingLabelInput
                                label="Delivery Date"
                                type="date"
                                name="delivery_date"
                                value={form.delivery_date}
                                onChange={(e) => setForm((p) => ({ ...p, delivery_date: e.target.value }))}
                            />
                            {errors.delivery_date?.length ? <p className="text-xs text-red-600">{errors.delivery_date[0]}</p> : null}

                            <label className="block text-sm font-medium text-gray-700">Delivery Status</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                value={form.delivery_status}
                                onChange={(e) => setForm((p) => ({ ...p, delivery_status: e.target.value as DeliveryStatus }))}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                            {errors.delivery_status?.length ? <p className="text-xs text-red-600">{errors.delivery_status[0]}</p> : null}
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

            {/* Cancel Delivery Modal */}
            <Modal
                isOpen={isCancelOpen}
                onClose={() => {
                    if (!cancelLoading) {
                        setIsCancelOpen(false);
                        setSelectedCancelDeliveryId(null);
                    }
                }}
            >

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Cancel Delivery</h2>
                </div>

                <div className="mt-4 space-y-3">

                    <p className="text-sm text-gray-700">
                        Are you sure you want to cancel this delivery?
                        <span className="font-semibold text-gray-900">
                            {selectedCancelDeliveryId ? ` #${selectedCancelDeliveryId}` : ""}
                        </span>
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                                if (cancelLoading) return;
                                setIsCancelOpen(false);
                                setSelectedCancelDeliveryId(null);
                            }}
                            disabled={cancelLoading}
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleConfirmCancelDelivery}
                            disabled={cancelLoading || !selectedCancelDeliveryId}
                        >
                            {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Archive Delivery Modal */}
            <Modal
                isOpen={isArchiveOpen}
                onClose={() => {
                    if (!archiveLoading) {
                        setIsArchiveOpen(false);
                        setSelectedArchiveDeliveryId(null);
                    }
                }}
                showCloseButton
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Archive Delivery</h2>
                    </div>

                    <p className="text-sm text-gray-700">
                        Are you sure you want to archive this delivery?
                        <span className="font-semibold text-gray-900">
                            {selectedArchiveDeliveryId ? ` #${selectedArchiveDeliveryId}` : ""}
                        </span>
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                                if (archiveLoading) return;
                                setIsArchiveOpen(false);
                                setSelectedArchiveDeliveryId(null);
                            }}
                            disabled={archiveLoading}
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleConfirmArchiveDelivery}
                            disabled={archiveLoading || !selectedArchiveDeliveryId}
                        >
                            {archiveLoading ? "Archiving..." : "Yes, Archive"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Delivery Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} showCloseButton>

                <form onSubmit={handleSubmitEdit} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Update Delivery</h2>
                        <CloseButton label="Close" onClose={() => setIsEditOpen(false)} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <FloatingLabelInput
                            label="Driver Name"
                            type="text"
                            name="driver_name"
                            value={updateForm.driver_name}
                            onChange={(e) => setUpdateForm((p) => ({ ...p, driver_name: e.target.value }))}
                        />
                        {errors.driver_name?.length ? <p className="text-xs text-red-600">{errors.driver_name[0]}</p> : null}

                        <FloatingLabelInput
                            label="Delivery Date"
                            type="date"
                            name="delivery_date"
                            value={updateForm.delivery_date}
                            onChange={(e) => setUpdateForm((p) => ({ ...p, delivery_date: e.target.value }))}
                        />
                        {errors.delivery_date?.length ? <p className="text-xs text-red-600">{errors.delivery_date[0]}</p> : null}

                        <label className="block text-sm font-medium text-gray-700">Delivery Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={updateForm.delivery_status}
                            onChange={(e) => setUpdateForm((p) => ({ ...p, delivery_status: e.target.value as DeliveryStatus }))}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                        {errors.delivery_status?.length ? <p className="text-xs text-red-600">{errors.delivery_status[0]}</p> : null}

                        {selectedDelivery ? (
                            <p className="text-sm text-gray-600">
                                Updating delivery <span className="font-semibold text-gray-800">#{selectedDelivery.delivery_id}</span>
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

export default DeliveriesMainPage;

