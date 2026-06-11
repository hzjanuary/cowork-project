import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { useTest } from '../../hooks/useTest';

const formatQuestionType = (type) => (type || '').replace('_', ' ');

const DoTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getTestById, startTest, submitTest } = useTest();
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [testStarted, setTestStarted] = useState(false);
    const [testAttemptId, setTestAttemptId] = useState(null);
    const [fiveMinuteWarningShown, setFiveMinuteWarningShown] = useState(false);

    const answersRef = useRef({});
    const testAttemptIdRef = useRef(null);
    const submittedRef = useRef(false);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        testAttemptIdRef.current = testAttemptId;
    }, [testAttemptId]);

    const initializeAnswers = (nextQuestions) => {
        const initialAnswers = {};
        nextQuestions.forEach((question) => {
            initialAnswers[question._id] = '';
        });
        setAnswers(initialAnswers);
    };

    useEffect(() => {
        const fetchTestData = async () => {
            try {
                setIsLoading(true);
                const testData = await getTestById(id);
                const populatedQuestions = (testData?.questions || []).filter((question) => (
                    question && typeof question === 'object'
                ));

                setTest(testData);
                setQuestions(populatedQuestions);
                initializeAnswers(populatedQuestions);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch test.');
                navigate('/student');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmitTest = useCallback(async ({ auto = false } = {}) => {
        if (submittedRef.current) return;

        if (!auto && !window.confirm('Are you sure you want to submit the test?')) return;

        const activeAttemptId = testAttemptIdRef.current;
        if (!activeAttemptId) {
            toast.error('No active test attempt was found. Start the test again.');
            return;
        }

        submittedRef.current = true;

        try {
            setIsSubmitting(true);
            const answersArray = questions.map((question) => ({
                questionId: question._id,
                studentAnswer: answersRef.current[question._id] || ''
            }));

            await submitTest(activeAttemptId, answersArray);
            toast.success(auto ? 'Time is up. Test submitted automatically.' : 'Test submitted successfully.');
            navigate('/student');
        } catch (error) {
            submittedRef.current = false;
            toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit test.');
        } finally {
            setIsSubmitting(false);
        }
    }, [navigate, questions, submitTest]);

    useEffect(() => {
        if (!testStarted || isSubmitting || submittedRef.current || timeRemaining === null) return undefined;

        if (timeRemaining <= 0) {
            handleSubmitTest({ auto: true });
            return undefined;
        }

        const timer = setInterval(() => {
            setTimeRemaining((current) => {
                if (current === null) return current;
                return current <= 1 ? 0 : current - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [handleSubmitTest, isSubmitting, testStarted, timeRemaining]);

    useEffect(() => {
        if (testStarted && timeRemaining === 300 && !fiveMinuteWarningShown) {
            setFiveMinuteWarningShown(true);
            toast.warn('5 minutes remaining. Review your answers and submit soon.');
        }
    }, [fiveMinuteWarningShown, testStarted, timeRemaining]);

    const handleStartTest = async () => {
        try {
            setIsLoading(true);
            const started = await startTest(id);
            const startedQuestions = started?.test?.questions || [];

            if (!started?.testAttemptId || !startedQuestions.length) {
                toast.error('This test has no available questions.');
                return;
            }

            setTestAttemptId(started.testAttemptId);
            setTest(started.test);
            setQuestions(startedQuestions);
            initializeAnswers(startedQuestions);
            setCurrentQuestionIndex(0);
            setTestStarted(true);
            setFiveMinuteWarningShown(false);
            submittedRef.current = false;

            const limitInMinutes = Number(started.test.timeLimit || 0);
            setTimeRemaining(limitInMinutes > 0 ? limitInMinutes * 60 : null);
            toast.success('Test started.');
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to start test.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers((current) => ({
            ...current,
            [questionId]: answer
        }));
    };

    const formatTime = (seconds) => {
        const safeSeconds = Math.max(0, seconds || 0);
        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        const secs = safeSeconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const answeredCount = questions.filter((question) => answers[question._id]).length;
    const currentQuestion = questions[currentQuestionIndex];

    if (isLoading && !testStarted) return <div className="loading">Loading test...</div>;
    if (!test) return <div className="empty-state">Test not found.</div>;

    if (!testStarted) {
        return (
            <div className="page-stack">
                <section className="page-heading">
                    <div>
                        <span className="eyebrow">Test preview</span>
                        <h1>{test.title}</h1>
                    </div>
                </section>

                <section className="panel test-start-panel">
                    <div className="test-start-meta">
                        <span>{questions.length} questions</span>
                        <span>{test.timeLimit ? `${test.timeLimit} minutes` : 'No time limit'}</span>
                    </div>
                    <p className="muted">
                        Start the test when you are ready. Your answers are submitted only from this active attempt.
                    </p>
                    {!questions.length && (
                        <p className="alert warning">This test has no populated questions yet.</p>
                    )}
                    <div className="action-row">
                        <button className="btn btn-primary" onClick={handleStartTest} disabled={isLoading || !questions.length} type="button">
                            Start Test
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/student')} type="button">
                            Cancel
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    if (!currentQuestion) {
        return <div className="empty-state">This test has no available questions.</div>;
    }

    return (
        <div className="page-stack do-test-container">
            <section className="test-taking-header">
                <div>
                    <span className="eyebrow">Active test</span>
                    <h1>{test.title}</h1>
                </div>
                <div className={`test-timer ${timeRemaining !== null && timeRemaining <= 300 ? 'warning' : ''}`}>
                    <ClockCircleOutlined />
                    <strong>{timeRemaining === null ? 'No limit' : formatTime(timeRemaining)}</strong>
                </div>
            </section>

            {timeRemaining !== null && timeRemaining <= 300 && (
                <div className="alert warning">
                    5 minutes or less remaining. Submit before the timer reaches 00:00.
                </div>
            )}

            <section className="test-progress-panel">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                </div>
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{answeredCount} answered</span>
            </section>

            <section className="test-execution-grid">
                <aside className="question-nav panel">
                    {questions.map((question, index) => (
                        <button
                            className={`question-nav-item ${index === currentQuestionIndex ? 'active' : ''} ${answers[question._id] ? 'answered' : ''}`}
                            key={question._id}
                            onClick={() => setCurrentQuestionIndex(index)}
                            type="button"
                        >
                            {index + 1}
                        </button>
                    ))}
                </aside>

                <article className="panel question-workspace">
                    <div className="question-meta">
                        <span>{formatQuestionType(currentQuestion.type)}</span>
                        <span>{currentQuestion.difficulty || 'easy'}</span>
                    </div>
                    <h2>{currentQuestion.questionText}</h2>

                    {currentQuestion.type === 'multiple_choice' && (
                        <div className="answer-options">
                            {currentQuestion.options?.map((option) => (
                                <label
                                    className={`answer-option ${answers[currentQuestion._id] === option.label ? 'selected' : ''}`}
                                    key={`${currentQuestion._id}-${option.label}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion._id}`}
                                        value={option.label}
                                        checked={answers[currentQuestion._id] === option.label}
                                        onChange={(event) => handleAnswerChange(currentQuestion._id, event.target.value)}
                                    />
                                    <strong>{option.label}</strong>
                                    <span>{option.text}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'true_false' && (
                        <div className="answer-options compact">
                            {['true', 'false'].map((option) => (
                                <label
                                    className={`answer-option ${answers[currentQuestion._id] === option ? 'selected' : ''}`}
                                    key={`${currentQuestion._id}-${option}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion._id}`}
                                        value={option}
                                        checked={answers[currentQuestion._id] === option}
                                        onChange={(event) => handleAnswerChange(currentQuestion._id, event.target.value)}
                                    />
                                    <span>{option === 'true' ? 'True' : 'False'}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'short_answer' && (
                        <label>
                            Your answer
                            <textarea
                                value={answers[currentQuestion._id] || ''}
                                onChange={(event) => handleAnswerChange(currentQuestion._id, event.target.value)}
                                placeholder="Type your answer"
                                rows="5"
                            />
                        </label>
                    )}

                    <div className="test-navigation">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentQuestionIndex((current) => Math.max(0, current - 1))}
                            disabled={currentQuestionIndex === 0}
                            type="button"
                        >
                            Previous
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentQuestionIndex((current) => Math.min(questions.length - 1, current + 1))}
                            disabled={currentQuestionIndex === questions.length - 1}
                            type="button"
                        >
                            Next
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSubmitTest()}
                            disabled={isSubmitting}
                            type="button"
                        >
                            <SendOutlined /> {isSubmitting ? 'Submitting...' : 'Submit Test'}
                        </button>
                    </div>
                </article>
            </section>
        </div>
    );
};

export default DoTest;
