import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {} from '@mui/material'
import {} from 'antd'

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validateForm = (form) => {
        switch (form) {
            case 'username':
                if (!username.trim()) {
                    toast.error('Username is required');
                    return false;
                }
                break;
            case 'email':
                if (!email.trim()) {
                    toast.error('Email is required');
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    toast.error('Invalid email format');
                    return false;
                }
                break;
            case 'password':
                if (!password) {
                    toast.error('Password is required');
                    return false;
                }
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(password)) {
                    toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and be at least 8 characters long');
                    return false;
                }
                break;
            case 'confirmPassword':
                if (!confirmPassword) {
                    toast.error('Confirm password is required');
                    return false;
                }
                if (password !== confirmPassword) {
                    toast.error('Confirm password does not match');
                    return false;
                }
                break;
            default:
                return null
            
        }
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        if (validateForm('username') === false) return;
        if (validateForm('email') === false) return;
        if (validateForm('password') === false) return;
        if (validateForm('confirmPassword') === false) return;

        try {
            setIsLoading(true);
            const response = await register({
                username,
                email,
                password
            });

            toast.success('Registration successful! Redirecting to login...');
            
            // Clear form
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div></div>
    )
}
export default Register;