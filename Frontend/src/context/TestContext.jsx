/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import instance from '../config/axiosConfig.js';

export const TestContext = createContext();

export const TestProvider = ({ children }) => {
    const [tests, setTests] = useState([]);
    const [test, setTest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createTest = async({ title, userId, timeLimit, visibility, questions = [] }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.post('/api/tests', {
                title,
                userId,
                questions,
                timeLimit: timeLimit || 0,
                visibility: visibility || 'private'
            });
            setTest(res.data.data);
            setTests([...tests, res.data.data]);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getAllTests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.get('/api/tests');
            setTests(res.data.data);
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getTestById = async (testId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.get(`/api/tests/${testId}`);
            setTest(res.data.data);
            return res.data.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const startTest = async (testId) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await instance.post(`/api/tests/tests/${testId}/start`);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const submitTest = async (testAttemptId, answers) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await instance.post('/api/tests/test-attempts/submit', { testAttemptId, answers });
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getTestResults = async (testAttemptId) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await instance.get(`/api/tests/test-attempts/${testAttemptId}/results`);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const getMyTestAttempts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await instance.get('/api/tests/test-attempts/me');
            return res.data.data || [];
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const updateTest = async (testId, { title, timeLimit, visibility, questions }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.put(`/api/tests/${testId}`, {
                title,
                timeLimit,
                visibility,
                questions
            });
            const updatedTests = tests.map(t => t._id === testId ? res.data.data : t);
            setTests(updatedTests);
            setTest(res.data.data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const deleteTest = async (testId) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await instance.delete(`/api/tests/${testId}`);
            setTests(tests.filter(t => t._id !== testId));
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <TestContext.Provider value={{
            tests,
            test,
            isLoading,
            error,
            createTest,
            getAllTests,
            getTestById,
            updateTest,
            deleteTest,
            startTest,
            submitTest,
            getTestResults,
            getMyTestAttempts
        }}>
            {children}
        </TestContext.Provider>
    )
}
