import { useContext } from 'react';
import { TestContext } from '../context/TestContext.jsx';

const useTest = () => {
    return useContext(TestContext);
    
};

export default useTest;
