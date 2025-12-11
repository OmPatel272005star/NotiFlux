import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated on mount
        const apiKey = localStorage.getItem('apiKey');
        const email = localStorage.getItem('userEmail');

        if (apiKey && email) {
            setIsAuthenticated(true);
            setUserEmail(email);
        }
        setLoading(false);
    }, []);

    const login = (apiKey, email) => {
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('userEmail', email);
        setIsAuthenticated(true);
        setUserEmail(email);
    };

    const logout = () => {
        localStorage.removeItem('apiKey');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
        setUserEmail(null);
    };

    const value = {
        isAuthenticated,
        userEmail,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
