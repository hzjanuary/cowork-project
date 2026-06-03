import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, TextField, Button, Typography, InputAdornment, IconButton } from '@mui/material';
import { Form, Input, Button as AntButton, Spin } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

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
                password,
                confirmPassword
            });

            toast.success('Registration successful! Check your email for verification code.');
            
            // Clear form
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

            // Redirect to OTP verification page with username and password
            setTimeout(() => {
                navigate('/verify-otp', { state: { email, username, password } });
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Response data:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
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
                        Create Account
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'textSecondary' }}>
                        Join us today to get started
                    </Typography>
                </Box>

                <Spin spinning={isLoading} description="Registering...">
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

                        {/* Email Field */}
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            onBlur={() => validateForm('email')}
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
                            autoComplete="new-password"
                        />

                        {/* Confirm Password Field */}
                        <TextField
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            onBlur={() => validateForm('confirmPassword')}
                            disabled={isLoading}
                            inputprops={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={toggleShowConfirmPassword}
                                            edge="end"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            autoComplete="new-password"
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
                            {isLoading ? 'Registering...' : 'Register'}
                        </Button>

                        {/* Login Link */}
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                                Login here
                            </Link>
                        </Typography>
                    </Box>
                </Spin>
        </Box>
    );
}
export default Register;