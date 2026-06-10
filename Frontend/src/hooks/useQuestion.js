import { useContext } from 'react';
import { QuestionContext } from '../context/QuestionContext.jsx';

export const useQuestion = () => {
    return useContext(QuestionContext);
};
