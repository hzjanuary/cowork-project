import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { CheckOutlined, CloseOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuestion } from '../../hooks/useQuestion.js';

const cloneOptions = (options = []) => options.map((option) => ({ ...option }));

const TeacherQuestionReview = () => {
    const { questions, getAllQuestions, reviewQuestion, isLoading } = useQuestion();
    const [editingId, setEditingId] = useState(null);
    const [drafts, setDrafts] = useState({});

    const pendingQuestions = useMemo(() => (
        questions.filter((question) => question.status === 'pending_teacher_review')
    ), [questions]);

    const loadQuestions = () => {
        getAllQuestions().catch((error) => toast.error(error.response?.data?.message || 'Could not load pending questions.'));
    };

    useEffect(() => {
        loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ensureDraft = (question) => {
        setDrafts((current) => ({
            ...current,
            [question._id]: current[question._id] || {
                answer: question.answer || '',
                difficulty: question.difficulty || 'easy',
                reviewNotes: question.reviewNotes || '',
                options: cloneOptions(question.options)
            }
        }));
    };

    const updateDraft = (questionId, field, value) => {
        setDrafts((current) => ({
            ...current,
            [questionId]: {
                ...current[questionId],
                [field]: value
            }
        }));
    };

    const updateOption = (questionId, index, field, value) => {
        setDrafts((current) => {
            const draft = current[questionId];
            const options = cloneOptions(draft?.options);
            options[index] = { ...options[index], [field]: value };
            return {
                ...current,
                [questionId]: {
                    ...draft,
                    options
                }
            };
        });
    };

    const handleReview = async (question, approved) => {
        const draft = drafts[question._id] || {
            answer: question.answer || '',
            difficulty: question.difficulty || 'easy',
            reviewNotes: question.reviewNotes || '',
            options: cloneOptions(question.options)
        };

        try {
            await reviewQuestion(question._id, {
                approved,
                answer: draft.answer,
                difficulty: draft.difficulty,
                reviewNotes: draft.reviewNotes,
                options: question.type === 'multiple_choice' ? draft.options : question.options
            });
            toast.success(approved ? 'Question approved.' : 'Question rejected.');
            setEditingId(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Question review failed.');
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">Teacher review</span>
                    <h1>Student question proposals</h1>
                </div>
                <button className="btn btn-secondary" onClick={loadQuestions} type="button">
                    <ReloadOutlined /> Refresh
                </button>
            </section>

            <section className="review-list">
                {pendingQuestions.map((question) => {
                    const draft = drafts[question._id] || {
                        answer: question.answer || '',
                        difficulty: question.difficulty || 'easy',
                        reviewNotes: question.reviewNotes || '',
                        options: cloneOptions(question.options)
                    };
                    const isEditing = editingId === question._id;

                    return (
                        <article className="panel review-card" key={question._id}>
                            <div className="panel-heading">
                                <div>
                                    {/* <h2>{question.questionText}</h2> */}
                                    <h2 dangerouslySetInnerHTML={{ __html: question.questionText }} />
                                    <span>{question.type?.replace('_', ' ')} · {question.difficulty || 'easy'} · {question.authorRole || 'student'}</span>
                                </div>
                                <span className="pill pending">Pending review</span>
                            </div>

                            {question.type === 'multiple_choice' && (
                                <div className="review-options">
                                    {draft.options?.map((option, index) => (
                                        <div className="option-row" key={`${question._id}-${option.label}-${index}`}>
                                            <input
                                                value={option.label || ''}
                                                disabled={!isEditing}
                                                onChange={(event) => updateOption(question._id, index, 'label', event.target.value)}
                                                aria-label="Option label"
                                            />
                                            <input
                                                value={option.text || ''}
                                                disabled={!isEditing}
                                                onChange={(event) => updateOption(question._id, index, 'text', event.target.value)}
                                                aria-label="Option text"
                                            />
                                            <label className="check-row">
                                                <input
                                                    type="checkbox"
                                                    checked={!!option.isCorrect}
                                                    disabled={!isEditing}
                                                    onChange={(event) => updateOption(question._id, index, 'isCorrect', event.target.checked)}
                                                />
                                                Correct
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="form-grid">
                                <label>
                                    Stored answer
                                    <input
                                        value={draft.answer}
                                        disabled={!isEditing}
                                        onChange={(event) => updateDraft(question._id, 'answer', event.target.value)}
                                        placeholder="Teacher answer or grading key"
                                    />
                                </label>
                                <label>
                                    Difficulty
                                    <select
                                        value={draft.difficulty}
                                        disabled={!isEditing}
                                        onChange={(event) => updateDraft(question._id, 'difficulty', event.target.value)}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </label>
                            </div>

                            <label>
                                Review notes
                                <textarea
                                    value={draft.reviewNotes}
                                    disabled={!isEditing}
                                    rows="3"
                                    onChange={(event) => updateDraft(question._id, 'reviewNotes', event.target.value)}
                                    placeholder="Optional feedback for this proposal"
                                />
                            </label>

                            <div className="action-row">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        ensureDraft(question);
                                        setEditingId(isEditing ? null : question._id);
                                    }}
                                    type="button"
                                >
                                    <EditOutlined /> {isEditing ? 'Done Editing' : 'Edit'}
                                </button>
                                <button className="btn btn-primary" onClick={() => handleReview(question, true)} type="button">
                                    <CheckOutlined /> Approve
                                </button>
                                <button className="btn btn-danger" onClick={() => handleReview(question, false)} type="button">
                                    <CloseOutlined /> Reject
                                </button>
                            </div>
                        </article>
                    );
                })}

                {!pendingQuestions.length && (
                    <div className="empty-state">{isLoading ? 'Loading pending questions...' : 'No student question proposals need review.'}</div>
                )}
            </section>
        </div>
    );
};

export default TeacherQuestionReview;
