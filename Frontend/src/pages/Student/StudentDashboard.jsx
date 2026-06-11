import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { useTest } from '../../hooks/useTest.js';
import instance from '../../config/axiosConfig.js';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { tests, getAllTests, isLoading } = useTest();
    const [attempts, setAttempts] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [attemptsLoading, setAttemptsLoading] = useState(false);

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
            { label: 'In progress', value: attempts.filter((attempt) => attempt.status === 'in_progress').length, icon: <ClockCircleOutlined /> }
        ];
    }, [attempts, availableTests.length]);

    const fetchAttempts = async () => {
        try {
            setAttemptsLoading(true);
            const res = await instance.get('/api/tests/test-attempts/me');
            setAttempts(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not load recent attempts.');
        } finally {
            setAttemptsLoading(false);
        }
    };

    useEffect(() => {
        getAllTests().catch((error) => toast.error(error.response?.data?.message || 'Could not load tests.'));
        fetchAttempts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshDashboard = () => {
        getAllTests().catch((error) => toast.error(error.response?.data?.message || 'Could not load tests.'));
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

    return (
        <div className="page-stack student-dashboard">
            <section className="workspace-hero">
                <div>
                    <span className="eyebrow">Student workspace</span>
                    <h1>Ready for your next quiz?</h1>
                    <p>Join available tests, track recent attempts, and keep your focus on the next score.</p>
                </div>
                <div className="hero-actions">
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
