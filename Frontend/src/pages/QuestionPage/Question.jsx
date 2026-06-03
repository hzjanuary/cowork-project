import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestion } from '../../hooks/useQuestion';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
// import './QuestionPage.css';

const Question = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [question, setQuestion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true');
    const [editData, setEditData] = useState({});
    const { deleteQuestion, editQuestion } = useQuestion();
    const { account } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            setIsLoading(true);
            // Since we don't have a getQuestionById in the context, we'll need to pass the question through state
            // This is a limitation of the current architecture
            toast.info('View question details from list');
            navigate('/questions');
        } catch (error) {
            toast.error('Failed to fetch question');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loading">Loading question...</div>;
    if (!question) return <div>Question not found</div>;

    return (
        <div className="question-details-container">
            <div className="question-header">
                <h2>{question.questionText}</h2>
                <div className="question-meta">
                    <span className="badge type">{question.type}</span>
                    <span className="badge difficulty">{question.difficulty}</span>
                    <span className={`badge status ${question.status}`}>{question.status}</span>
                </div>
            </div>

            <div className="question-content">
                {question.type === 'multiple_choice' && (
                    <div className="options">
                        <h4>Options:</h4>
                        {question.options?.map((option, index) => (
                            <div key={index} className={`option ${option.isCorrect ? 'correct' : ''}`}>
                                <strong>{option.label}.</strong> {option.text}
                                {option.isCorrect && <span className="correct-badge">✓ Correct</span>}
                            </div>
                        ))}
                    </div>
                )}

                {question.type === 'true_false' && (
                    <div className="content">
                        <h4>Correct Answer: <strong>{question.answer}</strong></h4>
                    </div>
                )}

                {question.type === 'short_answer' && (
                    <div className="content">
                        <h4>Correct Answer: <strong>{question.answer}</strong></h4>
                    </div>
                )}
            </div>

            <div className="question-actions">
                {account?.role === 'teacher' && (
                    <>
                        <button onClick={() => setIsEditMode(true)} className="btn-secondary">Edit</button>
                        <button onClick={() => {
                            if (window.confirm('Delete this question?')) {
                                deleteQuestion(id);
                                navigate('/questions');
                            }
                        }} className="btn-danger">Delete</button>
                    </>
                )}
                {account?.role === 'teacher' && question.status === 'pending_verification' && (
                    <button onClick={() => navigate(`/questions/${id}/answer`)} className="btn-success">
                        Verify Answer
                    </button>
                )}
                <button onClick={() => navigate('/questions')} className="btn-secondary">Back to Questions</button>
            </div>
        </div>
    );
};

export default Question;
