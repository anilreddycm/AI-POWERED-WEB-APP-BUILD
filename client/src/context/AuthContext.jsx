import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api.js';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token') || Cookies.get('token');
        if (token) {
            // Get user info
            api.get('/auth/me')
                .then((res) => {
                    if (res.data.success) {
                        setUser(res.data.data);
                    } else {
                        logout();
                    }
                })
                .catch(() => {
                    logout();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 7 });
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        Cookies.remove('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };
