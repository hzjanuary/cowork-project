import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, Container, TextField, Button, Typography } from '@mui/material';
import { Spin } from 'antd';

const OTPVerify = () => {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { verifyOtp, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const username = location.state?.username;
    const password = location.state?.password;

    // Redirect to register if no email provided
    if (!email) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                        Invalid access. Please register first.
                    </Typography>
                    <Link to="/register">
                        <Button variant="contained">Go to Register</Button>
                    </Link>
                </Box>
            </Container>
        );
    }

    const validateForm = () => {
        if (!pin.trim()) {
            toast.error('OTP is required');
            return false;
        }
        if (pin.length < 4) {
            toast.error('OTP must be at least 4 digits');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);
            console.log('Verifying OTP with:', { email, pin });
            const response = await verifyOtp(email, pin);
            console.log('OTP verification response:', response);

            toast.success('Email verified successfully! Logging you in...');
            
            setPin('');

            // Auto-login with the provided credentials
            if (username && password) {
                try {
                    await login({ username, password });
                    toast.success('Logged in successfully! Redirecting to profile creation...');
                    setTimeout(() => {
                        navigate('/create-profile');
                    }, 1500);
                } catch (loginError) {
                    console.error('Auto-login error:', loginError);
                    toast.warning('OTP verified! Please login manually to continue');
                    setTimeout(() => {
                        navigate('/login');
                    }, 1500);
                }
            } else {
                toast.warning('OTP verified! Please login to create your profile');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'OTP verification failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const handleResendOtp = async () => {
        try {
            setIsLoading(true);
            // Note: You'll need to add sendOtp to the form if resend is needed
            toast.info('Resend OTP feature coming soon');
        } catch (error) {
            toast.error('Failed to resend OTP');
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
                        Verify Email
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'textSecondary', mb: 2 }}>
                        We've sent a verification code to:
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary' }}>
                        {email}
                    </Typography>
                </Box>

                <Spin spinning={isLoading} description="Verifying OTP...">
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* OTP Field */}
                        <TextField
                            label="Verification Code"
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter 4-digit code"
                            onBlur={() => validateForm()}
                            disabled={isLoading}
                            inputprops={{
                                maxLength: '6',
                                pattern: '[0-9]*'
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
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </Button>

                        {/* Resend Link */}
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                            Didn't receive the code?{' '}
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleResendOtp}
                                disabled={isLoading}
                                sx={{ textTransform: 'none', p: 0, ml: 0.5 }}
                            >
                                Resend OTP
                            </Button>
                        </Typography>

                        {/* Back to Register Link */}
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                            <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                                Change email
                            </Link>
                        </Typography>
                    </Box>
                </Spin>
            </Box>
        </Container>
    );
}

export default OTPVerify;