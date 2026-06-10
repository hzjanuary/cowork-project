/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react'
import instance from '../config/axiosConfig.js';

export const AuthContext = createContext();

const getAccountIdFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.accountId || null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const storedAccount = JSON.parse(localStorage.getItem('account'));
    const storedToken = localStorage.getItem('token');
    const accountIdFromToken = storedToken ? getAccountIdFromToken(storedToken) : null;
    const initialAccount = storedAccount && !storedAccount._id && accountIdFromToken
        ? { ...storedAccount, _id: accountIdFromToken }
        : storedAccount;
    const [account, setAccount] = useState(initialAccount || null);
    const isLoading = false;
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(storedAccount && storedToken));

    useEffect(() => {
        if (storedToken) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        if (initialAccount && storedAccount && !storedAccount._id && initialAccount._id) {
            localStorage.setItem('account', JSON.stringify(initialAccount));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storedToken])

    const login = async ({ username, password }) => {
        try {
            const res = await instance.post('/api/accounts/login', { username, password });
            const { token, account } = res.data;
            const accountWithUsername = { ...account, username };

            localStorage.setItem('account', JSON.stringify(accountWithUsername));
            localStorage.setItem('token', token);
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAccount(accountWithUsername);
            setIsAuthenticated(true);
            return accountWithUsername;
        } catch (error) {
            console.error('Login API error:', error);
            console.error('Error response:', error.response?.data);
            throw error
        }
    }

    const register = async ({ username, email, password, confirmPassword }) => {
        try {
            console.log('Sending registration data:', { username, email, password: '***', confirmPassword: '***' });
            const res = await instance.post('/api/accounts/register', { username, email, password, confirmPassword });
            console.log('Registration response:', res.data);
            return res.data;
        } catch (error) {
            console.error('Register API error:', error);
            console.error('Error response:', error.response);
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

    const getAccountProfile = async () => {
        const res = await instance.get('/api/accounts/profile');
        const nextAccount = { ...account, ...res.data };
        localStorage.setItem('account', JSON.stringify(nextAccount));
        setAccount(nextAccount);
        return nextAccount;
    }

    const updateRole = async (accountId, role) => {
        const res = await instance.post('/api/accounts/update-role', { accountId, role });
        return res.data;
    }

    const sendOtp = async (email) => {
        const res = await instance.post('/api/accounts/sent-otp', { email });
        return res.data;
    }

    const verifyOtp = async (email, pin) => {
        try {
            console.log('Verifying OTP:', { email, pin: '***' });
            const res = await instance.post('/api/accounts/verify-otp', { email, pin });
            console.log('OTP verification response:', res.data);
            return res.data;
        } catch (error) {
            console.error('OTP verification error:', error);
            console.error('Error response:', error.response);
            throw error;
        }
    }

    const forgotPassword = async (email) => {
        const res = await instance.post('/api/accounts/forgot-password', { email });
        return res.data;
    }

    const resetPassword = async () => {
        throw new Error('Password reset submission is not available because the backend reset-password route is not declared.');
    }

    return (
        <AuthContext.Provider value={{ 
            account, 
            isLoading, 
            isAuthenticated,
            login, 
            register, 
            logout,
            getAccountProfile,
            updateRole,
            sendOtp,
            verifyOtp,
            forgotPassword,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    )
}
