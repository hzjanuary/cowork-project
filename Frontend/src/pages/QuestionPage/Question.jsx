import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestion } from '../../hooks/useQuestion';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { PlusOutlined, SaveOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import RichTextEditor from '../../components/RichTextEditor.jsx';
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
            setEditData({
                questionText: questionData.questionText || '',
                type: questionData.type || 'multiple_choice',
                answer: questionData.answer || '',
                difficulty: questionData.difficulty || 'easy',
                testId: questionData.testId || '',
                options: questionData.options ? questionData.options.map(opt => ({ ...opt })) : []
            });
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

    const handleEditChange = (field, value) => {
        setEditData((current) => ({ ...current, [field]: value }));
    };

    const handleOptionChange = (index, field, value) => {
        setEditData((current) => {
            const options = (current.options || []).map((option, optionIndex) => (
                optionIndex === index ? { ...option, [field]: value } : option
            ));
            return { ...current, options };
        });
    };

    const handleAddOption = () => {
        const nextLabel = String.fromCharCode(65 + (editData.options || []).length);
        setEditData((current) => ({
            ...current,
            options: [...(current.options || []), { label: nextLabel, text: '', isCorrect: false }]
        }));
    };

    const handleSaveEdit = async (event) => {
        event.preventDefault();
        if (!editData.questionText.trim()) {
            toast.error('Question text is required.');
            return;
        }

        const payload = {
            questionText: editData.questionText,
            type: editData.type,
            answer: editData.answer,
            difficulty: editData.difficulty,
            options: editData.type === 'multiple_choice' ? (editData.options || []).filter((opt) => opt.text.trim()) : [],
            testId: editData.testId || undefined
        };

        try {
            setIsLoading(true);
            await editQuestion(id, payload);
            toast.success('Question updated successfully.');
            setIsEditMode(false);
            fetchQuestion();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Question could not be updated.');
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loading">Loading question...</div>;
    if (!question) return <div>Question not found</div>;

    // Check if user can see the correct answer
    const canSeeCorrectAnswer = account?.role === 'teacher' || question.hasAnswered;

    if (isEditMode) {
        return (
            <div className="question-details-container">
                <section className="page-heading">
                    <div>
                        <span className="eyebrow">Edit exercise</span>
                        <h1>Modify question details</h1>
                    </div>
                </section>

                <form className="form-panel" onSubmit={handleSaveEdit}>
                    <label>
                        Question text
                        <RichTextEditor
                            value={editData.questionText}
                            onChange={(html) => handleEditChange('questionText', html)}
                        />
                    </label>

                    <div className="form-grid">
                        <label>
                            Type
                            <select value={editData.type} onChange={(event) => handleEditChange('type', event.target.value)}>
                                <option value="multiple_choice">Multiple choice</option>
                                <option value="true_false">True / false</option>
                                <option value="short_answer">Short answer</option>
                            </select>
                        </label>
                        <label>
                            Difficulty
                            <select value={editData.difficulty} onChange={(event) => handleEditChange('difficulty', event.target.value)}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </label>
                        <label>
                            Test ID
                            <input
                                value={editData.testId || ''}
                                onChange={(event) => handleEditChange('testId', event.target.value)}
                                placeholder="Optional"
                            />
                        </label>
                    </div>

                    {editData.type === 'multiple_choice' && (
                        <section className="option-editor">
                            <div className="panel-heading">
                                <h2>Answer options</h2>
                                <button className="btn btn-secondary" onClick={handleAddOption} type="button">
                                    <PlusOutlined /> Option
                                </button>
                            </div>
                            {(editData.options || []).map((option, index) => (
                                <div className="option-row" key={option.label || index}>
                                    <input
                                        value={option.label || ''}
                                        onChange={(event) => handleOptionChange(index, 'label', event.target.value)}
                                        aria-label="Option label"
                                        style={{ width: '60px' }}
                                    />
                                    <input
                                        value={option.text || ''}
                                        onChange={(event) => handleOptionChange(index, 'text', event.target.value)}
                                        placeholder={`Option ${option.label}`}
                                    />
                                    <label className="check-row">
                                        <input
                                            type="checkbox"
                                            checked={!!option.isCorrect}
                                            onChange={(event) => handleOptionChange(index, 'isCorrect', event.target.checked)}
                                        />
                                        Correct
                                    </label>
                                </div>
                            ))}
                        </section>
                    )}

                    <label>
                        Stored answer
                        <input
                            value={editData.answer || ''}
                            onChange={(event) => handleEditChange('answer', event.target.value)}
                            placeholder="Exact answer used by backend grading"
                        />
                    </label>

                    <div className="action-row">
                        <button className="btn btn-primary" type="submit">
                            <SaveOutlined /> Save Changes
                        </button>
                        <button className="btn btn-secondary" type="button" onClick={() => { setEditData(question); setIsEditMode(false); }}>
                            <CloseOutlined /> Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="question-details-container">
            <div className="question-header">
                {/* <h2 className="question-text">{question.questionText}</h2> */}
                <h2 className="question-text" dangerouslySetInnerHTML={{ __html: question.questionText }} />
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
                        <button onClick={() => setIsEditMode(true)} className="btn btn-secondary"><EditOutlined /> Edit</button>
                        <button onClick={() => {
                            if (window.confirm('Delete this question?')) {
                                deleteQuestion(id);
                                navigate('/questions');
                            }
                        }} className="btn btn-danger"><DeleteOutlined /> Delete</button>
                        
                        {question.status === 'pending_verification' && (
                            <>
                                <button 
                                    onClick={() => handleReviewQuestion(true)} 
                                    disabled={isReviewing}
                                    className="btn btn-success"
                                >
                                    {isReviewing ? 'Approving...' : 'Approve Question'}
                                </button>
                                <button 
                                    onClick={() => handleReviewQuestion(false)} 
                                    disabled={isReviewing}
                                    className="btn btn-danger"
                                >
                                    {isReviewing ? 'Rejecting...' : 'Reject Question'}
                                </button>
                            </>
                        )}
                    </>
                )}
                <button onClick={() => navigate(`/questions/${id}/answer`)} className="btn btn-success">
                    Answer Question
                </button>
                <button onClick={() => navigate('/questions')} className="btn btn-secondary">Back to Questions</button>
            </div>
        </div>
    );
};

/* COMMENTED OUT OLD RETURN BLOCK FOR COMPARISON:
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
*/


export default Question;
