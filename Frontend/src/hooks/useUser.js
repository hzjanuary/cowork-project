import { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

export const useUser = () => {
    return useContext(UserContext);
}