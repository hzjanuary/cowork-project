import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    CloudUploadOutlined,
    FileAddOutlined,
    FileTextOutlined,
    PlusOutlined,
    ReadOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth.js';
import useQuestion from '../hooks/useQuestion.js';
import useTest from '../hooks/useTest.js';
import instance from '../config/axiosConfig.js';

const Home = () => {
    const { account, isAuthenticated } = useAuth();
    const { questions, getAllQuestions } = useQuestion();
    const { tests, getAllTests } = useTest();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        getAllQuestions().catch(() => {});
        getAllTests().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const stats = useMemo(() => {
        const verified = questions.filter((item) => item.verified).length;
        const publicTests = tests.filter((item) => item.visibility === 'public').length;
        return [
            { label: 'Questions', value: questions.length, icon: <FileTextOutlined /> },
            { label: 'Tests', value: tests.length, icon: <ReadOutlined /> },
            { label: 'Verified', value: verified, icon: <SafetyCertificateOutlined /> },
            { label: 'Public tests', value: publicTests, icon: <CloudUploadOutlined /> }
        ];
    }, [questions, tests]);

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
                                <strong>{question.questionText}</strong>
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
