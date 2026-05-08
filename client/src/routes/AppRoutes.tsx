import { Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";

import DashboardMainPage from "../pages/Dashboard/DashboardMainPage";
import CustomersMainPage from "../pages/Customers/CustomersMainPage";
import ProductsMainPage from "../pages/Products/ProductsMainPage";
import OrdersMainPage from "../pages/Orders/OrdersMainPage";
import DeliveriesMainPage from "../pages/Deliveries/DeliveriesMainPage";
import ReportsMainPage from "../pages/Reports/ReportsMainPage";


import UserMainPage from "../pages/User/UserMainPage";
import LoginPage from "../pages/Auth/LoginPage";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

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

                        <Route path="/users" element={<UserMainPage />} />
                    </Route>

                </Routes>
            </AuthProvider>
        </>
    );
};

export default AppRoutes;
