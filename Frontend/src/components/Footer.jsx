import { useState } from 'react';
import { Switch, Space } from 'antd';
import { BgColorsOutlined, SunOutlined, BgColorsOutlined as MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../hooks/useTheme.js';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                mt: 8,
                py: 4,
                px: 4,
                backgroundColor: theme === 'dark' ? '#111827' : '#F6F7F9',
                borderTop: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                {/* Footer Content */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme === 'dark' ? '#bbb' : '#666'
                        }}
                    >
                        © 2026 Quizzle. All rights reserved.
                    </Typography>
                </Box>

                {/* Theme Toggle */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme === 'dark' ? '#bbb' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        {theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
                        {/* {theme === 'light' ? 'Light' : 'Dark'} Mode */}
                    </Typography>
                    <Switch
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        style={{
                            backgroundColor: theme === 'dark' ? '#667eea' : '#bfbfbf'
                        }}
                    />
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;