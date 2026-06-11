import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTest } from '../../hooks/useTest';
import { useQuestion } from '../../hooks/useQuestion';
import { toast } from 'react-toastify';
// import './TestPage.css';

const DoTest = () => {
    const { id } = useParams();
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [testStarted, setTestStarted] = useState(false);
    const [testAttemptId, setTestAttemptId] = useState(null);
    const { getTestById, startTest, submitTest } = useTest();
    const { getQuestionsByTestId } = useQuestion();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (test && test.timeLimit && testStarted) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [test, testStarted]);

    async function fetchTestData() {
        try {
            setIsLoading(true);
            const testData = await getTestById(id);
            setTest(testData);

            try {
                const questionsData = await getQuestionsByTestId(id);
                setQuestions(questionsData || []);

                const answersObj = {};
                (questionsData || []).forEach(q => {
                    answersObj[q._id] = '';
                });
                setAnswers(answersObj);
            } catch {
                setQuestions([]);
                setAnswers({});
            }
        } catch {
            toast.error('Failed to fetch test');
            navigate('/student');
        } finally {
            setIsLoading(false);
        }
    }

    const handleStartTest = async () => {
        try {
            const started = await startTest(id);
            if (started?.testAttemptId) {
                setTestAttemptId(started.testAttemptId);
            }
            if (started?.test) {
                setTest(started.test);
                const startedQuestions = started.test.questions || [];
                if (!startedQuestions.length) {
                    toast.error('This test has no available questions.');
                    return;
                }
                setQuestions(startedQuestions);
                const answersObj = {};
                startedQuestions.forEach(q => {
                    answersObj[q._id] = '';
                });
                setAnswers(answersObj);
            }
            setTestStarted(true);
            if (started?.test?.timeLimit || test?.timeLimit) {
                setTimeRemaining((started?.test?.timeLimit || test.timeLimit) * 60);
            }
            toast.success('Test started!');
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to start test');
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    async function handleSubmitTest() {
        if (!window.confirm('Are you sure you want to submit the test?')) return;
        if (!testAttemptId) {
            toast.error('No active test attempt was found. Start the test again.');
            return;
        }

        try {
            setIsLoading(true);
            const answersArray = Object.keys(answers).map(questionId => ({
                questionId,
                studentAnswer: answers[questionId]
            }));

            await submitTest(testAttemptId, answersArray);
            toast.success('Test submitted successfully!');
            navigate(`/tests/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit test');
        } finally {
            setIsLoading(false);
        }
    }

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) return <div className="loading">Loading test...</div>;
    if (!test) return <div>Test not found</div>;
    if (testStarted && questions.length === 0) return <div>This test has no available questions</div>;

    if (!testStarted) {
        return (
            <div className="test-start-container">
                <div className="test-start-card">
                    <h2>{test.title}</h2>
                    <div className="test-info">
                        <p><strong>Total Questions:</strong> {questions.length || 'Loaded when you start'}</p>
                        <p><strong>Time Limit:</strong> {test.timeLimit || 'Unlimited'} minutes</p>
                    </div>
                    <p>Click the button below to start the test.</p>
                    <button onClick={handleStartTest} className="btn-primary">Start Test</button>
                    <button onClick={() => navigate('/student')} className="btn-secondary">Cancel</button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="do-test-container">
            <div className="test-progress">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
                <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>

            {timeRemaining !== null && (
                <div className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
                    Time Remaining: {formatTime(timeRemaining)}
                </div>
            )}

            <div className="question-container">
                <h3>{currentQuestion.questionText}</h3>

                {currentQuestion.type === 'multiple_choice' && (
                    <div className="options">
                        {currentQuestion.options?.map((option, index) => (
                            <div key={index} className="option">
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion._id}`}
                                        value={option.text}
                                        checked={answers[currentQuestion._id] === option.text}
                                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                                    />
                                    {option.text}
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {currentQuestion.type === 'true_false' && (
                    <div className="options">
                        {['True', 'False'].map((option) => (
                            <div key={option} className="option">
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion._id}`}
                                        value={option}
                                        checked={answers[currentQuestion._id] === option}
                                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                                    />
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {currentQuestion.type === 'short_answer' && (
                    <textarea
                        value={answers[currentQuestion._id]}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        placeholder="Enter your answer"
                        rows="4"
                    />
                )}
            </div>

            <div className="test-navigation">
                <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="btn-secondary"
                >
                    Previous
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="btn-secondary"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmitTest}
                        disabled={isLoading}
                        className="btn-success"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Test'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DoTest;
