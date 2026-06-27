import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    RightOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { useTest } from '../../hooks/useTest.js';
import { useQuestion } from '../../hooks/useQuestion.js';

const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { tests, getAllTests, getMyTestAttempts, isLoading } = useTest();
    const { questions, getAllQuestions, isLoading: questionsLoading } = useQuestion();
    const [attempts, setAttempts] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [attemptsLoading, setAttemptsLoading] = useState(false);
    const [practiceDifficulty, setPracticeDifficulty] = useState('all');
    const [practiceQueue, setPracticeQueue] = useState([]);
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [practiceAnswer, setPracticeAnswer] = useState('');
    const [practiceFeedback, setPracticeFeedback] = useState(null);
    const [practiceScore, setPracticeScore] = useState(0);
    const [isAdvancingPractice, setIsAdvancingPractice] = useState(false);

    const availableTests = useMemo(() => {
        return tests.filter((test) => test.visibility === 'public');
    }, [tests]);

    const stats = useMemo(() => {
        const completed = attempts.filter((attempt) => attempt.status === 'submitted' || attempt.status === 'graded');
        const bestScore = completed.reduce((best, attempt) => Math.max(best, Math.round(attempt.percentage || 0)), 0);

        return [
            { label: 'Available tests', value: availableTests.length, icon: <PlayCircleOutlined /> },
            { label: 'Completed', value: completed.length, icon: <CheckCircleOutlined /> },
            { label: 'Best score', value: `${bestScore}%`, icon: <TrophyOutlined /> },
            { label: 'Practice bank', value: questions.length, icon: <ClockCircleOutlined /> }
        ];
    }, [attempts, availableTests.length, questions.length]);

    const practiceQuestions = useMemo(() => {
        return questions
            .filter((question) => practiceDifficulty === 'all' || question.difficulty === practiceDifficulty)
            .sort((a, b) => (
                (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99)
                || a.questionText.localeCompare(b.questionText)
            ));
    }, [practiceDifficulty, questions]);

    const currentPracticeQuestion = practiceQueue[practiceIndex];
    const practiceComplete = practiceQueue.length > 0 && practiceIndex >= practiceQueue.length;

    const fetchAttempts = async () => {
        try {
            setAttemptsLoading(true);
            const data = await getMyTestAttempts();
            setAttempts(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not load recent attempts.');
        } finally {
            setAttemptsLoading(false);
        }
    };

    useEffect(() => {
        getAllTests().catch((error) => toast.error(error.response?.data?.message || 'Could not load tests.'));
        getAllQuestions().catch((error) => toast.error(error.response?.data?.message || 'Could not load practice questions.'));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAttempts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshDashboard = () => {
        getAllTests().catch((error) => toast.error(error.response?.data?.message || 'Could not load tests.'));
        getAllQuestions().catch((error) => toast.error(error.response?.data?.message || 'Could not load practice questions.'));
        fetchAttempts();
    };

    const joinTest = (event) => {
        event.preventDefault();
        const code = joinCode.trim();
        if (!code) {
            toast.error('Enter a test code or ID.');
            return;
        }

        const matchedTest = availableTests.find((test) => test._id === code || test.code === code);
        navigate(`/tests/${matchedTest?._id || code}/do`);
    };

    const startPractice = (questionId) => {
        const startIndex = practiceQuestions.findIndex((question) => question._id === questionId);
        if (startIndex < 0) return;

        setPracticeQueue(practiceQuestions.slice(startIndex));
        setPracticeIndex(0);
        setPracticeAnswer('');
        setPracticeFeedback(null);
        setPracticeScore(0);
        setIsAdvancingPractice(false);
    };

    const closePractice = () => {
        setPracticeQueue([]);
        setPracticeIndex(0);
        setPracticeAnswer('');
        setPracticeFeedback(null);
        setPracticeScore(0);
        setIsAdvancingPractice(false);
    };

    const validatePracticeAnswer = (question, answer) => {
        if (!question || !answer) return false;

        if (question.type === 'multiple_choice') {
            const correctOption = question.options?.find((option) => option.isCorrect);
            return answer === question.answer
                || answer === correctOption?.label
                || answer === correctOption?.text;
        }

        if (question.type === 'true_false') {
            return String(answer).toLowerCase() === String(question.answer).toLowerCase();
        }

        return String(answer).trim().toLowerCase() === String(question.answer || '').trim().toLowerCase();
    };

    const continuePractice = () => {
        if (!currentPracticeQuestion || isAdvancingPractice) return;
        if (!practiceAnswer.trim()) {
            toast.warning('Choose or type an answer first.');
            return;
        }

        const isCorrect = validatePracticeAnswer(currentPracticeQuestion, practiceAnswer);
        setPracticeFeedback(isCorrect ? 'correct' : 'incorrect');
        setPracticeScore((current) => current + (isCorrect ? 1 : 0));
        setIsAdvancingPractice(true);

        window.setTimeout(() => {
            setPracticeIndex((current) => current + 1);
            setPracticeAnswer('');
            setPracticeFeedback(null);
            setIsAdvancingPractice(false);
        }, 650);
    };

    const renderPracticeAnswerControls = () => {
        if (!currentPracticeQuestion) return null;

        if (currentPracticeQuestion.type === 'multiple_choice') {
            return (
                <div className="practice-options">
                    {currentPracticeQuestion.options?.map((option) => (
                        <button
                            className={`practice-option ${practiceAnswer === option.label ? 'selected' : ''} ${practiceFeedback && option.isCorrect ? 'correct' : ''} ${practiceFeedback === 'incorrect' && practiceAnswer === option.label && !option.isCorrect ? 'incorrect' : ''}`}
                            key={`${currentPracticeQuestion._id}-${option.label}`}
                            onClick={() => setPracticeAnswer(option.label)}
                            disabled={isAdvancingPractice}
                            type="button"
                        >
                            <strong>{option.label}</strong>
                            <span>{option.text}</span>
                        </button>
                    ))}
                </div>
            );
        }

        if (currentPracticeQuestion.type === 'true_false') {
            return (
                <div className="practice-options compact">
                    {['true', 'false'].map((answer) => {
                        const isCorrect = String(answer).toLowerCase() === String(currentPracticeQuestion.answer).toLowerCase();
                        return (
                            <button
                                className={`practice-option ${practiceAnswer === answer ? 'selected' : ''} ${practiceFeedback && isCorrect ? 'correct' : ''} ${practiceFeedback === 'incorrect' && practiceAnswer === answer && !isCorrect ? 'incorrect' : ''}`}
                                key={`${currentPracticeQuestion._id}-${answer}`}
                                onClick={() => setPracticeAnswer(answer)}
                                disabled={isAdvancingPractice}
                                type="button"
                            >
                                <span>{answer === 'true' ? 'True' : 'False'}</span>
                            </button>
                        );
                    })}
                </div>
            );
        }

        return (
            <label>
                Your answer
                <input
                    value={practiceAnswer}
                    onChange={(event) => setPracticeAnswer(event.target.value)}
                    disabled={isAdvancingPractice}
                    placeholder="Type your answer"
                />
            </label>
        );
    };

    return (
        <div className="page-stack student-dashboard">
            <section className="workspace-hero">
                <div>
                    <span className="eyebrow">Student workspace</span>
                    <h1>Ready for your next quiz?</h1>
                    <p>Join available tests, track recent attempts, and keep your focus on the next score.</p>
                </div>
                <div className="hero-actions">
                    <Link className="btn btn-primary" to="/questions/new">
                        <PlusOutlined /> Submit Question
                    </Link>
                    <button className="btn btn-secondary" type="button" onClick={refreshDashboard} disabled={isLoading || attemptsLoading}>
                        <ReloadOutlined /> Refresh
                    </button>
                </div>
            </section>

            <section className="stat-grid">
                {stats.map((stat) => (
                    <article className="stat-card" key={stat.label}>
                        <span>{stat.icon}</span>
                        <strong>{stat.value}</strong>
                        <small>{stat.label}</small>
                    </article>
                ))}
            </section>

            <section className="student-grid">
                <article className="panel join-panel">
                    <div className="panel-heading">
                        <h2>Join Test</h2>
                        <span className="pill public">Code</span>
                    </div>
                    <form className="join-form" onSubmit={joinTest}>
                        <label>
                            Test code or ID
                            <input
                                value={joinCode}
                                onChange={(event) => setJoinCode(event.target.value)}
                                placeholder="Paste test ID"
                            />
                        </label>
                        <button className="btn btn-primary" type="submit">
                            <PlayCircleOutlined /> Join
                        </button>
                    </form>
                </article>

                <article className="panel attempts-panel">
                    <div className="panel-heading">
                        <h2>Recent Attempts</h2>
                        <span>{attemptsLoading ? 'Loading' : `${attempts.length} total`}</span>
                    </div>
                    <div className="compact-list">
                        {attempts.slice(0, 5).map((attempt) => (
                            <div className="list-row student-attempt-row" key={attempt._id}>
                                <span>{attempt.status}</span>
                                <strong>{attempt.testId?.title || 'Untitled test'}</strong>
                                <small>{Math.round(attempt.percentage || 0)}%</small>
                            </div>
                        ))}
                        {!attempts.length && (
                            <p className="muted">{attemptsLoading ? 'Loading attempts...' : 'No attempts yet. Join a test to begin.'}</p>
                        )}
                    </div>
                </article>
            </section>

            <section className="panel practice-panel">
                <div className="panel-heading">
                    <div>
                        <h2>Question Bank Practice</h2>
                        <span>{practiceQuestions.length} approved questions</span>
                    </div>
                    <label className="inline-control">
                        Level
                        <select value={practiceDifficulty} onChange={(event) => setPracticeDifficulty(event.target.value)}>
                            <option value="all">All levels</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </label>
                </div>

                {!practiceQueue.length && !practiceComplete && (
                    <div className="practice-list">
                        {practiceQuestions.map((question) => (
                            <button className="practice-list-item" key={question._id} onClick={() => startPractice(question._id)} type="button">
                                <span className={`pill ${question.difficulty || 'easy'}`}>{question.difficulty || 'easy'}</span>
                                {/* <strong>{question.questionText}</strong> */}
                                <strong dangerouslySetInnerHTML={{ __html: question.questionText }} />
                                <small>{question.type?.replace('_', ' ')}</small>
                                <RightOutlined />
                            </button>
                        ))}
                        {!practiceQuestions.length && (
                            <div className="empty-state">{questionsLoading ? 'Loading practice questions...' : 'No approved questions match this level.'}</div>
                        )}
                    </div>
                )}

                {currentPracticeQuestion && (
                    <div className={`practice-session ${practiceFeedback || ''}`}>
                        <div className="practice-session-top">
                            <span className="eyebrow">Practice {practiceIndex + 1} / {practiceQueue.length}</span>
                            <button className="btn btn-secondary" onClick={closePractice} type="button">Exit</button>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${((practiceIndex + 1) / practiceQueue.length) * 100}%` }} />
                        </div>
                        <div className="question-meta">
                            <span>{currentPracticeQuestion.type?.replace('_', ' ')}</span>
                            <span>{currentPracticeQuestion.difficulty || 'easy'}</span>
                        </div>
                        {/* <h3>{currentPracticeQuestion.questionText}</h3> */}
                        <h3 dangerouslySetInnerHTML={{ __html: currentPracticeQuestion.questionText }} />
                        {renderPracticeAnswerControls()}
                        {practiceFeedback && (
                            <div className={`practice-feedback ${practiceFeedback}`}>
                                {practiceFeedback === 'correct' ? 'Correct' : 'Not quite'}
                            </div>
                        )}
                        <div className="action-row">
                            <button className="btn btn-primary" onClick={continuePractice} disabled={isAdvancingPractice} type="button">
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {practiceComplete && (
                    <div className="practice-complete">
                        <CheckCircleOutlined />
                        <h3>Practice complete</h3>
                        <p>You answered {practiceScore} of {practiceQueue.length} questions correctly.</p>
                        <button className="btn btn-primary" onClick={closePractice} type="button">Back to Question Bank</button>
                    </div>
                )}
            </section>

            <section className="table-panel">
                <div className="table-header student-test-table">
                    <span>Available Test</span>
                    <span>Time limit</span>
                    <span>Created</span>
                    <span>Action</span>
                </div>
                {availableTests.map((test) => (
                    <div className="table-row student-test-table" key={test._id}>
                        <strong>{test.title}</strong>
                        <span>{test.timeLimit || 'Unlimited'} min</span>
                        <span>{test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}</span>
                        <Link className="btn btn-primary" to={`/tests/${test._id}/do`}>
                            <PlayCircleOutlined /> Start
                        </Link>
                    </div>
                ))}
                {!availableTests.length && (
                    <div className="empty-state">{isLoading ? 'Loading tests...' : 'No public tests are available right now.'}</div>
                )}
            </section>
        </div>
    );
};

export default StudentDashboard;
