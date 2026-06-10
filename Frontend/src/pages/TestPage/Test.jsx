import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTest } from '../../hooks/useTest';
import { useQuestion } from '../../hooks/useQuestion';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
// import './TestPage.css';

const Test = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true');
    const [editData, setEditData] = useState({});
    const { getTestById, updateTest, deleteTest } = useTest();
    const { getQuestionsByTestId, deleteQuestion } = useQuestion();
    const { account } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTestData();
    }, [id]);

    const fetchTestData = async () => {
        try {
            setIsLoading(true);
            const testData = await getTestById(id);
            setTest(testData);
            setEditData(testData);

            const questionsData = await getQuestionsByTestId(id);
            setQuestions(questionsData || []);
        } catch (error) {
            toast.error('Failed to fetch test details');
            navigate('/tests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveEdit = async () => {
        try {
            setIsLoading(true);
            await updateTest(id, {
                title: editData.title,
                timeLimit: editData.timeLimit,
                visibility: editData.visibility
            });
            setTest(editData);
            setIsEditMode(false);
            toast.success('Test updated successfully');
        } catch (error) {
            toast.error('Failed to update test');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this test?')) return;

        try {
            await deleteTest(id);
            toast.success('Test deleted successfully');
            navigate('/tests');
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            await deleteQuestion(questionId);
            setQuestions(questions.filter(q => q._id !== questionId));
            toast.success('Question deleted successfully');
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    if (isLoading) return <div className="loading">Loading test details...</div>;
    if (!test) return <div>Test not found</div>;

    return (
        <div className="test-details-container">
            <div className="test-header">
                {isEditMode ? (
                    <div className="edit-form">
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => handleEditChange('title', e.target.value)}
                            placeholder="Test Title"
                        />
                        <input
                            type="number"
                            value={editData.timeLimit}
                            onChange={(e) => handleEditChange('timeLimit', e.target.value)}
                            placeholder="Time Limit (minutes)"
                        />
                        <select
                            value={editData.visibility}
                            onChange={(e) => handleEditChange('visibility', e.target.value)}
                        >
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                        </select>
                        <button onClick={handleSaveEdit} className="btn-success">Save</button>
                        <button onClick={() => setIsEditMode(false)} className="btn-secondary">Cancel</button>
                    </div>
                ) : (
                    <>
                        <h2>{test.title}</h2>
                        <div className="test-info">
                            <p><strong>Questions:</strong> {questions.length}</p>
                            <p><strong>Time Limit:</strong> {test.timeLimit || 'Unlimited'} minutes</p>
                            <p><strong>Visibility:</strong> {test.visibility}</p>
                        </div>
                        {account?.role === 'teacher' && (
                            <div className="test-actions">
                                <button onClick={() => setIsEditMode(true)} className="btn-secondary">Edit</button>
                                <button onClick={handleDelete} className="btn-danger">Delete</button>
                                <button onClick={() => navigate(`/tests/${id}/do`)} className="btn-success">Preview</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="questions-section">
                <h3>Questions ({questions.length})</h3>
                {questions.length === 0 ? (
                    <p>No questions added yet</p>
                ) : (
                    <div className="questions-list">
                        {questions.map((question, index) => (
                            <div key={question._id} className="question-item">
                                <div className="question-content">
                                    <strong>{index + 1}. {question.questionText}</strong>
                                    <p><small>Type: {question.type} | Difficulty: {question.difficulty}</small></p>
                                </div>
                                <div className="question-actions">
                                    <button
                                        onClick={() => navigate(`/questions/${question._id}`)}
                                        className="btn-secondary"
                                    >
                                        View
                                    </button>
                                    {account?.role === 'teacher' && (
                                        <button
                                            onClick={() => handleDeleteQuestion(question._id)}
                                            className="btn-danger"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={() => navigate('/tests')} className="btn-secondary">Back to Tests</button>
        </div>
    );
};

export default Test;
