import React from 'react';
import { useTheme } from '../hooks/useTheme.js';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { Box } from '@mui/material';

const MainLayout = ({ children }) => {
    const { theme } = useTheme();
    const location = useLocation();
    
    // Hide header and footer on login and register pages
    const hideHeaderFooter = ['/login', '/register'].includes(location.pathname);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: theme === 'dark' ? '#111827' : '#F6F7F9'
            }}
        >
            {!hideHeaderFooter && <Header />}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    width: '100%',
                    py: 4,
                    px: 4,
                    backgroundColor: theme === 'dark' ? '#111827' : '#F6F7F9',
                    transition: 'background-color 0.3s ease',
                    overflow: 'auto'
                }}
            >
                {children}
            </Box>
            {!hideHeaderFooter && <Footer />}
        </Box>
    )
}

export default MainLayout;