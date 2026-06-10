import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login, account } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!credentials.username.trim() || !credentials.password.trim()) {
            toast.error('Please enter username and password');
            return;
        }

        try {
            setIsLoading(true);
            const user = await login(credentials);
            
            if (user.role !== 'admin' && user.role !== 'moderator') {
                toast.error('Access denied. Admin/Moderator privileges required.');
                return;
            }

            toast.success('Admin login successful!');
            navigate('/admin/accounts');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Admin Login</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            disabled={isLoading}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p><a href="/login">Back to User Login</a></p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
