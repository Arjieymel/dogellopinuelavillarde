import { useEffect, useRef, useState, type FC } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/Table";
import Spinner from "../../../components/Spinner/Spinner";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import type { CustomerColumns } from "../../../interfaces/CustomerInterface";
import CustomerService from "../../../Services/CustomerService";

interface CustomerListProps {
    onAddCustomer: () => void;
    onEditCustomer: (customer: CustomerColumns | null) => void;
    onDeleteCustomer: (customer: CustomerColumns | null) => void;
    refreshKey: boolean;
}

const CustomerList: FC<CustomerListProps> = ({ onAddCustomer, onEditCustomer, onDeleteCustomer, refreshKey }) => {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<CustomerColumns[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const tableRef = useRef<HTMLDivElement>(null);


    const loadCustomers = async (targetPage: number, append = false, s = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await CustomerService.loadCustomers(targetPage, s || undefined);

            console.log("[CustomerList] loadCustomers response:", res.data);

            if (res.status === 200) {
                const payload = res.data.customers;

                // If backend returns Laravel paginator: { data, current_page, last_page, ... }
                const data = payload?.data ?? payload ?? [];
                const lp = payload?.last_page ?? payload?.lastPage ?? lastPage;

                console.log("[CustomerList] customers parsed:", data);

                setCustomers(append ? [...customers, ...data] : data);
                setPage(targetPage);
                setLastPage(lp);
                setHasMore(targetPage < lp);
            } else {
                setCustomers(append ? customers : []);
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
            loadCustomers(page + 1, true);
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
        setCustomers([]);
        setPage(1);
        setLastPage(1);
        setHasMore(true);
        loadCustomers(1, false, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey, debouncedSearch]);

    return (
        <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
            <div ref={tableRef} className="relative max-w-full max-h-[calc(100vh-11.5rem)] overflow-x-auto">
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
                                    onClick={onAddCustomer}
                                >
                                    Add Customer
                                </button>
                            </div>
                        </div>
                    </caption>

                    <TableHeader className="border-b border-gray-200 bg-linear-to-r from-blue-600 to-cyan-500 sticky top-0 text-white text-xs z-10">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-center">No.</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start">Fullname</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start">Contact Number</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start">Email</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-start">Address</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-center">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 text-gray-500 text-sm">
                        {customers.length > 0 ? (
                            customers.map((c, idx) => (
                                <TableRow className="hover:bg-gray-100" key={c.customer_id}>
                                    <TableCell className="px-4 py-3 text-center">{idx + 1}</TableCell>
                                    <TableCell className="px-4 py-3 text-start">{c.fullname}</TableCell>
                                    <TableCell className="px-4 py-3 text-start">{c.contact_number}</TableCell>
                                    <TableCell className="px-4 py-3 text-start">{(c.email ?? "").trim() ? c.email : "No Email"}</TableCell>
                                    <TableCell className="px-4 py-3 text-start">{c.address ?? "-"}</TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-4">
                                            <button type="button" className="text-green-600 hover:underline" onClick={() => onEditCustomer(c)}>
                                                Edit
                                            </button>
                                            <button type="button" className="text-red-600 hover:underline" onClick={() => onDeleteCustomer(c)}>
                                                Delete
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : !loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="px-4 py-3 text-center font-medium">
                                    No Records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="px-4 py-3 text-center">
                                    <Spinner size="md" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default CustomerList;

