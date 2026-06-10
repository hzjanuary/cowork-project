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
    const [isReviewing, setIsReviewing] = useState(false);
    const { getQuestionById, deleteQuestion, editQuestion, reviewQuestion } = useQuestion();
    const { account } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            setIsLoading(true);
            const questionData = await getQuestionById(id);
            setQuestion(questionData);
            setEditData(questionData);
        } catch (error) {
            toast.error('Failed to fetch question');
            navigate('/questions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReviewQuestion = async (approved) => {
        try {
            setIsReviewing(true);
            await reviewQuestion(id, approved);
            toast.success(`Question ${approved ? 'approved' : 'rejected'} successfully`);
            fetchQuestion();
        } catch (error) {
            toast.error('Failed to review question');
        } finally {
            setIsReviewing(false);
        }
    };

    if (isLoading) return <div className="loading">Loading question...</div>;
    if (!question) return <div>Question not found</div>;

    // Check if user can see the correct answer
    const canSeeCorrectAnswer = account?.role === 'teacher' || question.hasAnswered;

    return (
        <div className="question-details-container">
            <div className="question-header">
                <h2>{question.questionText}</h2>
                <div className="question-meta">
                    <span className="badge type">{question.type}</span>
                    <span className="badge difficulty">{question.difficulty}</span>
                    {account?.role === 'teacher' && (
                        <span className={`badge status ${question.status}`}>{question.status}</span>
                    )}
                    {question.hasAnswered && (
                        <span className="badge answered">✓ You answered</span>
                    )}
                </div>
            </div>

            <div className="question-content">
                {question.type === 'multiple_choice' && (
                    <div className="options">
                        <h4>Options:</h4>
                        {question.options?.map((option, index) => (
                            <div key={index} className={`option ${option.isCorrect && canSeeCorrectAnswer ? 'correct' : ''}`}>
                                <strong>{option.label}.</strong> {option.text}
                                {option.isCorrect && canSeeCorrectAnswer && <span className="correct-badge">✓ Correct</span>}
                            </div>
                        ))}
                    </div>
                )}

                {question.type === 'true_false' && (
                    <div className="content">
                        {canSeeCorrectAnswer && (
                            <h4>Correct Answer: <strong>{question.answer}</strong></h4>
                        )}
                        {!canSeeCorrectAnswer && (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>Answer this question to see the correct answer</p>
                        )}
                    </div>
                )}

                {question.type === 'short_answer' && (
                    <div className="content">
                        {canSeeCorrectAnswer && (
                            <h4>Correct Answer: <strong>{question.answer}</strong></h4>
                        )}
                        {!canSeeCorrectAnswer && (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>Answer this question to see the correct answer</p>
                        )}
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
                        
                        {question.status === 'pending_verification' && (
                            <>
                                <button 
                                    onClick={() => handleReviewQuestion(true)} 
                                    disabled={isReviewing}
                                    className="btn-success"
                                >
                                    {isReviewing ? 'Approving...' : 'Approve Question'}
                                </button>
                                <button 
                                    onClick={() => handleReviewQuestion(false)} 
                                    disabled={isReviewing}
                                    className="btn-danger"
                                >
                                    {isReviewing ? 'Rejecting...' : 'Reject Question'}
                                </button>
                            </>
                        )}
                    </>
                )}
                <button onClick={() => navigate(`/questions/${id}/answer`)} className="btn-success">
                    Answer Question
                </button>
                <button onClick={() => navigate('/questions')} className="btn-secondary">Back to Questions</button>
            </div>
        </div>
    );
};

export default Question;
