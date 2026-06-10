import { useState } from 'react';
import { toast } from 'react-toastify';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { useAuth } from '../hooks/useAuth.js';
import { useUser } from '../hooks/useUser.js';

const Profile = () => {
    const { account } = useAuth();
    const { createUser, changePassword, isLoading } = useUser();
    const [profile, setProfile] = useState({ fullName: '', phoneNumber: '', dateOfBirth: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

    const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
    const updatePassword = (field, value) => setPasswords((current) => ({ ...current, [field]: value }));

    const handleCreateProfile = async (event) => {
        event.preventDefault();
        try {
            await createUser(profile);
            toast.success('Profile saved.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Profile could not be saved.');
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
                <Avatar size={72} icon={<UserOutlined />} />
                <div>
                    <span className="eyebrow">{account?.role || 'user'} account</span>
                    <h1>{account?.username || 'Profile'}</h1>
                    <p>{account?.email}</p>
                </div>
            </section>

            <section className="workspace-grid two">
                <form className="form-panel" onSubmit={handleCreateProfile}>
                    <div className="panel-heading">
                        <h2>Learning profile</h2>
                    </div>
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
                    <button className="btn btn-primary" disabled={isLoading} type="submit">
                        <SaveOutlined /> Save profile
                    </button>
                </form>

                <form className="form-panel" onSubmit={handlePassword}>
                    <div className="panel-heading">
                        <h2>Password</h2>
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
