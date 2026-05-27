import { createContext, useState, useEffect } from 'react'
import instance from '../config/axios.config.js';

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createUser = async ({ fullName, phoneNumber, dateOfBirth }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.post('/api/users/create', {
                fullName,
                phoneNumber,
                dateOfBirth
            });
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const updateUser = async (userId, { fullName, phoneNumber, dateOfBirth }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.put(`/api/users/update/${userId}`, {
                fullName,
                phoneNumber,
                dateOfBirth
            });
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getUser = async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.get(`/api/users/${userId}`);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const changePassword = async ({ currentPassword, newPassword, confirmNewPassword }) => {
        setError(null);
        try {
            const res = await instance.post('/api/users/change-password', {
                currentPassword,
                newPassword,
                confirmNewPassword
            });
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }

    return (
        <UserContext.Provider value={{
            user,
            isLoading,
            error,
            createUser,
            updateUser,
            getUser,
            changePassword
        }}>
            {children}
        </UserContext.Provider>
    )
}