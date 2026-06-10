import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {useQuestion} from '../../hooks/useQuestion.js';

const QuestionList = () => {
    const { questions, getAllQuestions, deleteQuestion, isLoading } = useQuestion();
    const [query, setQuery] = useState('');
    const [difficulty, setDifficulty] = useState('all');

    useEffect(() => {
        getAllQuestions().catch((error) => toast.error(error.response?.data?.message || 'Could not load questions.'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredQuestions = useMemo(() => {
        return questions.filter((question) => {
            const matchesQuery = question.questionText?.toLowerCase().includes(query.toLowerCase());
            const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty;
            return matchesQuery && matchesDifficulty;
        });
    }, [questions, query, difficulty]);

    const handleDelete = async (id) => {
        try {
            await deleteQuestion(id);
            toast.success('Question deleted.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed.');
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">Question bank</span>
                    <h1>Draft, verify, and organize exercises</h1>
                </div>
                <div className="action-row">
                    <button className="btn btn-secondary" onClick={() => getAllQuestions()} type="button">
                        <ReloadOutlined /> Refresh
                    </button>
                    <Link className="btn btn-primary" to="/questions/new">
                        <PlusOutlined /> New question
                    </Link>
                </div>
            </section>

            <section className="toolbar">
                <input
                    placeholder="Search question text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                    <option value="all">All difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </section>

            <section className="table-panel">
                <div className="table-header question-table">
                    <span>Question</span>
                    <span>Type</span>
                    <span>Difficulty</span>
                    <span>Status</span>
                    <span></span>
                </div>
                {filteredQuestions.map((question) => (
                    <div className="table-row question-table" key={question._id}>
                        <strong>{question.questionText}</strong>
                        <span>{question.type?.replace('_', ' ')}</span>
                        <span className={`pill ${question.difficulty || 'easy'}`}>{question.difficulty || 'easy'}</span>
                        <span>{question.verified ? 'verified' : question.status || 'draft'}</span>
                        <button className="icon-btn danger" onClick={() => handleDelete(question._id)} title="Delete" type="button">
                            <DeleteOutlined />
                        </button>
                    </div>
                ))}
                {!filteredQuestions.length && (
                    <div className="empty-state">{isLoading ? 'Loading questions...' : 'No questions match this view.'}</div>
                )}
            </section>
        </div>
    );
};

export default QuestionList;
