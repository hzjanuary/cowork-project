import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SaveOutlined } from '@ant-design/icons';
import {useTest} from '../../hooks/useTest.js';
import { useUser } from '../../hooks/useUser.js';

const CreateTest = () => {
    const navigate = useNavigate();
    const { createTest, isLoading } = useTest();
    const { user, getCurrentUser } = useUser();
    const [form, setForm] = useState({
        title: '',
        timeLimit: 30,
        visibility: 'private'
    });

    useEffect(() => {
        getCurrentUser().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.title.trim()) {
            toast.error('Test title is required.');
            return;
        }
        if (!user?._id) {
            toast.error('Create your profile before creating a test.');
            return;
        }

        try {
            await createTest({
                title: form.title,
                userId: user?._id,
                timeLimit: Number(form.timeLimit) || 0,
                visibility: form.visibility
            });
            toast.success('Test created.');
            navigate('/tests');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Test could not be created.');
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">New test</span>
                    <h1>Create a timed practice set</h1>
                </div>
            </section>

            <form className="form-panel slim" onSubmit={handleSubmit}>
                <label>
                    Title
                    <input
                        value={form.title}
                        onChange={(event) => updateField('title', event.target.value)}
                        placeholder="N4 vocabulary checkpoint"
                    />
                </label>
                <div className="form-grid">
                    <label>
                        Time limit
                        <input
                            min="0"
                            type="number"
                            value={form.timeLimit}
                            onChange={(event) => updateField('timeLimit', event.target.value)}
                        />
                    </label>
                    <label>
                        Visibility
                        <select value={form.visibility} onChange={(event) => updateField('visibility', event.target.value)}>
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                        </select>
                    </label>
                </div>
                <div className="action-row">
                    <button className="btn btn-primary" disabled={isLoading} type="submit">
                        <SaveOutlined /> {isLoading ? 'Saving...' : 'Save test'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTest;
