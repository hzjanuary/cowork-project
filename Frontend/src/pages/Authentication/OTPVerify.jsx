import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth.js';

const OTPVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp, sendOtp } = useAuth();
    const email = location.state?.email || '';
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email || !pin.trim()) {
            toast.error('Email and OTP are required.');
            return;
        }

        try {
            setIsLoading(true);
            await verifyOtp(email, pin);
            toast.success('Email verified. You can login now.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await sendOtp(email);
            toast.success('OTP sent again.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not resend OTP.');
        }
    };

    return (
        <section className="auth-card">
            <div className="auth-art">
                <span>証</span>
                <h1>Verify email</h1>
                <p>Enter the PIN sent to your inbox to activate backend access.</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <span className="eyebrow">OTP</span>
                <h2>Confirm your account</h2>
                <label>
                    Email
                    <input value={email} readOnly />
                </label>
                <label>
                    Verification code
                    <input value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Enter PIN" />
                </label>
                <button className="btn btn-primary" disabled={isLoading} type="submit">
                    <SafetyOutlined /> {isLoading ? 'Verifying...' : 'Verify'}
                </button>
                <button className="btn btn-secondary" disabled={!email} onClick={handleResend} type="button">
                    <MailOutlined /> Resend OTP
                </button>
                <p className="muted">Wrong email? <Link to="/register">Register again</Link></p>
            </form>
        </section>
    );
};

export default OTPVerify;
