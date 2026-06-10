/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react'
import instance from '../config/axiosConfig.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const storedAccount = JSON.parse(localStorage.getItem('account'));
    const storedToken = localStorage.getItem('token');
    const [account, setAccount] = useState(storedAccount || null);
    const isLoading = false;
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(storedAccount && storedToken));

    useEffect(() => {
        if (storedToken) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, [storedToken])

    const login = async ({ username, password }) => {
        try {
            const res = await instance.post('/api/accounts/login', { username, password });
            const { token, account } = res.data;

            localStorage.setItem('account', JSON.stringify(account));
            localStorage.setItem('token', token);
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAccount(account);
            setIsAuthenticated(true);
            return account;
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

    const resetPassword = async (email, password, confirmPassword) => {
        const res = await instance.post('/api/accounts/reset-password', { email, password, confirmPassword });
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
            forgotPassword,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    )
}
