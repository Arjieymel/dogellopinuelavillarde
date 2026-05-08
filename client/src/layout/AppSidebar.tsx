import { Link } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";

const AppSidebar = () => {
    const { isOpen, toggleSidebar } = useSidebar();

    const sidebarItems = [
        { path: '/dashboard', text: 'Dashboard' },
        { path: '/customers', text: 'Customers' },
        { path: '/products', text: 'Products' },
        { path: '/orders', text: 'Orders' },
        { path: '/deliveries', text: 'Deliveries' },
        { path: '/reports', text: 'Reports' },

        { path: '/users', text: 'Users' },
    ];


    return (
        <>
            {!isOpen && (
                <div
                    className="fixed inset-0 z-30 blur-lg sm:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform 
                ${isOpen ? "-translate-x-full" : "translate-x-0"}
                bg-blue-600 border-r border-blue-700 sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 pb-4 overflow-y-auto bg-blue-600">
                    <ul className="space-y-2 font-medium">

                        {sidebarItems.map((sidebarItem, index) => (
                            <li key={index}>
                                <Link
                                    to={sidebarItem.path}
                                    className="flex items-center p-2 text-white rounded-lg 
                                    hover:bg-blue-700 group transition-all"
                                >
                                    <span className="ms-3">{sidebarItem.text}</span>
                                </Link>
                            </li>
                        ))}

                    </ul>
                </div>
            </aside>
        </>
    )
}

export default AppSidebar;