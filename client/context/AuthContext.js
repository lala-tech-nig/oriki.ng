'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('oriki_token');
        if (token) {
            authAPI.me()
                .then(setUser)
                .catch(() => { localStorage.removeItem('oriki_token'); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const data = await authAPI.login({ email, password });
        localStorage.setItem('oriki_token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        const data = await authAPI.register(formData);
        localStorage.setItem('oriki_token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('oriki_token');
        setUser(null);
    };

    const updateUser = (updated) => setUser((prev) => ({ ...prev, ...updated }));

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
