import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useModal } from "../../hooks/useModal";
import { useRefresh } from "../../hooks/useRefresh";
import { useToastMessage } from "../../hooks/useToastMessage";

import CustomerList from "./components/CustomerList";
import AddCustomerModal from "./components/AddCustomerModal";
import EditCustomerModal from "./components/EditCustomerModal";
import DeleteCustomerModal from "./components/DeleteCustomerModal";
import type { CustomerColumns } from "../../interfaces/CustomerInterface";

const CustomersMainPage = () => {
    const { isOpen: isAddOpen, openModal: openAdd, closeModal: closeAdd } = useModal(false);
    const { isOpen: isEditOpen, selectedUser: selectedForEdit, openModal: openEdit, closeModal: closeEdit } = useModal(false);
    const { isOpen: isDeleteOpen, selectedUser: selectedForDelete, openModal: openDelete, closeModal: closeDelete } = useModal(false);

    // useModal is typed for UserColumns in this codebase; reuse with casts.
    const openEditCustomer = (c: CustomerColumns | null | undefined) => openEdit(c as any);
    const openDeleteCustomer = (c: CustomerColumns | null | undefined) => openDelete(c as any);

    const { message, isVisible, showToastMessage, closeToastMessage } = useToastMessage("", false, false);
    const { refresh, handleRefresh } = useRefresh(false);

    return (
        <>

            <ToastMessage message={message} isVisible={isVisible} onClose={closeToastMessage} />

            <AddCustomerModal
                isOpen={isAddOpen}
                onClose={closeAdd}
                refreshKey={handleRefresh}
                onCustomerAdded={showToastMessage}
            />

            <EditCustomerModal
                isOpen={isEditOpen}
                onClose={closeEdit}
                customer={selectedForEdit as CustomerColumns | null}
                refreshKey={handleRefresh}
                onCustomerUpdated={showToastMessage}
            />

            <DeleteCustomerModal
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                customer={selectedForDelete as CustomerColumns | null}
                refreshKey={handleRefresh}
                onCustomerDeleted={showToastMessage}
            />

            <CustomerList
                refreshKey={refresh}
                onAddCustomer={openAdd}
                onEditCustomer={openEditCustomer}
                onDeleteCustomer={openDeleteCustomer}
            />
        </>
    );
};

export default CustomersMainPage;

