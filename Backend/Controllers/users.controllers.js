// import userModel from "../Models/users.models.js";

// const userControllers = {
//     createUser: async (req, res) => {
//         const accountId = req.account._id
//         const { fullName, phoneNumber, dateOfBirth } = req.body
//         if (!fullName || !phoneNumber || !dateOfBirth) {
//             return res.status(400).json({ message: 'All fields are required' })
//         }

//         try {
//             const existAccount = await userModel.findOne({ accountId })
//             if (existAccount) {
//                 return res.status(400).json({ message: 'User already exists' })
//             }

//             const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
//             const newUser = new userModel({
//                 accountId,
//                 fullName,
//                 phoneNumber,
//                 dateOfBirth,
//                 age,
//                 avatar: avatar || null
//             })

//             return res.status(201).json({ message: 'User created successfully', user: newUser })
//         } catch (error) {
//             return res.status(500).json({ message: 'Server error', error: error.message })
//         }
//     },
//     updateUser: async (req, res) => {
//         const userId = req.params
//         const { fullName, phoneNumber, dateOfBirth } = req.body
        
//         const user = await userModel.findById(userId)
//         if (!user) return res.status(404).json({ message: 'User not found!' })

//         try {
//             const updateData = {}
//             if (fullName) updateData.fullName = fullName
//             if (phoneNumber) updateData.phoneNumber = phoneNumber
//             if (dateOfBirth) {
//                 updateData.dateOfBirth = dateOfBirth
//                 updateData.age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
//             }
            
//             const updatedUser = await userModel.findByIdAndUpdate(
//                 userId,
//                 updateData,
//                 { new: true }
//             )

//             return res.status(200).json({ message: 'User updated successfully', user: updatedUser })
//         } catch (error) {
//             return res.status(500).json({ message: 'Server error', error: error.message })
//         }
//     },
//     changePassword: async (req, res) => {
//         const accountId = req.account._id
//         const { currentPassword, newPassword, confirmNewPassword } = req.body
//         if (!currentPassword || !newPassword || !confirmNewPassword) return res.status(400).json({ message: 'Missing fields!' })

//         if (newPassword !== confirmNewPassword) return res.status(400).json({ message: 'New passwords do not match!' })

//         try {
//             const account = await accountsModel.findById(req.account._id)
//             if (!account) return res.status(404).json({ message: 'Account not found!' })

//             const isMatch = await bcrypt.compare(currentPassword, account.password)
//             if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect!' })

//             const hashedNewPassword = await bcrypt.hash(newPassword, 10)
//             account.password = hashedNewPassword
//             await account.save()

//             return res.status(200).json({ message: 'Password changed successfully!' })
//         } catch (error) {
//             res.status(500).json({ message: 'Internal server error', error: error.message })
//         }
//     }
// }

// export default userControllers

import userModel from "../Models/users.models.js";
import accountsModel from "../Models/accounts.models.js";
import bcrypt from 'bcrypt';

