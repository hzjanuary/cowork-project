import { createContext, useState, useEffect } from 'react'
import instance from '../config/axios.config.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storeUser = JSON.parse(localStorage.getItem('account'));
        const token = localStorage.getItem('token');
        if (storeUser && token) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAccount(storeUser);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [])

    const login = async ({ email, password }) => {
        try {
            const res = await instance.post('/api/accounts/login', { email, password });
            const { token, ...accountData } = res.data;

            localStorage.setItem('account', JSON.stringify(accountData));
            localStorage.setItem('token', token);
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAccount(accountData);
            setIsAuthenticated(true);
            return accountData;
        } catch (error) {
            throw error
        }
    }

    const register = async ({ username, email, password, confirmPassword }) => {
        try {
            const res = await instance.post('/api/accounts/register', { username, email, password, confirmPassword });
            const { token, ...accountData } = res.data;

            localStorage.setItem('account', JSON.stringify(accountData));
            localStorage.setItem('token', token);
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAccount(accountData);
            setIsAuthenticated(true);
            return accountData;
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('account');
        localStorage.removeItem('token');
        delete instance.defaults.headers.common['Authorization'];
        setAccount(null);
        setIsAuthenticated(false);
    }

    const sendOtp = async (email) => {
        const res = await instance.post('/api/accounts/send-otp', { email });
        return res.data;
    }

    const verifyOtp = async (email, pin) => {
        const res = await instance.post('/api/accounts/verify-otp', { email, pin });
        return res.data;
    }

    const resetPassword = async (email, newPassword, confirmPassword) => {
        const res = await instance.post('/api/accounts/reset-password', { email, newPassword, confirmPassword });
        return res.data;
    }

    return (
        <AuthContext.Provider value={{ 
            account, 
            isLoading, 
            isAuthenticated,
            login, 
            register, 
            logout,
            sendOtp,
            verifyOtp,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    )
}