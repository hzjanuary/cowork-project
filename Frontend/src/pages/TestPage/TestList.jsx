import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../hooks/useTest';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
// import './TestPage.css';

const TestList = () => {
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getAllTests, deleteTest } = useTest();
    const { account } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setIsLoading(true);
            const data = await getAllTests();
            setTests(data || []);
        } catch (error) {
            toast.error('Failed to fetch tests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (testId) => {
        if (!window.confirm('Are you sure you want to delete this test?')) return;

        try {
            await deleteTest(testId);
            setTests(tests.filter(t => t._id !== testId));
            toast.success('Test deleted successfully');
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    const handleStartTest = (testId) => {
        navigate(`/tests/${testId}/do`);
    };

    return (
        <div className="test-list-container">
            <div className="test-list-header">
                <h2>Tests</h2>
                <button onClick={() => navigate('/create-test')} className="btn-primary">
                    Create New Test
                </button>
            </div>

            {isLoading ? (
                <div className="loading">Loading tests...</div>
            ) : tests.length === 0 ? (
                <div className="empty-state">
                    <p>No tests available</p>
                    <button onClick={() => navigate('/create-test')} className="btn-primary">
                        Create First Test
                    </button>
                </div>
            ) : (
                <div className="tests-grid">
                    {tests.map(test => (
                        <div key={test._id} className="test-card">
                            <h3>{test.title}</h3>
                            <div className="test-info">
                                <p><strong>Questions:</strong> {test.questions?.length || 0}</p>
                                <p><strong>Time Limit:</strong> {test.timeLimit || 'Unlimited'} minutes</p>
                                <p><strong>Visibility:</strong> {test.visibility}</p>
                            </div>
                            <div className="test-actions">
                                <button
                                    onClick={() => handleStartTest(test._id)}
                                    className="btn-success"
                                >
                                    Start Test
                                </button>
                                <button
                                    onClick={() => navigate(`/tests/${test._id}`)}
                                    className="btn-secondary"
                                >
                                    View Details
                                </button>
                                {account?.role === 'teacher' && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/tests/${test._id}?edit=true`)}
                                            className="btn-secondary"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(test._id)}
                                            className="btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestList;
