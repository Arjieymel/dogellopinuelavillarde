import { useEffect, useRef, useState } from "react";


import FloatingLabelInput from "../../components/Input/FloatingLabelInput";
import Spinner from "../../components/Spinner/Spinner";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/Table";

import SubmitButton from "../../components/Button/SubmitButton";
import CloseButton from "../../components/Button/CloseButton";
import Modal from "../../components/Modal";

import { useToastMessage } from "../../hooks/useToastMessage";
import ProductService, { type ProductPayload } from "../../Services/ProductService";
import type { ProductColumns, ProductFieldErrors } from "../../interfaces/ProductInterface";


const ProductsMainPage = () => {
    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage,
    } = useToastMessage("", false, false);

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<ProductColumns[]>([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [lastPage, setLastPage] = useState(1);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<ProductColumns | null>(null);

    const [form, setForm] = useState<ProductPayload>({
        product_name: "",
        price: 0,
        stock: 0,
        description: "",
    });

    const [errors, setErrors] = useState<ProductFieldErrors>({});
    const [formLoading, setFormLoading] = useState(false);

    const tableRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setForm({ product_name: "", price: 0, stock: 0, description: "" });
        setErrors({});
    };

    const loadProducts = async (targetPage: number, append = false, s = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await ProductService.loadProducts(targetPage, s || undefined);
            if (res.status >= 200 && res.status < 300) {
                const payload = res.data.products;
                const data = payload?.data ?? payload ?? [];
                const lp = payload?.last_page ?? payload?.lastPage ?? lastPage;
                setProducts(append ? [...products, ...data] : data);
                setPage(targetPage);
                setLastPage(lp);
                setHasMore(targetPage < lp);
            } else {
                setProducts(append ? products : []);
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
            loadProducts(page + 1, true);
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
        setProducts([]);
        setPage(1);
        setLastPage(1);
        setHasMore(true);
        loadProducts(1, false, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const openAdd = () => {
        resetForm();
        setSelectedProduct(null);
        setIsAddOpen(true);
    };

    const openEdit = (p: ProductColumns) => {
        setSelectedProduct(p);
        setForm({
            product_name: p.product_name,
            price: Number(p.price),
            stock: Number(p.stock),
            description: p.description ?? "",
        });
        setErrors({});
        setIsEditOpen(true);
    };

    const openDelete = (p: ProductColumns) => {
        setSelectedProduct(p);
        setIsDeleteOpen(true);
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            setErrors({});
            const res = await ProductService.storeProduct({
                ...form,
                description: form.description?.trim() || undefined,
                price: Number(form.price),
                stock: Number(form.stock),
            });
            if (res.status >= 200 && res.status < 300) {
                showToastMessage(res.data.message ?? "Product saved");
                setIsAddOpen(false);
                resetForm();
                setDebouncedSearch((x) => x);
                await loadProducts(1, false, debouncedSearch);
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
        if (!selectedProduct) return;
        setFormLoading(true);
        try {
            setErrors({});
            const res = await ProductService.updateProduct(selectedProduct.product_id, {
                ...form,
                description: form.description?.trim() || undefined,
                price: Number(form.price),
                stock: Number(form.stock),
            });
            if (res.status >= 200 && res.status < 300) {
                showToastMessage(res.data.message ?? "Product updated");
                setIsEditOpen(false);
                resetForm();
                await loadProducts(1, false, debouncedSearch);
            }
        } catch (err: any) {
            if (err?.response?.status === 422) {
                setErrors(err.response.data.errors || err.response.data);
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setFormLoading(true);
        try {
            const res = await ProductService.destroyProduct(selectedProduct.product_id);
            if (res.status >= 200 && res.status < 300) {
                showToastMessage(res.data.message ?? "Product deleted");
                setIsDeleteOpen(false);
                setSelectedProduct(null);
                await loadProducts(1, false, debouncedSearch);
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
                                        Add Product
                                    </button>
                                </div>
                            </div>
                        </caption>

                        <TableHeader className="border-b border-gray-200 bg-blue-600 sticky top-0 text-white text-xs z-10">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">No.</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Name</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Price</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Stock</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-start">Description</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-center">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 text-gray-500 text-sm">
                            {products.length > 0 ? (
                                products.map((p, idx) => (
                                    <TableRow className="hover:bg-gray-100" key={p.product_id}>
                                        <TableCell className="px-4 py-3 text-center">{idx + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-start">{p.product_name}</TableCell>
                                        <TableCell className="px-4 py-3 text-start">{Number(p.price).toFixed(2)}</TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            {Number(p.stock) <= 10 ? (
                                                <span className="text-red-600 font-semibold">{p.stock}</span>
                                            ) : (
                                                p.stock
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">{p.description ?? "-"}</TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button type="button" className="text-green-600 hover:underline" onClick={() => openEdit(p)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="text-red-600 hover:underline" onClick={() => openDelete(p)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center font-medium">No Records found</TableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-3 text-center"><Spinner size="md" /></TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} showCloseButton>
                <form onSubmit={handleSubmitAdd} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Add Product</h2>
                        <CloseButton label="Close" onClose={() => setIsAddOpen(false)} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <FloatingLabelInput
                            label="Product Name"
                            type="text"
                            name="product_name"
                            value={form.product_name}
                            onChange={(e) => setForm((p) => ({ ...p, product_name: e.target.value }))}
                        />
                        {errors.product_name?.length ? <p className="text-xs text-red-600">{errors.product_name[0]}</p> : null}

                        <FloatingLabelInput
                            label="Price"
                            type="text"
                            name="price"
                            value={String(form.price)}
                            onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                        />

                        {errors.price?.length ? <p className="text-xs text-red-600">{errors.price[0]}</p> : null}

                        <FloatingLabelInput
                            label="Stock"
                            type="text"
                            name="stock"
                            value={String(form.stock)}
                            onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                        />


                        {errors.stock?.length ? <p className="text-xs text-red-600">{errors.stock[0]}</p> : null}

                        <FloatingLabelInput
                            label="Description"
                            type="text"
                            name="description"
                            value={form.description ?? ""}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        />
                        {errors.description?.length ? <p className="text-xs text-red-600">{errors.description[0]}</p> : null}
                    </div>

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

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} showCloseButton>
                <form onSubmit={handleSubmitEdit} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
                        <CloseButton label="Close" onClose={() => setIsEditOpen(false)} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <FloatingLabelInput
                            label="Product Name"
                            type="text"
                            name="product_name"
                            value={form.product_name}
                            onChange={(e) => setForm((p) => ({ ...p, product_name: e.target.value }))}
                        />
                        {errors.product_name?.length ? <p className="text-xs text-red-600">{errors.product_name[0]}</p> : null}

                        <FloatingLabelInput
                            label="Price"
                            type="text"
                            name="price"
                            value={String(form.price)}
                            onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                        />

                        {errors.price?.length ? <p className="text-xs text-red-600">{errors.price[0]}</p> : null}

                        <FloatingLabelInput
                            label="Stock"
                            type="text"
                            name="stock"
                            value={String(form.stock)}
                            onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                        />

                        {errors.stock?.length ? <p className="text-xs text-red-600">{errors.stock[0]}</p> : null}

                        <FloatingLabelInput
                            label="Description"
                            type="text"
                            name="description"
                            value={form.description ?? ""}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        />
                        {errors.description?.length ? <p className="text-xs text-red-600">{errors.description[0]}</p> : null}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsEditOpen(false)}
                        >
                            Cancel
                        </button>
                        <SubmitButton label={formLoading ? "Saving..." : "Save Changes"} loading={formLoading} />
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} showCloseButton>
                <form onSubmit={handleDelete} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>
                        <CloseButton label="Close" onClose={() => setIsDeleteOpen(false)} />
                    </div>

                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-800">{selectedProduct?.product_name}</span>?
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Cancel
                        </button>
                        <SubmitButton label={formLoading ? "Deleting..." : "Delete"} loading={formLoading} />
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default ProductsMainPage;

