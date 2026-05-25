import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { } from '@mui/material'
import { } from 'antd'

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const validateForm = (form) => {
        switch (form) {
            case 'username':
                if (!username.trim()) {
                    toast.error('Username is required');
                    return false;
                }
                break;
            case 'password':
                if (!password) {
                    toast.error('Password is required');
                    return false;
                }
                break;
            default:
                return null;

        }
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm('username') === false || validateForm('password') === false) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await login({ username, password });

            toast.success('Login successful!');

            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div></div>
    )
}

export default Login;