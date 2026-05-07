import { Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import EditGenderPage from "../pages/Gender/EditGenderPage";
import GenderMainPage from "../pages/Gender/GenderMainPage";
import DeleteGenderPage from "../pages/Gender/DeleteGenderPage";
import UserMainPage from "../pages/User/UserMainPage";
import LoginPage from "../pages/Auth/LoginPage";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import DashboardMainPage from "../pages/Dashboard/DashboardMainPage";
import CustomersMainPage from "../pages/Customers/CustomersMainPage";
import ProductsMainPage from "../pages/Products/ProductsMainPage";
import OrdersMainPage from "../pages/Orders/OrdersMainPage";
import DeliveriesMainPage from "../pages/Deliveries/DeliveriesMainPage";
import ReportsMainPage from "../pages/Reports/ReportsMainPage";

const AppRoutes = () => {
    return (
        <>
            <AuthProvider>
                <Routes>
                    <Route path='/' element={<LoginPage />} />
                    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<DashboardMainPage />} />
                        <Route path="/customers" element={<CustomersMainPage />} />
                        <Route path="/products" element={<ProductsMainPage />} />
                        <Route path="/orders" element={<OrdersMainPage />} />
                        <Route path="/deliveries" element={<DeliveriesMainPage />} />
                        <Route path="/reports" element={<ReportsMainPage />} />

                        {/* Legacy modules kept for now */}
                        <Route path="/genders" element={<GenderMainPage />} />
                        <Route path="/gender/edit/:gender_id" element={<EditGenderPage />} />
                        <Route path="/gender/delete/:gender_id" element={<DeleteGenderPage />} />
                        <Route path="/users" element={<UserMainPage />} />
                    </Route>

                </Routes>
            </AuthProvider>
        </>
    );
};

export default AppRoutes;
