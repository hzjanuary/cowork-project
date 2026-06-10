import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../../hooks/useTest.js';
import { useUser } from '../../hooks/useUser.js';
import { toast } from 'react-toastify';
// import './TestPage.css';

const CreateTest = () => {
    const [formData, setFormData] = useState({
        title: '',
        timeLimit: '',
        visibility: 'private'
    });
    const [isLoading, setIsLoading] = useState(false);
    const { createTest } = useTest();
    const { user } = useUser();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter test title');
            return;
        }

        try {
            setIsLoading(true);
            const testData = {
                title: formData.title,
                userId: user?._id,
                timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : 0,
                visibility: formData.visibility
            };

            const response = await createTest(testData);
            toast.success('Test created successfully');
            navigate('/tests');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create test');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-test-container">
            <div className="create-test-card">
                <h2>Create New Test</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Test Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter test title"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="timeLimit">Time Limit (minutes)</label>
                        <input
                            type="number"
                            id="timeLimit"
                            name="timeLimit"
                            value={formData.timeLimit}
                            onChange={handleChange}
                            placeholder="Leave blank for unlimited"
                            disabled={isLoading}
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="visibility">Visibility</label>
                        <select
                            id="visibility"
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Creating...' : 'Create Test'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/tests')}
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

export default CreateTest;
