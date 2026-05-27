import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, TextField, Button, Typography, InputAdornment, IconButton } from '@mui/material';
import { Spin } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

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

            toast.success('Login successful! Redirecting...');

            setUsername('');
            setPassword('');

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Login error caught:', error);
            console.error('Error response data:', error.response?.data);
            
            let errorMessage = 'Login failed. Please try again.';
            
            // Try to extract error message from different sources
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100vh'
            }}
        >
                <Box sx={{ width: '100%', mb: 3 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'textSecondary' }}>
                        Sign in to your account to continue
                    </Typography>
                </Box>

                <Spin spinning={isLoading} description="Logging in...">
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Username Field */}
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            onBlur={() => validateForm('username')}
                            disabled={isLoading}
                            autoComplete="username"
                        />

                        {/* Password Field */}
                        <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            onBlur={() => validateForm('password')}
                            disabled={isLoading}
                            autoComplete="current-password"
                            inputprops={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={toggleShowPassword}
                                            edge="end"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                            sx={{ mt: 2 }}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>

                        {/* Register Link */}
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                                Register here
                            </Link>
                        </Typography>
                    </Box>
                </Spin>
        </Box>
    )
}

export default Login;