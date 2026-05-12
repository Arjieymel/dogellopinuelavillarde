import { useEffect, useState, type FC } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import SubmitButton from "../../../components/Button/SubmitButton";


import CustomerService, { type CustomerPayload } from "../../../Services/CustomerService";
import Spinner from "../../../components/Spinner/Spinner";
import type { CustomerFieldErrors } from "../../../interfaces/CustomerInterface";

const AddCustomerModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    refreshKey: any;
    onCustomerAdded: (message: string) => void;
}> = ({ isOpen, onClose, refreshKey, onCustomerAdded }) => {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<CustomerPayload>({ fullname: "", contact_number: "", email: "", address: "" });
    const [errors, setErrors] = useState<CustomerFieldErrors>({});

    useEffect(() => {
        if (!isOpen) return;
        setForm({ fullname: "", contact_number: "", email: "", address: "" });
        setErrors({});
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            setErrors({});
            const res = await CustomerService.storeCustomer({
                fullname: form.fullname.trim(),
                contact_number: form.contact_number.trim(),
                email: form.email?.trim() || "",
                address: form.address?.trim() || "",
            });

            if (res.status >= 200 && res.status < 300) {
                onCustomerAdded(res.data.message);
                onClose();
                refreshKey();
            }
        } catch (err: any) {
            if (err?.response?.status === 422) {
                setErrors(err.response.data.errors || err.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Add Customer</h2>

                </div>

                <div className="grid grid-cols-1 gap-4">
                    <FloatingLabelInput
                        label="Fullname"
                        type="text"
                        name="fullname"
                        value={form.fullname}
                        onChange={(e) => setForm((p) => ({ ...p, fullname: e.target.value }))}
                    />
                    {errors.fullname?.length ? <p className="text-xs text-red-600">{errors.fullname[0]}</p> : null}

                    <FloatingLabelInput
                        label="Contact Number"
                        type="text"
                        name="contact_number"
                        value={form.contact_number}
                        onChange={(e) => setForm((p) => ({ ...p, contact_number: e.target.value }))}
                    />
                    {errors.contact_number?.length ? <p className="text-xs text-red-600">{errors.contact_number[0]}</p> : null}

                    <FloatingLabelInput
                        label="Email"
                        type="email"
                        name="email"
                        value={form.email ?? ""}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    />
                    {errors.email?.length ? <p className="text-xs text-red-600">{errors.email[0]}</p> : null}

                    <FloatingLabelInput
                        label="Address"
                        type="text"
                        name="address"
                        value={form.address ?? ""}
                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    />
                    {errors.address?.length ? <p className="text-xs text-red-600">{errors.address[0]}</p> : null}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <SubmitButton label={loading ? "Saving..." : "Save"} loading={loading} />
                </div>
            </form>
            {loading ? <div className="hidden"><Spinner size="md" /></div> : null}
        </Modal>

    );
};

export default AddCustomerModal;

