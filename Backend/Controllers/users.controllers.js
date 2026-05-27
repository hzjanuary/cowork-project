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
import bcrypt from 'bcryptjs';

const userControllers = {
    createUser: async (req, res) => {
        const accountId = req.account._id
        const { fullName, phoneNumber, dateOfBirth } = req.body
        if (!fullName || !phoneNumber || !dateOfBirth) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        try {
            const existAccount = await userModel.findOne({ accountId })
            if (existAccount) {
                return res.status(400).json({ message: 'User already exists' })
            }

            const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
            const newUser = new userModel({
                accountId,
                fullName,
                phoneNumber,
                dateOfBirth,
                age,
                avatar: req.file?.path || null // Cloudinary URL from multer
            })

            await newUser.save()
            return res.status(201).json({ message: 'User created successfully', user: newUser })
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
        const { id: userId } = req.params
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        try {
            const user = await userModel.findById(userId)
            if (!user) return res.status(404).json({ message: 'User not found!' })

            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                { avatar: req.file.path },
                { new: true }
            )

            return res.status(200).json({ 
                message: 'Avatar updated successfully', 
                user: updatedUser 
            })
        } catch (error) {
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