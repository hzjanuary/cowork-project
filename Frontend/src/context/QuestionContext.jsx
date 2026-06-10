/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import instance from '../config/axiosConfig.js';

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]);
    const [question, setQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createQuestion = async({ sourceFile, testId, questionText, type, options, answer, difficulty }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.post('/api/questions', {
                sourceFile,
                testId,
                questionText,
                type,
                options,
                answer,
                difficulty
            });
            setQuestion(res.data.data);
            setQuestions((current) => {
                const exists = current.some((item) => item._id === res.data.data._id);
                return exists ? current : [res.data.data, ...current];
            });
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
            const res = await instance.get('/api/questions');
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

    const getQuestionBankForAccount = async (account) => {
        setIsLoading(true);
        setError(null);
        try {
            const allRes = await instance.get('/api/questions');
            const visibleQuestions = allRes.data.data || [];

            if (!account?._id || account.role === 'teacher') {
                setQuestions(visibleQuestions);
                return visibleQuestions;
            }

            const ownRes = await instance.get(`/api/questions/user/${account._id}`);
            const ownQuestions = ownRes.data.data || [];
            const merged = [...ownQuestions, ...visibleQuestions].filter((question, index, list) => (
                list.findIndex((item) => item._id === question._id) === index
            ));

            setQuestions(merged);
            return merged;
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

    const getQuestionById = async (questionId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.get(`/api/questions/${questionId}`);
            setQuestion(res.data.data);
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

    const answerQuestion = async (questionId, answer) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await instance.post(`/api/questions/answer/${questionId}`, { answer });
            return res.data;
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const reviewQuestion = async (questionId, approved) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await instance.put(`/api/questions/review/${questionId}`, { approved });
            const updatedQuestions = questions.map(q => q._id === questionId ? res.data.data : q);
            setQuestions(updatedQuestions);
            setQuestion(res.data.data);
            return res.data;
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            throw error;
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
            getQuestionBankForAccount,
            getQuestionsByUserId,
            getQuestionsByTestId,
            getQuestionById,
            editQuestion,
            deleteQuestion,
            answerQuestion,
            reviewQuestion
        }}>
            {children}
        </QuestionContext.Provider>
    )
}
