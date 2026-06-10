import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {useQuestion} from '../../hooks/useQuestion.js';

const defaultOptions = [
    { label: 'A', text: '', isCorrect: false },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false }
];

const CreateQuestion = () => {
    const navigate = useNavigate();
    const { createQuestion, isLoading } = useQuestion();
    const [form, setForm] = useState({
        questionText: '',
        type: 'multiple_choice',
        answer: '',
        difficulty: 'easy',
        testId: ''
    });
    const [options, setOptions] = useState(defaultOptions);

    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const updateOption = (index, field, value) => {
        setOptions((current) => current.map((option, optionIndex) => (
            optionIndex === index ? { ...option, [field]: value } : option
        )));
    };

    const addOption = () => {
        const nextLabel = String.fromCharCode(65 + options.length);
        setOptions((current) => [...current, { label: nextLabel, text: '', isCorrect: false }]);
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
            testId: form.testId || undefined
        };

        try {
            await createQuestion(payload);
            toast.success('Question created.');
            navigate('/questions');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Question could not be created.');
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">New question</span>
                    <h1>Create a reusable exercise</h1>
                </div>
            </section>

            <form className="form-panel" onSubmit={handleSubmit}>
                <label>
                    Question text
                    <textarea
                        rows="5"
                        value={form.questionText}
                        onChange={(event) => updateField('questionText', event.target.value)}
                        placeholder="Paste or write the prompt students will answer"
                    />
                </label>

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
                    <label>
                        Test ID
                        <input
                            value={form.testId}
                            onChange={(event) => updateField('testId', event.target.value)}
                            placeholder="Optional"
                        />
                    </label>
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
                        <SaveOutlined /> {isLoading ? 'Saving...' : 'Save question'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuestion;
