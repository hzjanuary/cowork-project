import { useState, useEffect, useRef } from 'react';
import { Tabs, Dropdown, Space, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Typography, Button } from '@mui/material';

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

    const tabItems = [
        {
            key: '1',
            label: 'Home',
            onClick: () => navigate('/')
        },
        {
            key: '2',
            label: 'Tests',
            onClick: () => navigate('/tests')
        },
        {
            key: '3',
            label: 'Questions',
            onClick: () => navigate('/questions')
        },
        {
            key: '4',
            label: 'FAQ',
            onClick: () => navigate('/faq')
        }
    ];

    const profileMenuItems = [
        {
            key: 'profile',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile')
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
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
                <Box sx={{ flex: 1, mx: 4 }}>
                    <Tabs
                        activeKey={activeTab}
                        items={tabItems}
                        onChange={setActiveTab}
                        sx={{
                            '& .ant-tabs-tab': {
                                color: theme === 'dark' ? '#bbb' : '#666'
                            },
                            '& .ant-tabs-tab-active': {
                                color: theme === 'dark' ? '#fff' : '#1a1a1a'
                            }
                        }}
                    />
                </Box>
            )}

            {/* Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isAuthenticated && account ? (
                    <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar
                                size={40}
                                icon={<UserOutlined />}
                                style={{
                                    backgroundColor: '#667eea',
                                    cursor: 'pointer'
                                }}
                            />
                            <Typography
                                sx={{
                                    color: theme === 'dark' ? '#fff' : '#1a1a1a',
                                    fontSize: '14px',
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