const userControllers = {
    createUser: async (req, res) => {
        const accountId = req.account._id
        const { fullName, phoneNumber, dateOfBirth } = req.body
        
        console.log('👤 [createUser] Request received');
        console.log('👤 [createUser] Account ID:', accountId);
        console.log('👤 [createUser] Data:', { fullName, phoneNumber, dateOfBirth });
        
        if (!fullName || !phoneNumber || !dateOfBirth) {
            console.warn('⚠️  [createUser] Missing required fields');
            return res.status(400).json({ message: 'All fields are required' })
        }

        try {
            console.log('👤 [createUser] Checking if user already exists...');
            const existAccount = await userModel.findOne({ accountId })
            if (existAccount) {
                console.warn('⚠️  [createUser] User already exists for accountId:', accountId);
                return res.status(400).json({ message: 'User already exists' })
            }

            const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
            const avatar = req.file ? req.file.path : 'http://localhost:5174/images/default-avatar.jpg'
            
            console.log('👤 [createUser] Creating new user with:', {
                accountId,
                fullName,
                phoneNumber,
                dateOfBirth,
                age,
                avatar
            });
            
            const newUser = new userModel({
                accountId,
                fullName,
                phoneNumber,
                dateOfBirth,
                age,
                avatar
            })

            await newUser.save()
            console.log('✅ [createUser] User created successfully:', newUser._id);
            
            return res.status(201).json({ message: 'User created successfully', user: newUser })
        } catch (error) {
            console.error('❌ [createUser] Error:', {
                message: error.message,
                stack: error.stack
            });
            return res.status(500).json({ message: 'Server error', error: error.message })
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.find().populate('accountId', 'username email role')
            return res.status(200).json({ users })
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message })
        }
    },

    getCurrentUser: async (req, res) => {
        const accountId = req.account._id
        try {
            const user = await userModel.findOne({ accountId }).populate('accountId', 'username email role')
            if (!user) return res.status(404).json({ message: 'User not found!' })
            return res.status(200).json({ user })
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message })
        }
    },

    updateUser: async (req, res) => {
        const { id: userId } = req.params // Fixed: extract id from params
        const { fullName, phoneNumber, dateOfBirth } = req.body
        
        const user = await userModel.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found!' })

        try {
            const updateData = {}
            if (fullName) updateData.fullName = fullName
            if (phoneNumber) updateData.phoneNumber = phoneNumber
            if (dateOfBirth) {
                updateData.dateOfBirth = dateOfBirth
                updateData.age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
            }
            if (req.file?.path) {
                updateData.avatar = req.file.path // Update avatar if file uploaded
            }
            
            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            )

            return res.status(200).json({ message: 'User updated successfully', user: updatedUser })
        } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message })
        }
    },

    updateAvatar: async (req, res) => {
        const accountId = req.account._id
        
        console.log('🖼️  [updateAvatar] Request received');
        console.log('🖼️  [updateAvatar] Account ID:', accountId);
        console.log('🖼️  [updateAvatar] File info:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            filename: req.file.filename
        } : 'No file');

        if (!req.file) {
            console.warn('⚠️  [updateAvatar] No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' })
        }

        try {
            console.log('🖼️  [updateAvatar] Searching for user with accountId:', accountId);
            const user = await userModel.findOne({ accountId })
            if (!user) {
                console.warn('⚠️  [updateAvatar] User not found for accountId:', accountId);
                return res.status(404).json({ message: 'User not found!' })
            }

            console.log('🖼️  [updateAvatar] Updating avatar for user:', user._id);
            console.log('🖼️  [updateAvatar] New avatar URL:', req.file.path);
            
            const updatedUser = await userModel.findByIdAndUpdate(
                user._id,
                { avatar: req.file.path },
                { new: true }
            )

            console.log('✅ [updateAvatar] Avatar updated successfully:', updatedUser);
            return res.status(200).json({ 
                message: 'Avatar updated successfully', 
                user: updatedUser 
            })
        } catch (error) {
            console.error('❌ [updateAvatar] Error:', {
                message: error.message,
                stack: error.stack
            });
            return res.status(500).json({ message: 'Server error', error: error.message })
        }
    },

    changePassword: async (req, res) => {
        const accountId = req.account._id
        const { currentPassword, newPassword, confirmNewPassword } = req.body
        if (!currentPassword || !newPassword || !confirmNewPassword) return res.status(400).json({ message: 'Missing fields!' })

        if (newPassword !== confirmNewPassword) return res.status(400).json({ message: 'New passwords do not match!' })

        try {
            const account = await accountsModel.findById(req.account._id)
            if (!account) return res.status(404).json({ message: 'Account not found!' })

            const isMatch = await bcrypt.compare(currentPassword, account.password)
            if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect!' })

            const hashedNewPassword = await bcrypt.hash(newPassword, 10)
            account.password = hashedNewPassword
            await account.save()

            return res.status(200).json({ message: 'Password changed successfully!' })
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
        }
    }
}

export default userControllers