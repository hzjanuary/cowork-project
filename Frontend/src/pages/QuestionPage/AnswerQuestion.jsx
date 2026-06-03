import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuestion } from '../../hooks/useQuestion.js';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';
// import './QuestionPage.css';

const AnswerQuestion = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { answerQuestion } = useQuestion();
    const { account } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Since we don't have a proper getQuestionById, this is a placeholder
        // In a real app, you'd fetch the question details here
        setIsLoading(false);
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!answer.trim()) {
            toast.error('Please enter your answer');
            return;
        }

        try {
            setIsLoading(true);
            await answerQuestion(id, answer);
            toast.success('Answer submitted successfully');
            navigate('/questions');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit answer');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loading">Loading question...</div>;

    return (
        <div className="answer-question-container">
            <div className="answer-question-card">
                <h2>Answer Question</h2>
                <p>Please provide the verification for this question.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="answer">Your Answer/Verification</label>
                        <textarea
                            id="answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter your answer or verification"
                            disabled={isLoading}
                            rows="6"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Submitting...' : 'Submit Answer'}
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

export default AnswerQuestion;
