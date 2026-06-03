import { useState, useEffect, useRef } from 'react';
import { Tabs, Dropdown, Space, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Typography, Button } from '@mui/material';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { account, isAuthenticated, logout } = useAuth();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('1');

    // Update active tab based on current route
    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveTab('1');
        else if (path === '/tests') setActiveTab('2');
        else if (path === '/questions') setActiveTab('3');
    }, [location.pathname]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        switch (key) {
            case '1':
                navigate('/');
                break;
            case '2':
                navigate('/tests');
                break;
            case '3':
                navigate('/questions');
                break;
            case '4':
                navigate('/faq');
                break;
            default:
                navigate('/');
        }
    };

    const tabItems = [
        {
            key: '1',
            label: 'Home'
        },
        {
            key: '2',
            label: 'Tests'
        },
        {
            key: '3',
            label: 'Questions'
        },
        {
            key: '4',
            label: 'FAQ'
        }
    ];

    const profileMenuItems = [
        {
            key: 'profile',
            label: 'My Profile',
            icon: <UserOutlined />,
            style: { color: theme === 'dark' ? '#fff' : '#1a1a1a', fontWeight: 'bold', fontSize: '16px' },
            onClick: () => navigate('/profile')
        },
        {
            type: 'divider'
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
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 4,
                py: 2,
                width: '100%',
                backgroundColor: theme === 'dark' ? '#111827' : '#F6F7F9',
                borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: '150px'
                }}
                onClick={() => navigate('/')}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    Quizzle
                </Typography>
            </Box>

            {/* Navigation Tabs - Only show when authenticated */}
            {isAuthenticated && (
                <Box sx={{ mx: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Tabs
                        activeKey={activeTab}
                        items={tabItems}
                        onChange={handleTabChange}
                        className= {theme === 'dark' ? 'tabs-dark' : 'tabs-light'}
                    />
                </Box>
            )}

            {/* Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isAuthenticated && account ? (
                    <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" trigger={['click']} className={theme === 'dark' ? 'dropdown-dark' : 'dropdown-light'}>
                        <Space style={{ cursor: 'pointer', width: '100%' }}>
                            <Avatar
                                size={40}
                                icon={<UserOutlined />}
                                style={{
                                    backgroundColor: '#667eea',
                                    cursor: 'pointer',
                                    border: theme === 'dark' ? '2px solid #333' : '2px solid #e0e0e0'
                                }}
                            />
                            <Typography
                                sx={{
                                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                                    fontWeight: 'bold',
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                {account?.username || 'User'}
                            </Typography>
                        </Space>
                    </Dropdown>
                ) : (<></>)}
            </Box>
        </Box>
    );
};

export default Header;