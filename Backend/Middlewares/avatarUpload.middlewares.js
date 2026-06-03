import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Configs/cloudinary.configs.js';

console.log('📦 [avatarUpload] Initializing avatar upload middleware');
console.log('☁️  [avatarUpload] Cloudinary config:', {
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key,
    hasSecret: !!cloudinary.config().api_secret
});

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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        console.log('📤 [avatarUpload] File validation:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimes.includes(file.mimetype)) {
            console.warn('⚠️  [avatarUpload] Invalid MIME type:', file.mimetype);
            return cb(new Error('Only JPEG and PNG files are allowed'));
        }
        
        cb(null, true);
    }
});

export default avatarUpload;