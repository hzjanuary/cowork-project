import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Space } from 'antd';
import {
    BankOutlined,
    FileSearchOutlined,
    HomeOutlined,
    LogoutOutlined,
    QuestionCircleOutlined,
    ReadOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from './ThemeToggle.jsx';
import { getRoleHomePath, normalizeRole } from '../routes/roleRoutes.js';

const Header = () => {
    const navigate = useNavigate();
    const { account, isAuthenticated, logout } = useAuth();
    const role = normalizeRole(account?.role);

    const profileMenuItems = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <UserOutlined />,
            style: { fontWeight: 'bold', fontSize: '16px' },
            onClick: () => navigate('/profile')
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            style: { color: '#ff0000', fontWeight: 'bold', fontSize: '16px' },
            onClick: () => {
                logout();
                navigate('/login');
            }
        }
    ];

    return (
        <header className="app-header">
            <Link className="brand" to="/">
                <span className="brand-mark">日</span>
                <span>
                    <strong>Quizzle</strong>
                    <small>Quiz studio</small>
                </span>
            </Link>

            {isAuthenticated && (
                <nav className="main-nav" aria-label="Primary">
                    <NavLink to={getRoleHomePath(account?.role)} end><HomeOutlined /> Home</NavLink>
                    {role === 'teacher' && <NavLink to="/tests"><ReadOutlined /> Tests</NavLink>}
                    {role === 'teacher' && <NavLink to="/questions"><FileSearchOutlined /> Questions</NavLink>}
                    <NavLink to="/faq"><QuestionCircleOutlined /> FAQ</NavLink>
                </nav>
            )}

            <div className="header-actions">
                <ThemeToggle />
                {isAuthenticated && account ? (
                    <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" popupClassName="profile-menu">
                        <Space className="profile-trigger">
                            <Avatar icon={<UserOutlined />} />
                            <span>{account.username || 'Account'}</span>
                        </Space>
                    </Dropdown>
                ) : (
                    <Link className="btn btn-primary" to="/login">
                        <BankOutlined /> Login
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
