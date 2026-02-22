import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

 
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
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
            const res = await axios.post(
                `${API_URL}/auth/register`,
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
            const res = await axios.post(
                `${API_URL}/auth/login`,
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
        window.location.href = `${API_URL}/auth/google`;
    };

    const logout = async () => {
        try {
            await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
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
