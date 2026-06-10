import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser.js';
import { useAuth } from '../hooks/useAuth.js';
import { toast } from 'react-toastify';
// import './Profile.css';

const CreateProfile = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        dateOfBirth: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { createUser, updateAvatar } = useUser();
    const { account } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        console.log('🖼️  [handleAvatarChange] File input changed');
        if (file) {
            console.log('🖼️  [handleAvatarChange] File selected:', {
                name: file.name,
                size: file.size,
                type: file.type,
                sizeInMB: (file.size / 1024 / 1024).toFixed(2)
            });
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('🖼️  [handleAvatarChange] File preview generated');
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            console.log('🖼️  [handleAvatarChange] No file selected');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📋 [handleSubmit] Form submitted');
        console.log('📋 [handleSubmit] Form data:', formData);
        console.log('📋 [handleSubmit] Avatar selected:', avatar ? 'Yes' : 'No');

        if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.dateOfBirth) {
            console.warn('⚠️  [handleSubmit] Validation failed: Missing required fields');
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setIsLoading(true);
            console.log('📋 [handleSubmit] Creating user...');
            const userData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                dateOfBirth: formData.dateOfBirth
            };

            const response = await createUser(userData);
            console.log('✅ [handleSubmit] User created successfully:', response);

            // Upload avatar if selected
            if (avatar) {
                console.log('📋 [handleSubmit] Avatar selected, starting upload...');
                try {
                    await updateAvatar(response.user?._id, avatar);
                    console.log('✅ [handleSubmit] Avatar uploaded successfully');
                } catch (uploadErr) {
                    console.error('❌ [handleSubmit] Avatar upload failed:', uploadErr);
                    toast.error('Profile created but avatar upload failed');
                }
            } else {
                console.log('ℹ️  [handleSubmit] No avatar selected, skipping upload');
            }

            toast.success('Profile created successfully!');
            console.log('📋 [handleSubmit] Navigating to /profile');
            navigate('/profile');
        } catch (error) {
            console.error('❌ [handleSubmit] Error during submission:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(error.response?.data?.message || 'Failed to create profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-profile-container">
            <div className="profile-card">
                <h2>Create Your Profile</h2>

                <form onSubmit={handleSubmit}>
                    <div className="avatar-section">
                        <label htmlFor="avatar">Profile Picture</label>
                        {avatarPreview && (
                            <div className="avatar-preview">
                                <img src={avatarPreview} alt="Preview" />
                            </div>
                        )}
                        <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dateOfBirth">Date of Birth</label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? 'Creating...' : 'Create Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
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

export default CreateProfile;
