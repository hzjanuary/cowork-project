import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {useTest} from '../../hooks/useTest.js';

const TestList = () => {
    const { tests, getAllTests, deleteTest, isLoading } = useTest();
    const [visibility, setVisibility] = useState('all');

    useEffect(() => {
        getAllTests().catch((error) => toast.error(error.response?.data?.message || 'Could not load tests.'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredTests = useMemo(() => {
        return tests.filter((test) => visibility === 'all' || test.visibility === visibility);
    }, [tests, visibility]);

    const handleDelete = async (id) => {
        try {
            await deleteTest(id);
            toast.success('Test deleted.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed.');
        }
    };

    return (
        <div className="page-stack">
            <section className="page-heading">
                <div>
                    <span className="eyebrow">Test studio</span>
                    <h1>Build and manage timed tests</h1>
                </div>
                <div className="action-row">
                    <button className="btn btn-secondary" onClick={() => getAllTests()} type="button">
                        <ReloadOutlined /> Refresh
                    </button>
                    <Link className="btn btn-primary" to="/tests/new">
                        <PlusOutlined /> New test
                    </Link>
                </div>
            </section>

            <section className="toolbar">
                <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                    <option value="all">All visibility</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                </select>
            </section>

            <section className="table-panel">
                <div className="table-header test-table">
                    <span>Title</span>
                    <span>Time limit</span>
                    <span>Visibility</span>
                    <span>Created</span>
                    <span></span>
                </div>
                {filteredTests.map((test) => (
                    <div className="table-row test-table" key={test._id}>
                        <strong>{test.title}</strong>
                        <span>{test.timeLimit || 0} minutes</span>
                        <span className={`pill ${test.visibility}`}>{test.visibility}</span>
                        <span>{test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'n/a'}</span>
                        <button className="icon-btn danger" onClick={() => handleDelete(test._id)} title="Delete" type="button">
                            <DeleteOutlined />
                        </button>
                    </div>
                ))}
                {!filteredTests.length && (
                    <div className="empty-state">{isLoading ? 'Loading tests...' : 'No tests match this view.'}</div>
                )}
            </section>
        </div>
    );
};

export default TestList;
