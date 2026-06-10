import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestion } from '../../hooks/useQuestion';
import { useUser } from '../../hooks/useUser';
import { toast } from 'react-toastify';
// import './QuestionPage.css';

const CreateQuestion = () => {
    const [searchParams] = useSearchParams();
    const testId = searchParams.get('testId');

    const [formData, setFormData] = useState({
        questionText: '',
        type: 'multiple_choice',
        options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }],
        answer: '',
        difficulty: 'medium',
        testId: testId || ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const { createQuestion } = useQuestion();
    const { user } = useUser();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const addOption = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const newLabel = letters[formData.options.length] || `${formData.options.length + 1}`;
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { label: newLabel, text: '' }]
        }));
    };

    const removeOption = (index) => {
        if (formData.options.length <= 2) {
            toast.error('At least 2 options are required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.questionText.trim()) {
            toast.error('Please enter question text');
            return;
        }

        if (formData.type === 'multiple_choice' && !formData.options.some(o => o.text.trim())) {
            toast.error('Please add at least one option');
            return;
        }

        if (!formData.answer.trim()) {
            toast.error('Please select or enter the correct answer');
            return;
        }

        try {
            setIsLoading(true);
            
            // Prepare options with isCorrect flag
            let options = [];
            if (formData.type === 'multiple_choice') {
                options = formData.options
                    .filter(o => o.text.trim())
                    .map(o => ({
                        label: o.label,
                        text: o.text,
                        isCorrect: o.text === formData.answer
                    }));
            }
            
            const questionData = {
                testId: formData.testId || null,
                questionText: formData.questionText,
                type: formData.type,
                options: options,
                answer: formData.answer,
                difficulty: formData.difficulty
            };

            await createQuestion(questionData);
            toast.success('Question created successfully');
            navigate('/questions');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create question');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-question-container">
            <div className="create-question-card">
                <h2>Create New Question</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="questionText">Question</label>
                        <textarea
                            id="questionText"
                            name="questionText"
                            value={formData.questionText}
                            onChange={handleInputChange}
                            placeholder="Enter question text"
                            disabled={isLoading}
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="type">Question Type</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="true_false">True/False</option>
                                <option value="short_answer">Short Answer</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="difficulty">Difficulty</label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'multiple_choice' && (
                        <div className="options-section">
                            <h4>Options</h4>
                            {formData.options.map((option, index) => (
                                <div key={index} className="option-input">
                                    <span className="option-label">{option.label}.</span>
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                        placeholder={`Option ${option.label}`}
                                        disabled={isLoading}
                                    />
                                    <label>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            value={option.text}
                                            checked={formData.answer === option.text}
                                            onChange={() => setFormData(prev => ({ ...prev, answer: option.text }))}
                                            disabled={isLoading}
                                        />
                                        Correct
                                    </label>
                                    {formData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="btn-danger btn-small"
                                            disabled={isLoading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addOption}
                                className="btn-secondary"
                                disabled={isLoading}
                            >
                                + Add Option
                            </button>
                        </div>
                    )}

                    {formData.type === 'true_false' && (
                        <div className="options-section">
                            <h4>Correct Answer</h4>
                            <label>
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    value="True"
                                    checked={formData.answer === 'True'}
                                    onChange={() => setFormData(prev => ({ ...prev, answer: 'True' }))}
                                    disabled={isLoading}
                                />
                                True
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    value="False"
                                    checked={formData.answer === 'False'}
                                    onChange={() => setFormData(prev => ({ ...prev, answer: 'False' }))}
                                    disabled={isLoading}
                                />
                                False
                            </label>
                        </div>
                    )}

                    {formData.type === 'short_answer' && (
                        <div className="form-group">
                            <label htmlFor="answer">Correct Answer</label>
                            <input
                                type="text"
                                id="answer"
                                value={formData.answer}
                                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                                placeholder="Enter correct answer"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Creating...' : 'Create Question'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/questions')}
                            className="btn-secondary"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuestion;
