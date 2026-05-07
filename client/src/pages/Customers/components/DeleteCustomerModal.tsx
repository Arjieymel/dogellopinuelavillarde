import { useState, type FC } from "react";
import Modal from "../../../components/Modal";
import type { CustomerColumns } from "../../../interfaces/CustomerInterface";
import CustomerService from "../../../Services/CustomerService";
import SubmitButton from "../../../components/Button/SubmitButton";
import CloseButton from "../../../components/Button/CloseButton";

const DeleteCustomerModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerColumns | null;
    refreshKey: any;
    onCustomerDeleted: (message: string) => void;
}> = ({ isOpen, onClose, customer, refreshKey, onCustomerDeleted }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        setLoading(true);
        try {
            const res = await CustomerService.destroyCustomer(customer.customer_id);
            if (res.status >= 200 && res.status < 300) {
                onCustomerDeleted(res.data.message);
                onClose();
                refreshKey();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleDelete} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Delete Customer</h2>
                    <CloseButton label="Close" onClose={onClose} />
                </div>

                <p className="text-sm text-gray-600">
                    Are you sure you want to delete <span className="font-semibold text-gray-800">{customer?.fullname}</span>? This action can be undone by restoring in the database.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onClick={onClose}>
                        Cancel
                    </button>
                    <SubmitButton label={loading ? "Deleting..." : "Delete"} loading={loading} />
                </div>
            </form>
        </Modal>
    );
};

export default DeleteCustomerModal;

