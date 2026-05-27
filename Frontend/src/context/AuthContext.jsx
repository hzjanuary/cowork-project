import { createContext, useState, useEffect } from 'react'
import instance from '../config/axiosConfig.js';

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
        const res = await instance.post('/api/accounts/send-otp', { email });
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