import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth.js';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            toast.error('Please enter your email.');
            return;
        }

        try {
            setIsLoading(true);
            await forgotPassword(normalizedEmail);
            localStorage.setItem('resetEmail', normalizedEmail);
            toast.success('Password reset OTP sent to your email.');
            navigate('/verify-otp', {
                state: {
                    email: normalizedEmail,
                    mode: 'reset'
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="auth-card">
            <div className="auth-art">
                <span>鍵</span>
                <h1>Reset access</h1>
                <p>Request a one-time PIN, verify it, then choose a new password.</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <span className="eyebrow">Forgot password</span>
                <h2>Send reset OTP</h2>
                <label>
                    Email address
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        disabled={isLoading}
                        autoComplete="email"
                    />
                </label>
                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                    <MailOutlined /> {isLoading ? 'Sending...' : 'Send Reset OTP'}
                </button>
                <p className="muted">Remember your password? <Link to="/login">Login here</Link></p>
            </form>
        </section>
    );
};

export default ForgotPassword;
