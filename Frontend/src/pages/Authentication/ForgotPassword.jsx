import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
// import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }

        try {
            setIsLoading(true);
            await forgotPassword(email);
            toast.success('Password reset OTP sent to your email!');
            // Store email for reset password page
            localStorage.setItem('resetEmail', email);
            navigate('/reset-password');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Forgot Password</h2>
                <p>Enter your email address and we'll send you an OTP to reset your password.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset OTP'}
                    </button>
                </form>

                <div className="forgot-password-footer">
                    <p>Remember your password? <a href="/login">Login here</a></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
