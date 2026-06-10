import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth.js';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const validate = () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!form.username || !form.email || !form.password || !form.confirmPassword) return 'All fields are required.';
        if (!passwordRegex.test(form.password)) return 'Password needs uppercase, lowercase, number, special character, and 8 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            setIsLoading(true);
            const response = await register(form);
            toast.success('Account created. Check your email for OTP.');
            navigate('/verify-otp', { state: { email: response.email || form.email } });
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="auth-card wide">
            <div className="auth-art">
                <span>始</span>
                <h1>Start building</h1>
                <p>Create verified access for tests, question authoring, and source uploads.</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <span className="eyebrow">Register</span>
                <h2>Create account</h2>
                <label>
                    Username
                    <input value={form.username} onChange={(event) => updateField('username', event.target.value)} autoComplete="username" />
                </label>
                <label>
                    Email
                    <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={form.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        autoComplete="new-password"
                    />
                </label>
                <label>
                    Confirm password
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(event) => updateField('confirmPassword', event.target.value)}
                        autoComplete="new-password"
                    />
                </label>
                <button className="btn btn-primary" disabled={isLoading} type="submit">
                    <UserAddOutlined /> {isLoading ? 'Creating...' : 'Create account'}
                </button>
                <p className="muted">Already registered? <Link to="/login">Login</Link></p>
            </form>
        </section>
    );
};

export default Register;
