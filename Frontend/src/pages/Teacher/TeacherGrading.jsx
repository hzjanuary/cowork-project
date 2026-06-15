import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { CheckOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { useTest } from '../../hooks/useTest.js';

const TeacherGrading = () => {
    const { getPendingGradingAttempts, manualGradeAttempt, isLoading } = useTest();
    const [attempts, setAttempts] = useState([]);
    const [selectedAttemptId, setSelectedAttemptId] = useState(null);
    const [grades, setGrades] = useState({});
    const [teacherFeedback, setTeacherFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    const selectedAttempt = useMemo(() => (
        attempts.find((attempt) => attempt._id === selectedAttemptId) || attempts[0]
    ), [attempts, selectedAttemptId]);

    const manualAnswers = useMemo(() => (
        selectedAttempt?.answers?.filter((answer) => answer.needsManualGrading) || []
    ), [selectedAttempt]);

    const loadAttempts = async () => {
        try {
            const data = await getPendingGradingAttempts();
            setAttempts(Array.isArray(data) ? data : []);
            setSelectedAttemptId((current) => current || data?.[0]?._id || null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not load pending grading.');
        }
    };

    useEffect(() => {
        loadAttempts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedAttempt) return;

        const nextGrades = {};
        selectedAttempt.answers?.forEach((answer) => {
            if (!answer.needsManualGrading) return;
            const questionId = answer.questionId?._id || answer.questionId;
            nextGrades[questionId] = {
                points: answer.manualScore ?? answer.points ?? 0,
                maxPoints: answer.maxPoints || 1,
                teacherFeedback: answer.teacherFeedback || ''
            };
        });
        setGrades(nextGrades);
        setTeacherFeedback(selectedAttempt.teacherFeedback || '');
    }, [selectedAttempt]);

    const updateGrade = (questionId, field, value) => {
        setGrades((current) => ({
            ...current,
            [questionId]: {
                ...current[questionId],
                [field]: value
            }
        }));
    };

    const saveGrades = async () => {
        if (!selectedAttempt) return;

        const payload = manualAnswers.map((answer) => {
            const questionId = answer.questionId?._id || answer.questionId;
            const grade = grades[questionId] || {};
            return {
                questionId,
                points: Number(grade.points || 0),
                maxPoints: Number(grade.maxPoints || answer.maxPoints || 1),
                teacherFeedback: grade.teacherFeedback || ''
            };
        });

        try {
            setSaving(true);
            await manualGradeAttempt(selectedAttempt._id, {
                grades: payload,
                teacherFeedback
            });
            toast.success('Grades saved.');
            setSelectedAttemptId(null);
            await loadAttempts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save grades.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">Teacher grading</span>
                    <h1>Pending submissions</h1>
                </div>
                <button className="btn btn-secondary" onClick={loadAttempts} type="button">
                    <ReloadOutlined /> Refresh
                </button>
            </section>

            <section className="grading-layout">
                <aside className="panel grading-list">
                    <div className="panel-heading">
                        <h2>Attempts</h2>
                        <span>{attempts.length} pending</span>
                    </div>
                    <div className="compact-list">
                        {attempts.map((attempt) => (
                            <button
                                className={`submission-row ${selectedAttempt?._id === attempt._id ? 'active' : ''}`}
                                key={attempt._id}
                                onClick={() => setSelectedAttemptId(attempt._id)}
                                type="button"
                            >
                                <strong>{attempt.testId?.title || 'Untitled test'}</strong>
                                <span>{attempt.studentId?.username || attempt.studentId?.email || 'Student'}</span>
                                <small>{attempt.answers?.filter((answer) => answer.needsManualGrading).length || 0} answers</small>
                            </button>
                        ))}
                        {!attempts.length && (
                            <p className="muted">{isLoading ? 'Loading submissions...' : 'No submissions need manual grading.'}</p>
                        )}
                    </div>
                </aside>

                <article className="panel grading-detail">
                    {!selectedAttempt ? (
                        <div className="empty-state">Select a pending submission to grade.</div>
                    ) : (
                        <>
                            <div className="panel-heading">
                                <div>
                                    <h2>{selectedAttempt.testId?.title || 'Untitled test'}</h2>
                                    <span>{selectedAttempt.studentId?.username || selectedAttempt.studentId?.email || 'Student submission'}</span>
                                </div>
                                <span className="pill pending">{selectedAttempt.manualGradingStatus || selectedAttempt.status}</span>
                            </div>

                            {manualAnswers.map((answer, index) => {
                                const question = answer.questionId;
                                const questionId = question?._id || answer.questionId;
                                const grade = grades[questionId] || {};

                                return (
                                    <section className="manual-answer-card" key={questionId}>
                                        <div className="question-meta">
                                            <span>Question {index + 1}</span>
                                            <span>{question?.type?.replace('_', ' ') || 'answer'}</span>
                                        </div>
                                        <h3>{question?.questionText || 'Question unavailable'}</h3>
                                        <div className="student-answer-box">
                                            <span>Student answer</span>
                                            <p>{answer.studentAnswer || 'No answer submitted.'}</p>
                                        </div>
                                        <div className="form-grid">
                                            <label>
                                                Manual score
                                                <input
                                                    min="0"
                                                    max={grade.maxPoints || 1}
                                                    type="number"
                                                    value={grade.points ?? 0}
                                                    onChange={(event) => updateGrade(questionId, 'points', event.target.value)}
                                                />
                                            </label>
                                            <label>
                                                Max points
                                                <input
                                                    min="1"
                                                    type="number"
                                                    value={grade.maxPoints ?? 1}
                                                    onChange={(event) => updateGrade(questionId, 'maxPoints', event.target.value)}
                                                />
                                            </label>
                                        </div>
                                        <label>
                                            Feedback
                                            <textarea
                                                rows="3"
                                                value={grade.teacherFeedback || ''}
                                                onChange={(event) => updateGrade(questionId, 'teacherFeedback', event.target.value)}
                                                placeholder="Optional feedback for this answer"
                                            />
                                        </label>
                                    </section>
                                );
                            })}

                            <label>
                                Overall feedback
                                <textarea
                                    rows="3"
                                    value={teacherFeedback}
                                    onChange={(event) => setTeacherFeedback(event.target.value)}
                                    placeholder="Optional overall feedback for the submission"
                                />
                            </label>

                            <div className="action-row">
                                <button className="btn btn-primary" onClick={saveGrades} disabled={saving || !manualAnswers.length} type="button">
                                    {saving ? <CheckOutlined /> : <SaveOutlined />} {saving ? 'Saving...' : 'Save Grades'}
                                </button>
                            </div>
                        </>
                    )}
                </article>
            </section>
        </div>
    );
};

export default TeacherGrading;
