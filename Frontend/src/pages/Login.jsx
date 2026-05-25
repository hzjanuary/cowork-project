import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, Container, TextField, Button, Typography, InputAdornment, IconButton } from '@mui/material';
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
            const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    py: 4,
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

                <Spin spinning={isLoading} tip="Logging in...">
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
                            InputProps={{
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
        </Container>
    )
}

export default Login;