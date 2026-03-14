import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

 
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setError(null);
        try {
            const res = await api.post(
                '/auth/register',
                { name, email, password },
                { withCredentials: true }
            );
            // Don't set user - they need to login after signup
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            throw new Error(message);
        }
    };

    const login = async (email, password) => {
        setError(null);
        try {
            const res = await api.post(
                '/auth/login',
                { email, password },
                { withCredentials: true }
            );

            // Fix: Don't set user if 2FA is required
            if (res.data.require2FA) {
                return res.data;
            }

            setUser(res.data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            throw new Error(message);
        }
    };

    const loginWithGoogle = () => {
        const isVercel = window.location.hostname !== 'localhost';
        const serverUrl = isVercel ? 'https://cineverse-world.vercel.app/api' : 'http://localhost:5000/api';
        window.location.href = `${serverUrl}/auth/google`;
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
        }
    };

    const clearError = () => setError(null);

    const value = {
        user,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        logout,
        clearError,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
