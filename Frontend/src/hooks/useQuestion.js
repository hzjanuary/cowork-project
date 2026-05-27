import { useContext } from 'react';
import { QuestionContext } from '../context/QuestionContext.jsx';

const useQuestion = () => {
    return useContext(QuestionContext);
};

export default useQuestion;
