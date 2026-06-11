import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
    BarChartOutlined,
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    ReloadOutlined,
    TeamOutlined,
    UnlockOutlined,
    UserAddOutlined,
    UserOutlined
} from '@ant-design/icons';
import instance from '../../config/axiosConfig.js';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [roleFilter, setRoleFilter] = useState('all');
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            const res = await instance.get('/api/accounts/admin/accounts');
            setAccounts(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAccounts();
    }, []);

    const filteredAccounts = useMemo(() => {
        if (roleFilter === 'all') return accounts;
        if (roleFilter === 'student') {
            return accounts.filter((account) => account.role === 'user' || account.role === 'student');
        }
        return accounts.filter((account) => account.role === roleFilter);
    }, [accounts, roleFilter]);

    const metrics = useMemo(() => {
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const teachers = accounts.filter((account) => account.role === 'teacher').length;
        const students = accounts.filter((account) => account.role === 'user' || account.role === 'student').length;
        const newSignups = accounts.filter((account) => {
            const createdAt = new Date(account.createdAt).getTime();
            return Number.isFinite(createdAt) && now - createdAt <= sevenDays;
        }).length;

        return [
            { label: 'Total users', value: accounts.length, icon: <TeamOutlined /> },
            { label: 'New sign-ups', value: newSignups, icon: <UserAddOutlined /> },
            { label: 'Teachers', value: teachers, icon: <UserOutlined /> },
            { label: 'Students', value: students, icon: <UserOutlined /> }
        ];
    }, [accounts]);

    const updateRole = async (accountId, role) => {
        try {
            await instance.post('/api/accounts/update-role', { accountId, role });
            toast.success('Role updated.');
            fetchAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role.');
        }
    };

    const toggleAccountLock = async (account) => {
        const isActive = account.active !== false;
        const endpoint = isActive ? 'deactivate' : 'activate';

        try {
            await instance.post(`/api/accounts/admin/accounts/${account._id}/${endpoint}`);
            toast.success(isActive ? 'Account locked.' : 'Account unlocked.');
            fetchAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update account status.');
        }
    };

    const deleteAccount = async (accountId) => {
        const shouldDelete = window.confirm('Delete this account permanently?');
        if (!shouldDelete) return;

        try {
            await instance.delete(`/api/accounts/admin/accounts/${accountId}`);
            toast.success('Account deleted.');
            fetchAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete account.');
        }
    };

    return (
        <div className="page-stack admin-dashboard">
            <section className="workspace-hero">
                <div>
                    <span className="eyebrow">Admin workspace</span>
                    <h1>Quizzle Control Center</h1>
                    <p>Manage accounts and monitor high-level platform health from one focused dashboard.</p>
                </div>
                <div className="hero-actions">
                    <button className="btn btn-secondary" type="button" onClick={fetchAccounts} disabled={isLoading}>
                        <ReloadOutlined /> Refresh
                    </button>
                </div>
            </section>

            <div className="admin-tabs" role="tablist" aria-label="Admin sections">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    type="button"
                    onClick={() => setActiveTab('users')}
                >
                    <TeamOutlined /> User Manager
                </button>
                <button
                    className={activeTab === 'performance' ? 'active' : ''}
                    type="button"
                    onClick={() => setActiveTab('performance')}
                >
                    <BarChartOutlined /> System Performance
                </button>
            </div>

            {activeTab === 'users' ? (
                <>
                    <section className="stat-grid">
                        {metrics.map((metric) => (
                            <article className="stat-card" key={metric.label}>
                                <span>{metric.icon}</span>
                                <strong>{metric.value}</strong>
                                <small>{metric.label}</small>
                            </article>
                        ))}
                    </section>

                    <section className="toolbar">
                        <label>
                            Filter role
                            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                                <option value="all">All roles</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                            </select>
                        </label>
                    </section>

                    <section className="table-panel">
                        <div className="table-header admin-user-table">
                            <span>User</span>
                            <span>Email</span>
                            <span>Role</span>
                            <span>Status</span>
                            <span>Created</span>
                            <span>Actions</span>
                        </div>

                        {isLoading ? (
                            <div className="empty-state">Loading users...</div>
                        ) : filteredAccounts.length ? (
                            filteredAccounts.map((account) => (
                                <div className="table-row admin-user-table" key={account._id}>
                                    <strong>{account.username || 'Unnamed'}</strong>
                                    <span>{account.email}</span>
                                    <select value={account.role} onChange={(event) => updateRole(account._id, event.target.value)}>
                                        <option value="user">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <span className={account.active === false ? 'pill hard' : 'pill public'}>
                                        {account.active === false ? 'Locked' : 'Active'}
                                    </span>
                                    <span>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    <div className="table-actions">
                                        <button className="icon-btn" type="button" title="Edit role" aria-label="Edit role">
                                            <EditOutlined />
                                        </button>
                                        <button
                                            className="icon-btn"
                                            type="button"
                                            title={account.active === false ? 'Unlock account' : 'Lock account'}
                                            aria-label={account.active === false ? 'Unlock account' : 'Lock account'}
                                            onClick={() => toggleAccountLock(account)}
                                        >
                                            {account.active === false ? <UnlockOutlined /> : <LockOutlined />}
                                        </button>
                                        <button
                                            className="icon-btn danger"
                                            type="button"
                                            title="Delete account"
                                            aria-label="Delete account"
                                            onClick={() => deleteAccount(account._id)}
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No users match this filter.</div>
                        )}
                    </section>
                </>
            ) : (
                <section className="workspace-grid">
                    <article className="panel metric-panel">
                        <div className="panel-heading">
                            <h2>API Latency</h2>
                            <span className="pill public">Healthy</span>
                        </div>
                        <strong>124 ms</strong>
                        <div className="metric-bars" aria-hidden="true">
                            <span style={{ height: '42%' }} />
                            <span style={{ height: '58%' }} />
                            <span style={{ height: '36%' }} />
                            <span style={{ height: '64%' }} />
                            <span style={{ height: '48%' }} />
                        </div>
                    </article>
                    <article className="panel metric-panel">
                        <div className="panel-heading">
                            <h2>Error Rate</h2>
                            <span className="pill">24h</span>
                        </div>
                        <strong>0.8%</strong>
                        <div className="metric-line" aria-hidden="true" />
                    </article>
                    <article className="panel metric-panel">
                        <div className="panel-heading">
                            <h2>Database Size</h2>
                            <span className="pill medium">MongoDB</span>
                        </div>
                        <strong>2.4 GB</strong>
                        <div className="metric-donut" aria-hidden="true" />
                    </article>
                </section>
            )}
        </div>
    );
};

export default AdminDashboard;
