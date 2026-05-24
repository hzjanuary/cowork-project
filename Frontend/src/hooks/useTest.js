import { useContext } from 'react';
import { TestContext } from '../context/TestContext.js';

const useTest = () => {
    return useContext(TestContext);
    
};

export default useTest;
