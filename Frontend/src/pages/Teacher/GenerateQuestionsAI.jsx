import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckOutlined, CloudUploadOutlined, LoadingOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import instance from '../../config/axiosConfig.js';
import { useQuestion } from '../../hooks/useQuestion.js';

const normalizeQuestion = (question) => ({
    questionText: String(question?.questionText || '').trim(),
    type: String(question?.type || 'short_answer').trim(),
    options: Array.isArray(question?.options) ? question.options : [],
    answer: String(question?.answer || '').trim(),
    difficulty: String(question?.difficulty || 'medium').trim()
});

const GenerateQuestionsAI = () => {
    const navigate = useNavigate();
    const { createQuestion } = useQuestion();
    const [file, setFile] = useState(null);
    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [extracting, setExtracting] = useState(false);
    const [saving, setSaving] = useState(false);

    const selectedCount = selectedQuestionIds.length;

    const previewStats = useMemo(() => ({
        total: previewQuestions.length,
        selected: selectedCount
    }), [previewQuestions.length, selectedCount]);

    const toggleQuestion = (questionId) => {
        setSelectedQuestionIds((current) => (
            current.includes(questionId)
                ? current.filter((id) => id !== questionId)
                : [...current, questionId]
        ));
    };

    const handleExtract = async (event) => {
        event.preventDefault();

        if (!file) {
            toast.error('Choose a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setExtracting(true);
            const res = await instance.post('/api/questions/extract-from-file', formData);
            const questions = Array.isArray(res.data?.data) ? res.data.data.map(normalizeQuestion) : [];

            if (!questions.length) {
                toast.warning('No questions were extracted from this file.');
                setPreviewQuestions([]);
                setSelectedQuestionIds([]);
                return;
            }

            setPreviewQuestions(questions);
            setSelectedQuestionIds(questions.map((_, index) => String(index)));
            toast.success(`Extracted ${questions.length} question${questions.length === 1 ? '' : 's'}.`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Question extraction failed.');
        } finally {
            setExtracting(false);
        }
    };

    const saveSelected = async () => {
        const selectedQuestions = previewQuestions.filter((_, index) => selectedQuestionIds.includes(String(index)));

        if (!selectedQuestions.length) {
            toast.error('Select at least one question to save.');
            return;
        }

        try {
            setSaving(true);

            for (const question of selectedQuestions) {
                await createQuestion({
                    questionText: question.questionText,
                    type: question.type,
                    options: question.options,
                    answer: question.answer,
                    difficulty: question.difficulty
                });
            }

            toast.success(`Saved ${selectedQuestions.length} question${selectedQuestions.length === 1 ? '' : 's'} to the bank.`);
            setSelectedQuestionIds((current) => current.filter((id) => !selectedQuestions.some((_, index) => String(index) === id)));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save extracted questions.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">AI extraction</span>
                    <h1>Generate questions from a file</h1>
                    <p>Upload a document or image, preview Gemini output, and save only the questions you want.</p>
                </div>
                <div className="action-row">
                    <Link className="btn btn-secondary" to="/questions">
                        <FileTextOutlined /> Back to bank
                    </Link>
                </div>
            </section>

            <section className="workspace-grid two">
                <form className="form-panel" onSubmit={handleExtract}>
                    <div className="panel-heading">
                        <h2>Upload source</h2>
                        <span>PDF or image</span>
                    </div>
                    <label>
                        File
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(event) => setFile(event.target.files?.[0] || null)}
                            disabled={extracting || saving}
                        />
                    </label>
                    <div className="action-row">
                        <button className="btn btn-primary" type="submit" disabled={extracting || saving}>
                            {extracting ? <LoadingOutlined spin /> : <CloudUploadOutlined />} {extracting ? 'Extracting...' : 'Extract questions'}
                        </button>
                    </div>
                </form>

                <article className="panel">
                    <div className="panel-heading">
                        <h2>Preview</h2>
                        <span>{previewStats.selected} / {previewStats.total} selected</span>
                    </div>

                    {extracting ? (
                        <div className="empty-state">
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                            <p style={{ marginTop: 12 }}>Gemini is extracting questions...</p>
                        </div>
                    ) : (
                        <div className="compact-list">
                            {previewQuestions.map((question, index) => {
                                const itemId = String(index);
                                const isSelected = selectedQuestionIds.includes(itemId);

                                return (
                                    <label className={`selector-row ${isSelected ? 'active' : ''}`} key={`${question.questionText}-${index}`}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleQuestion(itemId)}
                                        />
                                        <span style={{ display: 'grid', gap: 6 }}>
                                            <strong>{question.questionText || 'Untitled question'}</strong>
                                            <small>
                                                {question.type?.replace('_', ' ')} · {question.difficulty || 'medium'}
                                                {question.answer ? ` · Answer: ${question.answer}` : ''}
                                            </small>
                                            {Array.isArray(question.options) && question.options.length > 0 && (
                                                <small>
                                                    {question.options.map((option) => `${option.label || ''}. ${option.text || ''}`).join(' | ')}
                                                </small>
                                            )}
                                        </span>
                                    </label>
                                );
                            })}

                            {!previewQuestions.length && (
                                <p className="muted">
                                    {file ? 'Run extraction to preview Gemini output here.' : 'Upload a file to begin.'}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="action-row" style={{ marginTop: 16 }}>
                        <button className="btn btn-primary" type="button" onClick={saveSelected} disabled={saving || !selectedCount || !previewQuestions.length}>
                            {saving ? <LoadingOutlined spin /> : <SaveOutlined />} {saving ? 'Saving...' : 'Save Selected to Question Bank'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => {
                                setPreviewQuestions([]);
                                setSelectedQuestionIds([]);
                                setFile(null);
                            }}
                            disabled={extracting || saving || (!previewQuestions.length && !file)}
                        >
                            <CheckOutlined /> Clear
                        </button>
                    </div>
                </article>
            </section>
        </div>
    );
};

export default GenerateQuestionsAI;
