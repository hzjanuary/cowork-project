import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CloseOutlined, EditOutlined, SaveOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { useAuth } from '../hooks/useAuth.js';
import { useUser } from '../hooks/useUser.js';

const Profile = () => {
    const { account } = useAuth();
    const { user, createUser, updateUser, updateAvatar, getCurrentUser, changePassword, isLoading } = useUser();
    const [profile, setProfile] = useState({ fullName: '', phoneNumber: '', dateOfBirth: '', gender: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [profileSnapshot, setProfileSnapshot] = useState(null);

    useEffect(() => {
        getCurrentUser()
            .then((currentUser) => {
                setProfile({
                    fullName: currentUser.fullName || '',
                    phoneNumber: currentUser.phoneNumber || '',
                    dateOfBirth: currentUser.dateOfBirth ? currentUser.dateOfBirth.slice(0, 10) : '',
                    gender: currentUser.gender || ''
                });
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
    const updatePassword = (field, value) => setPasswords((current) => ({ ...current, [field]: value }));
    const avatarSrc = user?.avatar || '/images/default-avatar.jpg';

    const startEditing = () => {
        setProfileSnapshot(profile);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setProfile(profileSnapshot || { fullName: '', phoneNumber: '', dateOfBirth: '', gender: '' });
        setIsEditing(false);
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        if (!profile.fullName.trim() || !profile.phoneNumber.trim() || !profile.dateOfBirth || !profile.gender) {
            toast.error('Please fill in all profile fields.');
            return;
        }

        try {
            if (user?._id) {
                await updateUser(user._id, profile);
            } else {
                await createUser(profile);
            }
            toast.success('Profile saved.');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Profile could not be saved.');
        }
    };

    const handleAvatarUpload = async (event) => {
        const avatarFile = event.target.files?.[0];
        event.target.value = '';

        if (!avatarFile) return;

        try {
            setIsUploadingAvatar(true);
            await updateAvatar(avatarFile);
            toast.success('Avatar updated.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Avatar could not be updated.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handlePassword = async (event) => {
        event.preventDefault();
        try {
            await changePassword(passwords);
            toast.success('Password changed.');
            setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password could not be changed.');
        }
    };

    return (
        <div className="page-stack">
            <section className="profile-banner">
                <Avatar
                    size={72}
                    icon={<UserOutlined />}
                    src={avatarSrc}
                />
                <div>
                    <span className="eyebrow">{account?.role || 'user'} account</span>
                    <h1>{account?.username || 'Profile'}</h1>
                    <p>{account?.email}</p>
                </div>
                <label className="btn btn-secondary" style={{ cursor: isUploadingAvatar ? 'not-allowed' : 'pointer' }}>
                    <UploadOutlined /> {isUploadingAvatar ? 'Uploading...' : 'Change avatar'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        style={{ display: 'none' }}
                    />
                </label>
            </section>

            <section className="workspace-grid two">
                <form className="form-panel" onSubmit={handleSaveProfile}>
                    <div className="panel-heading">
                        <h2>Learning profile</h2>
                        {!isEditing ? (
                            <button className="btn btn-secondary" onClick={startEditing} type="button">
                                <EditOutlined /> Edit profile
                            </button>
                        ) : (
                            <button className="btn btn-secondary" onClick={cancelEditing} type="button">
                                <CloseOutlined /> Cancel
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="compact-list">
                            <div className="list-row">
                                <span>Full name</span>
                                <strong>{profile.fullName || 'Not set'}</strong>
                            </div>
                            <div className="list-row">
                                <span>Phone number</span>
                                <strong>{profile.phoneNumber || 'Not set'}</strong>
                            </div>
                            <div className="list-row">
                                <span>Date of birth</span>
                                <strong>{profile.dateOfBirth || 'Not set'}</strong>
                            </div>
                            <div className="list-row">
                                <span>Gender</span>
                                <strong>{profile.gender || 'Not set'}</strong>
                            </div>
                            <div className="list-row">
                                <span>Email</span>
                                <strong>{account?.email || 'Not set'}</strong>
                            </div>
                            <div className="list-row">
                                <span>Role</span>
                                <strong>{account?.role || 'user'}</strong>
                            </div>
                        </div>
                    ) : (
                        <>
                            <label>
                                Full name
                                <input value={profile.fullName} onChange={(event) => updateProfile('fullName', event.target.value)} />
                            </label>
                            <label>
                                Phone number
                                <input value={profile.phoneNumber} onChange={(event) => updateProfile('phoneNumber', event.target.value)} />
                            </label>
                            <label>
                                Date of birth
                                <input type="date" value={profile.dateOfBirth} onChange={(event) => updateProfile('dateOfBirth', event.target.value)} />
                            </label>
                            <label>
                                Gender
                                <select value={profile.gender} onChange={(event) => updateProfile('gender', event.target.value)}>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                            <button className="btn btn-primary" disabled={isLoading} type="submit">
                                <SaveOutlined /> Save profile
                            </button>
                        </>
                    )}
                </form>

                <form className="form-panel" onSubmit={handlePassword}>
                    <div className="panel-heading">
                        <h2>Security</h2>
                    </div>
                    <label>
                        Current password
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(event) => updatePassword('currentPassword', event.target.value)}
                        />
                    </label>
                    <label>
                        New password
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(event) => updatePassword('newPassword', event.target.value)}
                        />
                    </label>
                    <label>
                        Confirm new password
                        <input
                            type="password"
                            value={passwords.confirmNewPassword}
                            onChange={(event) => updatePassword('confirmNewPassword', event.target.value)}
                        />
                    </label>
                    <button className="btn btn-secondary" type="submit">Change password</button>
                </form>
            </section>
        </div>
    );
};

export default Profile;
