import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    CloudUploadOutlined,
    FileAddOutlined,
    FileTextOutlined,
    PlusOutlined,
    ReadOutlined,
    SafetyCertificateOutlined,
    SolutionOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth.js';
import {useQuestion} from '../hooks/useQuestion.js';
import {useTest} from '../hooks/useTest.js';
import instance from '../config/axiosConfig.js';

const Home = () => {
    const { account, isAuthenticated } = useAuth();
    const { questions, getQuestionBankForAccount } = useQuestion();
    const { tests, getAllTests, getPendingGradingAttempts } = useTest();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [pendingAttempts, setPendingAttempts] = useState([]);

    useEffect(() => {
        if (!isAuthenticated) return;
        getQuestionBankForAccount(account).catch(() => {});
        getAllTests().catch(() => {});
        if (account?.role === 'teacher') {
            getPendingGradingAttempts()
                .then((data) => setPendingAttempts(Array.isArray(data) ? data : []))
                .catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, account?._id, account?.role]);

    const stats = useMemo(() => {
        const verified = questions.filter((item) => item.verified).length;
        const publicTests = tests.filter((item) => item.visibility === 'public').length;
        const pendingReview = questions.filter((item) => item.status === 'pending_teacher_review').length;
        return [
            { label: 'Questions', value: questions.length, icon: <FileTextOutlined /> },
            { label: 'Tests', value: tests.length, icon: <ReadOutlined /> },
            { label: account?.role === 'teacher' ? 'Pending review' : 'Verified', value: account?.role === 'teacher' ? pendingReview : verified, icon: <SafetyCertificateOutlined /> },
            { label: account?.role === 'teacher' ? 'Pending grading' : 'Public tests', value: account?.role === 'teacher' ? pendingAttempts.length : publicTests, icon: <CloudUploadOutlined /> }
        ];
    }, [account?.role, pendingAttempts.length, questions, tests]);

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!file) {
            toast.error('Choose an image or PDF first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            await instance.post('/api/fileuploads/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('File uploaded for OCR processing.');
            setFile(null);
            event.target.reset();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <section className="landing">
                <div className="landing-copy">
                    <span className="eyebrow">Japanese exam practice</span>
                    <h1>Quizzle</h1>
                    <p>
                        Build JLPT-style question banks, assemble timed tests, upload source material,
                        and keep every study item in one focused workspace.
                    </p>
                    <div className="action-row">
                        <Link className="btn btn-primary" to="/register">Create account</Link>
                        <Link className="btn btn-secondary" to="/login">Login</Link>
                    </div>
                </div>
                <div className="kanji-panel" aria-hidden="true">
                    <span>学</span>
                    <span>問</span>
                    <span>答</span>
                    <span>試</span>
                </div>
            </section>
        );
    }

    return (
        <div className="page-stack">
            <section className="workspace-hero">
                <div>
                    <span className="eyebrow">Welcome back</span>
                    <h1>{account?.username || 'Study desk'}</h1>
                    <p>Manage uploaded source files, draft questions, and timed tests from the backend workflows.</p>
                </div>
                <div className="hero-actions">
                    <Link className="btn btn-primary" to="/questions/new"><PlusOutlined /> Question</Link>
                    <Link className="btn btn-secondary" to="/tests/new"><FileAddOutlined /> Test</Link>
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

            <section className="workspace-grid">
                {account?.role === 'teacher' && (
                    <article className="panel">
                        <div className="panel-heading">
                            <h2>Review Queues</h2>
                            <span>Phase 3</span>
                        </div>
                        <div className="queue-actions">
                            <Link className="queue-link" to="/teacher/review">
                                <SolutionOutlined />
                                <span>
                                    <strong>{questions.filter((item) => item.status === 'pending_teacher_review').length}</strong>
                                    Question proposals
                                </span>
                            </Link>
                            <Link className="queue-link" to="/teacher/grading">
                                <ReadOutlined />
                                <span>
                                    <strong>{pendingAttempts.length}</strong>
                                    Pending submissions
                                </span>
                            </Link>
                        </div>
                    </article>
                )}

                <article className="panel">
                    <div className="panel-heading">
                        <h2>OCR Upload</h2>
                        <span>image or PDF</span>
                    </div>
                    <form className="upload-box" onSubmit={handleUpload}>
                        <CloudUploadOutlined />
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(event) => setFile(event.target.files?.[0] || null)}
                        />
                        <button className="btn btn-primary" type="submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload source'}
                        </button>
                    </form>
                </article>

                <article className="panel">
                    <div className="panel-heading">
                        <h2>Recent Questions</h2>
                        <Link to="/questions">View all</Link>
                    </div>
                    <div className="compact-list">
                        {questions.slice(0, 5).map((question) => (
                            <div className="list-row" key={question._id}>
                                <span>{question.type?.replace('_', ' ')}</span>
                                {/* <strong>{question.questionText}</strong> */}
                                <strong dangerouslySetInnerHTML={{ __html: question.questionText }} />
                                <small>{question.difficulty || 'easy'}</small>
                            </div>
                        ))}
                        {!questions.length && <p className="muted">No questions yet. Create one from the question bank.</p>}
                    </div>
                </article>

                <article className="panel">
                    <div className="panel-heading">
                        <h2>Recent Tests</h2>
                        <Link to="/tests">View all</Link>
                    </div>
                    <div className="compact-list">
                        {tests.slice(0, 5).map((test) => (
                            <div className="list-row" key={test._id}>
                                <span>{test.visibility}</span>
                                <strong>{test.title}</strong>
                                <small>{test.timeLimit || 0} min</small>
                            </div>
                        ))}
                        {!tests.length && <p className="muted">No tests yet. Create a timed test to begin.</p>}
                    </div>
                </article>
            </section>
        </div>
    );
};

export default Home;
