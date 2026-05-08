import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import {
    LayoutDashboard,
    Users,
    Package,
    ClipboardList,
    Truck,
    BarChart3,
    ShieldUser,
} from "lucide-react";

const AppSidebar = () => {
    const { isOpen, toggleSidebar } = useSidebar();
    const location = useLocation();

    const sidebarItems = [
        { path: "/dashboard", text: "Dashboard", Icon: LayoutDashboard },
        { path: "/customers", text: "Customers", Icon: Users },
        { path: "/products", text: "Products", Icon: Package },
        { path: "/orders", text: "Orders", Icon: ClipboardList },
        { path: "/deliveries", text: "Deliveries", Icon: Truck },
        { path: "/reports", text: "Reports", Icon: BarChart3 },
        { path: "/users", text: "Users", Icon: ShieldUser },
    ];

    return (
        <>
            {!isOpen && (
                <div className="fixed inset-0 z-30 blur-lg sm:hidden" onClick={toggleSidebar} />
            )}

            <aside
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isOpen ? "-translate-x-full" : "translate-x-0"
                    } bg-linear-to-b from-blue-950 to-blue-700 border-r border-blue-700 shadow-md sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="relative h-full px-3 pb-4 overflow-y-auto bg-linear-to-b  to-blue-700">
                    {/* Logo */}


                    <ul className="space-y-2 font-medium">
                        {sidebarItems.map(({ path, text, Icon }) => {
                            const isActive = location.pathname === path;
                            return (
                                <li key={path}>
                                    <Link
                                        to={path}
                                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all group ${isActive
                                            ? "bg-blue-400 text-white shadow-md"
                                            : "text-white/90 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-cyan-100"}`} />
                                        </span>
                                        <span className="truncate">{text}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Water splash background effect */}

                </div>
            </aside>
        </>
    );
};

export default AppSidebar;