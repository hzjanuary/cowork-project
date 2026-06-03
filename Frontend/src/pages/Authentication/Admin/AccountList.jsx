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

    useEffect(() => {
        if (account?.role !== 'admin' && account?.role !== 'moderator') {
            navigate('/admin/login');
            return;
        }
        fetchAccounts();
    }, [account]);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            const res = await instance.get('/api/accounts/admin/accounts');
            setAccounts(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch accounts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (accountId, newRole) => {
        try {
            // This would need a backend endpoint to update role
            toast.info('Role update functionality coming soon');
            // await instance.put(`/api/accounts/admin/${accountId}/role`, { role: newRole });
            // fetchAccounts();
        } catch (error) {
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
