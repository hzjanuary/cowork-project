import { useContext } from 'react';
import { TestContext } from '../context/TestContext.jsx';

export const useTest = () => {
    return useContext(TestContext);
    
};

