import { createContext, useState, useEffect, type FC, type ReactNode, useContext } from "react";
import type { UserDetails } from "../interfaces/AuthInterface";
import AuthService from "../Services/AuthService";

interface AuthContextType {
    user: UserDetails | null;
    loading: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const login = async (username: string, password: string) => {
        try {
            const res = await AuthService.login({ username, password });

            if (res.status === 200) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data);
            } else {
                console.error('Unexpected status error occurred during logging user in:', res.status);
            }
        } catch (error) {
            console.error('Unexpected error occurred while logging user in:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const res = await AuthService.logout();

            if (res.status === 200) {
                localStorage.removeItem('token');
                setUser(null);
            } else {
                console.error('Unexpected status error occurred during logging user out:', res.status);
            }
        } catch (error) {
            console.error('Unexpected server error occurred while logging user out:', error);
            throw error;
        }
    };

    const checkAuth = async () => {
        setLoading(true);

        const token = localStorage.getItem('token');

        if (token) {
            try {
                const res = await AuthService.me();

                if (res.status === 200) {
                    setUser(res.data);
                } else {
                    setUser(null);
                    localStorage.removeItem('token');
                    console.error('Unexpected status error occurred during authentication check:', res.status);
                }
            } catch (error) {
                setUser(null);
                localStorage.removeItem('token');
                console.error('Unexpected server error occurred during authentication check:', error);
            }
            setLoading(false);
        } else {
            setUser(null);
            setLoading(false);
        }

    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading ,login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);   
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};