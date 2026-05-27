import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Box, Container, Typography } from '@mui/material';
import { toast } from 'react-toastify';

const Profile = () => {
    const { account } = useAuth();
}

export default Profile;