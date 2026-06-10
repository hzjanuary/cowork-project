import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import instance from '../../../config/axiosConfig';
import { toast } from 'react-toastify';
// import '../Authentication.css';

const AccountList = () => {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { account } = useAuth();
    const navigate = useNavigate();

    async function fetchAccounts() {
        try {
            setIsLoading(true);
            const res = await instance.get('/api/accounts/admin/accounts');
            setAccounts(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error('Failed to fetch accounts');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (account?.role !== 'admin' && account?.role !== 'moderator') {
            navigate('/admin/login');
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    const handleRoleChange = async (accountId, newRole) => {
        try {
            await instance.post('/api/accounts/update-role', { accountId, role: newRole });
            toast.success('Role updated successfully');
            fetchAccounts();
        } catch {
            toast.error('Failed to update role');
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Account Management</h2>
                <button onClick={() => navigate('/')} className="btn-secondary">Back to Home</button>
            </div>

            {isLoading ? (
                <div className="loading">Loading accounts...</div>
            ) : accounts.length === 0 ? (
                <div className="empty-state">
                    <p>No accounts found</p>
                </div>
            ) : (
                <div className="accounts-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(acc => (
                                <tr key={acc._id}>
                                    <td>{acc.username}</td>
                                    <td>{acc.email}</td>
                                    <td>
                                        <select
                                            value={acc.role}
                                            onChange={(e) => handleRoleChange(acc._id, e.target.value)}
                                            className="role-select"
                                        >
                                            <option value="user">User</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`status ${acc.isVerified ? 'verified' : 'unverified'}`}>
                                            {acc.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td>{new Date(acc.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-secondary btn-small">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AccountList;
