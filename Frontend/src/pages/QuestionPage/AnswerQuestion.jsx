import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuestion } from '../../hooks/useQuestion';
import { toast } from 'react-toastify';

const AnswerQuestion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getQuestionById, answerQuestion, isLoading, error } = useQuestion();
    
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState(null);

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            setIsLoadingPage(true);
            const questionData = await getQuestionById(id);
            setQuestion(questionData);
        } catch (err) {
            toast.error(err.message || 'Failed to fetch question');
            navigate('/questions');
        } finally {
            setIsLoadingPage(false);
        }
    };

    const handleAnswerSelect = (answer) => {
        if (!isSubmitted) {
            setSelectedAnswer(answer);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer) {
            toast.warning('Please select an answer');
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await answerQuestion(id, selectedAnswer);
            
            setIsCorrect(result.data.isCorrect);
            setCorrectAnswer(result.data.correctAnswer || result.data.correctLabel);
            setIsSubmitted(true);

            if (result.data.isCorrect) {
                toast.success('✓ Correct Answer!');
            } else {
                toast.error('✗ Incorrect Answer');
            }
        } catch (err) {
            toast.error('Error submitting answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setIsCorrect(null);
        setCorrectAnswer(null);
    };

    if (isLoadingPage || isLoading) {
        return (
            <div className="answer-question-container">
                <div className="loading">Loading question...</div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="answer-question-container">
                <div className="error">Question not found</div>
                <button onClick={() => navigate('/questions')} className="btn-secondary">
                    Back to Questions
                </button>
            </div>
        );
    }

    return (
        <div className="answer-question-container">
            <div className="question-card">
                {/* Question Header */}
                <div className="question-header">
                    <h2>{question.questionText}</h2>
                    <div className="question-meta">
                        <span className="badge type">{question.type}</span>
                        <span className="badge difficulty">{question.difficulty}</span>
                    </div>
                </div>

                {/* Question Content based on type */}
                <div className="question-content">
                    {question.type === 'multiple_choice' && (
                        <div className="options">
                            <h4>Select the correct answer:</h4>
                            <div className="options-grid">
                                {question.options?.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`option-item ${selectedAnswer === option.label ? 'selected' : ''} 
                                                    ${isSubmitted ? (option.isCorrect ? 'correct' : '') : ''}`}
                                        onClick={() => handleAnswerSelect(option.label)}
                                        disabled={isSubmitted}
                                    >
                                        <div className="option-label">{option.label}</div>
                                        <div className="option-text">{option.text}</div>
                                        {isSubmitted && option.isCorrect && (
                                            <div className="correct-indicator">✓ Correct</div>
                                        )}
                                        {isSubmitted && selectedAnswer === option.label && !option.isCorrect && (
                                            <div className="incorrect-indicator">✗ Your answer</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.type === 'true_false' && (
                        <div className="true-false">
                            <h4>Select True or False:</h4>
                            <div className="tf-options">
                                {['True', 'False'].map((answer) => (
                                    <button
                                        key={answer}
                                        className={`tf-option ${selectedAnswer === answer ? 'selected' : ''} 
                                                    ${isSubmitted ? (answer === question.answer ? 'correct' : '') : ''}`}
                                        onClick={() => handleAnswerSelect(answer)}
                                        disabled={isSubmitted}
                                    >
                                        {answer}
                                        {isSubmitted && answer === question.answer && (
                                            <span className="correct-indicator"> ✓</span>
                                        )}
                                        {isSubmitted && selectedAnswer === answer && answer !== question.answer && (
                                            <span className="incorrect-indicator"> ✗</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.type === 'short_answer' && (
                        <div className="short-answer">
                            <h4>Enter your answer:</h4>
                            <input
                                type="text"
                                value={selectedAnswer || ''}
                                onChange={(e) => handleAnswerSelect(e.target.value)}
                                placeholder="Type your answer here..."
                                disabled={isSubmitted}
                                className="answer-input"
                            />
                            {isSubmitted && (
                                <div className="answer-feedback">
                                    <p><strong>Correct Answer:</strong> {question.answer}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Answer Display */}
                {isSubmitted && (
                    <div className={`answer-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <h3>
                            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </h3>
                        {correctAnswer && (
                            <p>The correct answer is: <strong>{correctAnswer}</strong></p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="action-buttons">
                    {!isSubmitted ? (
                        <button 
                            onClick={handleSubmitAnswer} 
                            className="btn-success btn-large"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleReset} 
                                className="btn-secondary btn-large"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={() => navigate('/questions')} 
                                className="btn-primary btn-large"
                            >
                                Back to Questions
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .answer-question-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .question-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 30px;
                    margin-bottom: 20px;
                }

                .question-header {
                    margin-bottom: 30px;
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 20px;
                }

                .question-header h2 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 24px;
                }

                .question-meta {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .badge {
                    display: inline-block;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: capitalize;
                }

                .badge.type {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .badge.difficulty {
                    background: #f3e5f5;
                    color: #7b1fa2;
                }

                .question-content {
                    margin-bottom: 30px;
                }

                .question-content h4 {
                    margin: 0 0 15px 0;
                    color: #555;
                }

                /* Multiple Choice Options */
                .options-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                .option-item {
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: white;
                }

                .option-item:hover:not(:disabled) {
                    border-color: #1976d2;
                    background: #f5f5f5;
                }

                .option-item.selected {
                    border-color: #1976d2;
                    background: #e3f2fd;
                }

                .option-item.correct {
                    border-color: #4caf50;
                    background: #e8f5e9;
                }

                .option-label {
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 5px;
                }

                .option-text {
                    color: #666;
                }

                .correct-indicator {
                    margin-top: 10px;
                    color: #4caf50;
                    font-weight: 600;
                }

                .incorrect-indicator {
                    margin-top: 10px;
                    color: #f44336;
                    font-weight: 600;
                }

                /* True/False */
                .tf-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                }

                .tf-option {
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    font-size: 16px;
                }

                .tf-option:hover:not(:disabled) {
                    border-color: #1976d2;
                    background: #f5f5f5;
                }

                .tf-option.selected {
                    border-color: #1976d2;
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .tf-option.correct {
                    border-color: #4caf50;
                    background: #e8f5e9;
                    color: #4caf50;
                }

                /* Short Answer */
                .short-answer {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .answer-input {
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s ease;
                }

                .answer-input:focus {
                    outline: none;
                    border-color: #1976d2;
                }

                .answer-input:disabled {
                    background: #f5f5f5;
                    cursor: not-allowed;
                }

                .answer-feedback {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #1976d2;
                }

                .answer-feedback p {
                    margin: 0;
                    color: #666;
                }

                /* Result Display */
                .answer-result {
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .answer-result.correct {
                    background: #e8f5e9;
                    border-left: 4px solid #4caf50;
                }

                .answer-result.incorrect {
                    background: #ffebee;
                    border-left: 4px solid #f44336;
                }

                .answer-result h3 {
                    margin: 0 0 10px 0;
                }

                .answer-result.correct h3 {
                    color: #4caf50;
                }

                .answer-result.incorrect h3 {
                    color: #f44336;
                }

                .answer-result p {
                    margin: 0;
                    color: #666;
                }

                /* Action Buttons */
                .action-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .btn-large {
                    padding: 12px 24px;
                    font-size: 16px;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-success {
                    background: #4caf50;
                    color: white;
                }

                .btn-success:hover {
                    background: #45a049;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .btn-secondary {
                    background: #757575;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #616161;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .btn-primary {
                    background: #1976d2;
                    color: white;
                }

                .btn-primary:hover {
                    background: #1565c0;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .loading,
                .error {
                    text-align: center;
                    padding: 40px;
                    font-size: 18px;
                    color: #666;
                }

                @media (max-width: 768px) {
                    .question-card {
                        padding: 20px;
                    }

                    .question-header h2 {
                        font-size: 18px;
                    }

                    .options-grid {
                        grid-template-columns: 1fr;
                    }

                    .tf-options {
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    }

                    .action-buttons {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AnswerQuestion;
