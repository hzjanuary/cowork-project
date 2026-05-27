import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Configs/cloudinary.configs.js';

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'user_avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
            { width: 200, height: 200, crop: 'fill' }
        ]
    }
});

const avatarUpload = multer({ 
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default avatarUpload;