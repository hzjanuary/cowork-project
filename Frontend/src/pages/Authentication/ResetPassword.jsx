import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
// import './ResetPassword.css';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
        pin: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Get email from localStorage that was set in ForgotPassword
        const email = localStorage.getItem('resetEmail');
        if (email) {
            setFormData(prev => ({ ...prev, email }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim() || !formData.pin.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(formData.email, formData.newPassword, formData.confirmPassword);
            toast.success('Password reset successful!');
            localStorage.removeItem('resetEmail');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <h2>Reset Password</h2>
                <p>Enter the OTP and your new password to reset your account.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled={isLoading || !!localStorage.getItem('resetEmail')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pin">OTP Code</label>
                        <input
                            type="text"
                            id="pin"
                            name="pin"
                            value={formData.pin}
                            onChange={handleChange}
                            placeholder="Enter the OTP sent to your email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="reset-password-footer">
                    <p>Remember your password? <a href="/login">Login here</a></p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
