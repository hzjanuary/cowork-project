import { useContext } from 'react';
import { QuestionContext } from '../context/questionContext.js';

const useQuestion = () => {
    return useContext(QuestionContext);
};

export default useQuestion;
