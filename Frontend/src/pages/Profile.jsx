import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useUser } from '../hooks/useUser.js';
import { toast } from 'react-toastify';
// import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [newAvatar, setNewAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const { account, logout, isLoading: authLoading } = useAuth();
    const { user: userData, getCurrentUser, updateUser, updateAvatar } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for auth state to resolve before redirecting
        if (authLoading) return;

        if (!account) {
            navigate('/login');
            return;
        }

        fetchUserData();
    }, [account, authLoading]);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const data = await getCurrentUser();
            setUser(data);
            setEditData(data);
        } catch (error) {
            // If the token is invalid or expired, redirect to login
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
                navigate('/login');
                return;
            }

            toast.error('Failed to fetch profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setIsLoading(true);
            await updateUser(user._id, {
                fullName: editData.fullName,
                phoneNumber: editData.phoneNumber,
                dateOfBirth: editData.dateOfBirth
            });

            if (newAvatar) {
                await updateAvatar(user._id, newAvatar);
            }

            setUser(editData);
            setIsEditMode(false);
            setNewAvatar(null);
            setAvatarPreview(null);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (isLoading) return <div className="loading">Loading profile...</div>;
    if (!user) return <div>Profile not found</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>My Profile</h2>
                <div className="profile-actions">
                    <button onClick={() => setIsEditMode(!isEditMode)} className="btn-secondary">
                        {isEditMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                    <button onClick={handleLogout} className="btn-danger">Logout</button>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-avatar">
                    <div className="avatar-container">
                        <img
                            src={
                                avatarPreview ||
                                user?.avatar ||
                                (typeof window !== 'undefined' ? '/assets/default-img.jpg' : '/default-avatar.png')
                            }
                            alt="Profile"
                        />
                    </div>
                    {isEditMode && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="avatar-input"
                        />
                    )}
                </div>

                <div className="profile-info">
                    {isEditMode ? (
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={editData.fullName}
                                    onChange={(e) => handleEditChange('fullName', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={editData.phoneNumber}
                                    onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    value={editData.dateOfBirth}
                                    onChange={(e) => handleEditChange('dateOfBirth', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={isLoading}
                                className="btn-primary"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <div className="profile-details">
                            <div className="detail-row">
                                <span className="label">Full Name:</span>
                                <span className="value">{user.fullName || 'Not set'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Email:</span>
                                <span className="value">{account?.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Phone:</span>
                                <span className="value">{user.phoneNumber || 'Not set'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Date of Birth:</span>
                                <span className="value">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Age:</span>
                                <span className="value">{user.age || 'Not calculated'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Role:</span>
                                <span className={`badge role ${account?.role}`}>{account?.role}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Account Status:</span>
                                <span className={`badge ${account?.isVerified ? 'verified' : 'unverified'}`}>
                                    {account?.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-links">
                <button onClick={() => navigate('/tests')} className="link-button">
                    My Tests
                </button>
                <button onClick={() => navigate('/questions')} className="link-button">
                    My Questions
                </button>
                <button onClick={() => navigate('/faq')} className="link-button">
                    FAQ & Help
                </button>
            </div>
        </div>
    );
}

export default Profile;