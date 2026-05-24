import { createContext, useState, useEffect } from "react";
import instance from '../config/axios.config.js';

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]);
    const [question, setQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createQuestion = async({ userId, sourceFile, testId, questionText, type, options, answer, difficulty }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.post('/api/questions/create', {
                userId,
                sourceFile,
                testId,
                questionText,
                type,
                options,
                answer,
                difficulty
            });
            setQuestion(res.data.data);
            setQuestions([...questions, res.data.data]);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getAllQuestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.get('/api/questions/all');
            setQuestions(res.data.data);
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getQuestionsByUserId = async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.get(`/api/questions/user/${userId}`);
            setQuestions(res.data.data);
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getQuestionsByTestId = async (testId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.get(`/api/questions/test/${testId}`);
            setQuestions(res.data.data);
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const editQuestion = async (questionId, { questionText, type, options, answer, difficulty, testId }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.put(`/api/questions/edit/${questionId}`, {
                questionText,
                type,
                options,
                answer,
                difficulty,
                testId
            });
            const updatedQuestions = questions.map(q => q._id === questionId ? res.data.data : q);
            setQuestions(updatedQuestions);
            setQuestion(res.data.data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const deleteQuestion = async (questionId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.delete(`/api/questions/delete/${questionId}`);
            setQuestions(questions.filter(q => q._id !== questionId));
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <QuestionContext.Provider value={{
            questions,
            question,
            isLoading,
            error,
            createQuestion,
            getAllQuestions,
            getQuestionsByUserId,
            getQuestionsByTestId,
            editQuestion,
            deleteQuestion
        }}>
            {children}
        </QuestionContext.Provider>
    )
}