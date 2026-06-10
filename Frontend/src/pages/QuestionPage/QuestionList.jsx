import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestion } from '../../hooks/useQuestion';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
// import './QuestionPage.css';

const QuestionList = () => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getAllQuestions, deleteQuestion } = useQuestion();
    const { account } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const data = await getAllQuestions();
            setQuestions(data || []);
        } catch (error) {
            toast.error('Failed to fetch questions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            await deleteQuestion(questionId);
            setQuestions(questions.filter(q => q._id !== questionId));
            toast.success('Question deleted successfully');
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    return (
        <div className="question-list-container">
            <div className="question-list-header">
                <h2>Questions</h2>
                <button onClick={() => navigate('/create-question')} className="btn-primary">
                    Create New Question
                </button>
            </div>

            {isLoading ? (
                <div className="loading">Loading questions...</div>
            ) : questions.length === 0 ? (
                <div className="empty-state">
                    <p>No questions available</p>
                    <button onClick={() => navigate('/create-question')} className="btn-primary">
                        Create First Question
                    </button>
                </div>
            ) : (
                <div className="questions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Difficulty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map(question => (
                                <tr key={question._id}>
                                    <td>{question.questionText}</td>
                                    <td>{question.type}</td>
                                    <td>{question.difficulty}</td>
                                    <td><span className={`status ${question.status}`}>{question.status}</span></td>
                                    <td>
                                        <button
                                            onClick={() => navigate(`/questions/${question._id}`)}
                                            className="btn-secondary"
                                        >
                                            View
                                        </button>
                                        {account?.role === 'teacher' && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/questions/${question._id}?edit=true`)}
                                                    className="btn-secondary"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(question._id)}
                                                    className="btn-danger"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default QuestionList;
