import { createContext, useState, useEffect } from 'react'
import instance from '../config/axiosConfig.js';

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createUser = async ({ fullName, phoneNumber, dateOfBirth }) => {
        console.log('📝 [createUser] Starting user creation with:', { fullName, phoneNumber, dateOfBirth });
        setIsLoading(true);
        setError(null);
        try {
            console.log('📝 [createUser] Sending POST request to /api/users');
            const res = await instance.post('/api/users', {
                fullName,
                phoneNumber,
                dateOfBirth
            });
            console.log('✅ [createUser] Success! User created:', res.data);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            console.error('❌ [createUser] Error occurred:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                fullError: err
            });
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const updateAvatar = async (userId, avatarFile) => {
        console.log('🖼️  [updateAvatar] Starting avatar upload for user:', userId);
        console.log('🖼️  [updateAvatar] File details:', {
            name: avatarFile.name,
            size: avatarFile.size,
            type: avatarFile.type,
            sizeInMB: (avatarFile.size / 1024 / 1024).toFixed(2)
        });
        
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            
            console.log('🖼️  [updateAvatar] FormData created. Keys:', Array.from(formData.keys()));
            console.log('🖼️  [updateAvatar] Sending POST request to /api/users/upload-avatar');
            
            const res = await instance.post('/api/users/upload-avatar', formData);
            
            console.log('✅ [updateAvatar] Success! Response:', res.data);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            console.error('❌ [updateAvatar] Error occurred:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                errorData: err.response?.data,
                fullError: err
            });
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const updateUser = async (userId, { fullName, phoneNumber, dateOfBirth }) => {
        console.log('✏️  [updateUser] Starting user update for user:', userId);
        console.log('✏️  [updateUser] Update data:', { fullName, phoneNumber, dateOfBirth });
        setIsLoading(true);
        setError(null);
        try {
            console.log('✏️  [updateUser] Sending PUT request to /api/users/', userId);
            const res = await instance.put(`/api/users/${userId}`, {
                fullName,
                phoneNumber,
                dateOfBirth
            });
            console.log('✅ [updateUser] Success! User updated:', res.data);
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            console.error('❌ [updateUser] Error occurred:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                fullError: err
            });
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getUser = async (userId) => {
        console.log('🔍 [getUser] Fetching user:', userId);
        setIsLoading(true);
        setError(null);
        try {
            console.log('🔍 [getUser] Sending GET request to /api/users/', userId);
            const res = await instance.get(`/api/users/${userId}`);
            console.log('✅ [getUser] Success! User fetched:', res.data);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            console.error('❌ [getUser] Error occurred:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                fullError: err
            });
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const changePassword = async ({ currentPassword, newPassword, confirmNewPassword }) => {
        console.log('🔑 [changePassword] Starting password change');
        setError(null);
        try {
            console.log('🔑 [changePassword] Sending POST request to /api/users/change-password');
            const res = await instance.post('/api/users/change-password', {
                currentPassword,
                newPassword,
                confirmNewPassword
            });
            console.log('✅ [changePassword] Success!', res.data);
            return res.data;
        } catch (err) {
            console.error('❌ [changePassword] Error occurred:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                fullError: err
            });
            setError(err.message);
            throw err;
        }
    }

    const getCurrentUser = async () => {
        console.log('👤 [getCurrentUser] Fetching current user');
        setIsLoading(true);
        setError(null);
        try {
            console.log('👤 [getCurrentUser] Sending GET request to /api/users/me');
            const res = await instance.get('/api/users/me');
            console.log('✅ [getCurrentUser] Success! Current user:', res.data);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            console.error('❌ [getCurrentUser] Error occurred:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                fullError: err
            });
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <UserContext.Provider value={{
            user,
            isLoading,
            error,
            createUser,
            updateUser,
            updateAvatar,
            getUser,
            getCurrentUser,
            changePassword
        }}>
            {children}
        </UserContext.Provider>
    )
}