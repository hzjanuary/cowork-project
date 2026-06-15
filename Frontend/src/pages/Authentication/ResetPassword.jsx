import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth.js';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState(location.state?.email || localStorage.getItem('resetEmail') || '');
    const [form, setForm] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('resetEmail');
        if (!email && storedEmail) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEmail(storedEmail);
        }
    }, [email]);

    const updateField = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email) {
            toast.error('Reset session missing. Request a new OTP first.');
            navigate('/forgot-password');
            return;
        }

        if (!form.password || !form.confirmPassword) {
            toast.error('Please fill in both password fields.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(email, form.password, form.confirmPassword);
            localStorage.removeItem('resetEmail');
            toast.success('Password reset successful. You can login now.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="auth-card">
            <div className="auth-art">
                <span>新</span>
                <h1>New password</h1>
                <p>Create a fresh password after your reset OTP has been verified.</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <span className="eyebrow">Reset password</span>
                <h2>Choose a new password</h2>
                <label>
                    Email address
                    <input value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} />
                </label>
                <label>
                    New password
                    <input
                        type="password"
                        value={form.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                </label>
                <label>
                    Confirm password
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(event) => updateField('confirmPassword', event.target.value)}
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                </label>
                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                    <LockOutlined /> {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <p className="muted">Need a new OTP? <Link to="/forgot-password">Start again</Link></p>
            </form>
        </section>
    );
};

export default ResetPassword;
