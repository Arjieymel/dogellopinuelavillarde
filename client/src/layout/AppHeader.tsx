import { useNavigate } from "react-router-dom";
import { useHeader } from "../contexts/HeaderContext";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState, type FormEvent } from "react";
import { Droplet } from "lucide-react";

const AppHeader = () => {
    const { isOpen, toggleUserMenu } = useHeader();
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async (e: FormEvent) => {
        try {
            e.preventDefault();
            setIsLoading(true);
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Unexpected server error occurred during logging out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserFullNameFormat = () => {
        if (!user) return '';

        let fullName = `${user.user.last_name}, ${user.user.first_name}`;

        if (user.user.middle_name) {
            fullName += ` ${user.user.middle_name.charAt(0)}.`;
        }
        if (user.user.suffix_name) {
            fullName += ` ${user.user.suffix_name}`;
        }

        return fullName;
    };

    useEffect(() => {
        if (user) {
            handleUserFullNameFormat();
        }
    }, [user]);

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={toggleUserMenu} />
            )}

            <nav className="fixed top-0 z-50 w-full bg-blue-600 border-b border-blue-700 shadow-md bg-linear-to-b from-blue-950 to-blue-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">

                        {/* LEFT SIDE */}
                        <div className="flex items-center justify-start rtl:justify-end">

                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="sm:hidden text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 
                                focus:ring-blue-300 font-medium rounded-base text-sm p-2 focus:outline-none"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <svg
                                    className="w-6 h-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeWidth="2"
                                        d="M5 7h14M5 12h14M5 17h10"
                                    />
                                </svg>
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="ml-2 w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-lg">
                                    <Droplet className="w-6 h-6 text-cyan-200" />
                                </div>
                                <div>
                                    <p className="text-white font-bold leading-tight">WaterFlow</p>
                                    <p className="text-cyan-100/80 text-xs -mt-0.5">Management</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="flex items-center">

                            <div className="flex items-center ms-3">

                                <button
                                    type="button"
                                    onClick={toggleUserMenu}
                                    className="flex text-sm bg-blue-800 rounded-full focus:ring-4 focus:ring-blue-300"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        className="w-8 h-8 rounded-full border-2 border-white"
                                        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                        alt="user photo"
                                    />
                                </button>

                                {/* DROPDOWN */}
                                <div
                                    id="dropdown-user"
                                    className={`absolute right-8 top-12 z-50 ${isOpen ? "block" : "hidden"
                                        } bg-white border border-gray-200 rounded-lg shadow-lg w-44`}
                                >
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-800">
                                            {handleUserFullNameFormat()}
                                        </p>
                                    </div>

                                    <ul className="p-2 text-sm text-gray-700">
                                        <li>
                                            <button
                                                type="button"
                                                className="w-full text-left px-4 py-2 hover:bg-blue-100 text-red-600 font-medium rounded"
                                                onClick={handleLogout}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Signing Out...' : 'Sign Out'}
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </nav>
        </>
    );
};

export default AppHeader;