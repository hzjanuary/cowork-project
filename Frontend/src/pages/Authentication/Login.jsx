import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth.js';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setIsLoading(true);
            await login(form);
            toast.success('Login successful.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="auth-card">
            <div className="auth-art">
                <span>読</span>
                <h1>Quizzle</h1>
                <p>Return to your Japanese question and test workspace.</p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
                <span className="eyebrow">Login</span>
                <h2>Welcome back</h2>
                <label>
                    Username
                    <input value={form.username} onChange={(event) => updateField('username', event.target.value)} autoComplete="username" />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={form.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        autoComplete="current-password"
                    />
                </label>
                <button className="btn btn-primary" disabled={isLoading} type="submit">
                    <LoginOutlined /> {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p className="muted">No account yet? <Link to="/register">Create one</Link></p>
            </form>
        </section>
    );
};

export default Login;
