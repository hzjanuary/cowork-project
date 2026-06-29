import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import {useQuestion} from '../../hooks/useQuestion.js';
import { useAuth } from '../../hooks/useAuth.js';
import RichTextEditor from '../../components/RichTextEditor.jsx';
import instance from '../../config/axiosConfig.js';

const defaultOptions = [
    { label: 'A', text: '', isCorrect: false },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false }
];

const CreateQuestion = () => {
    const navigate = useNavigate();
    const { createQuestion, isLoading } = useQuestion();
    const { account } = useAuth();
    const isStudent = account?.role === 'student' || account?.role === 'user';
    const [form, setForm] = useState({
        questionText: '',
        type: 'multiple_choice',
        answer: '',
        difficulty: 'easy',
        testId: ''
    });
    const [options, setOptions] = useState(defaultOptions);
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef(null);

    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const htmlEscape = (text) => text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const textToHtml = (text) => {
        return String(text || '')
            .split(/\r?\n/)
            .map((line) => `<p>${htmlEscape(line) || '<br />'}</p>`)
            .join('');
    };

    const updateOption = (index, field, value) => {
        setOptions((current) => current.map((option, optionIndex) => (
            optionIndex === index ? { ...option, [field]: value } : option
        )));
    };

    const addOption = () => {
        const nextLabel = String.fromCharCode(65 + options.length);
        setOptions((current) => [...current, { label: nextLabel, text: '', isCorrect: false }]);
    };

    const handleOcrUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsExtracting(true);
            toast.info('Extracting text...');

            const response = await instance.post('/api/fileuploads/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const extractedText = response.data?.ocrText || response.data?.file?.ocrText || '';
            if (!extractedText.trim()) {
                toast.error('OCR completed, but no text was extracted.');
                return;
            }

            updateField('questionText', textToHtml(extractedText));
            toast.success('Text extracted and inserted into the question editor.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'OCR upload failed.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.questionText.trim()) {
            toast.error('Question text is required.');
            return;
        }

        const payload = {
            questionText: form.questionText,
            type: form.type,
            answer: form.answer,
            difficulty: form.difficulty,
            options: form.type === 'multiple_choice' ? options.filter((option) => option.text.trim()) : [],
            testId: isStudent ? undefined : form.testId || undefined
        };

        try {
            await createQuestion(payload);
            toast.success(isStudent ? 'Question submitted for review!' : 'Question created.');
            navigate(isStudent ? '/student' : '/questions');
        } catch (error) {
            toast.error(error.response?.data?.message || (isStudent ? 'Question could not be submitted for review.' : 'Question could not be created.'));
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">{isStudent ? 'Question proposal' : 'New question'}</span>
                    <h1>{isStudent ? 'Submit a question for teacher review' : 'Create a reusable exercise'}</h1>
                </div>
            </section>

            <form className="form-panel" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="question-text-editor">Question text</label>
                    <div className="action-row" style={{ marginTop: '0.5rem' }}>
                        <label htmlFor="ocr-image-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                            <UploadOutlined /> {isExtracting ? 'Extracting...' : 'Upload Image for OCR'}
                        </label>
                        <input
                            id="ocr-image-upload"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleOcrUpload}
                            disabled={isExtracting}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div id="question-text-editor">
                    <RichTextEditor
                        value={form.questionText}
                        onChange={(html) => updateField('questionText', html)}
                    />
                </div>

                <div className="form-grid">
                    <label>
                        Type
                        <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
                            <option value="multiple_choice">Multiple choice</option>
                            <option value="true_false">True / false</option>
                            <option value="short_answer">Short answer</option>
                        </select>
                    </label>
                    <label>
                        Difficulty
                        <select value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </label>
                    {!isStudent && (
                        <label>
                            Test ID
                            <input
                                value={form.testId}
                                onChange={(event) => updateField('testId', event.target.value)}
                                placeholder="Optional"
                            />
                        </label>
                    )}
                </div>

                {form.type === 'multiple_choice' && (
                    <section className="option-editor">
                        <div className="panel-heading">
                            <h2>Answer options</h2>
                            <button className="btn btn-secondary" onClick={addOption} type="button">
                                <PlusOutlined /> Option
                            </button>
                        </div>
                        {options.map((option, index) => (
                            <div className="option-row" key={option.label}>
                                <input
                                    value={option.label}
                                    onChange={(event) => updateOption(index, 'label', event.target.value)}
                                    aria-label="Option label"
                                />
                                <input
                                    value={option.text}
                                    onChange={(event) => updateOption(index, 'text', event.target.value)}
                                    placeholder={`Option ${option.label}`}
                                />
                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(event) => updateOption(index, 'isCorrect', event.target.checked)}
                                    />
                                    Correct
                                </label>
                            </div>
                        ))}
                    </section>
                )}

                <label>
                    Stored answer
                    <input
                        value={form.answer}
                        onChange={(event) => updateField('answer', event.target.value)}
                        placeholder="Exact answer used by backend grading"
                    />
                </label>

                <div className="action-row">
                    <button className="btn btn-primary" type="submit" disabled={isLoading}>
                        <SaveOutlined /> {isLoading ? 'Saving...' : (isStudent ? 'Submit for Teacher Review' : 'Save question')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuestion;
