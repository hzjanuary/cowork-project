import accountsModel from '../Models/accounts.models.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { sendAccountVerificationOtp, verifyAccountOtp, sendResetPasswordOtp, verifyResetPasswordOtp } from '../Services/auth.services.js'
import verificationEmail from '../Utils/Verification/verificationMail.js'
import resetPasswordEmail from '../Utils/ResetPassword/resetPassword.js'

const accountsController = {
    createAccount: async (req, res) => {
        const { username, email, password, role, confirmPassword } = req.body
        if (!username || !email || !password || !confirmPassword) return res.status(400).json({ message: 'Missing Information' })

        if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match!' })

        try {
            const normalizedEmail = email.toLowerCase()
            const existEmail = await accountsModel.findOne({ email: normalizedEmail })
            if (existEmail) return res.status(400).json({ message: 'Email already exist!' })

            const hashedPassword = await bcrypt.hash(password, 10)
            
            await accountsModel.create({
                username,
                email: normalizedEmail,
                password: hashedPassword,
                role: role || 'user',
                isVerified: false
            })

            await sendAccountVerificationOtp(normalizedEmail)

            return res.status(201).json({ message: 'Account created successfully! Please check your email for verification', email: normalizedEmail })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    sendOtp: async (req, res) => {
        try {
            const { email } = req.body

            const result = await sendAccountVerificationOtp(email)

            res.json(result)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    verifyOtp: async (req, res) => {
        try {
            const { email, pin } = req.body
            if (!email || !pin) return res.status(400).json({ message: 'Email and pin are required!' })
            const result =  await verifyAccountOtp(email, pin)

            res.json(result)
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    },
    forgetPassword: async (req, res) => {
        const { email } = req.body
        if (!email) return res.status(400).json({ message: 'Please type in your email!' })
        
        try {
            const normalizedEmail = email.toLowerCase()
            const exist = await accountsModel.findOne({ email: normalizedEmail })
            if (!exist) return res.status(404).json({ message: 'Account not found!' })

            await sendResetPasswordOtp(normalizedEmail)
            return res.status(200).json({ message: 'Reset password OTP has been sent to email!' })
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    },
    resetPassword: async (req, res) => {
        const { email, password, confirmPassword } = req.body
        if (!email || !password || !confirmPassword) return res.status(400).json({ message: 'Missing fields!' })

        if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match!' })
        
        try {
            const normalizedEmail = email.toLowerCase()
            const account = await accountsModel.findOne({ email: normalizedEmail })
            if (!account) return res.status(404).json({ message: 'Account not found!' })

            if (!account.resetAllowed) return res.status(403).json({ message: 'Password reset not allowed. Please verify your email first!' })

            const hashedPassword = await bcrypt.hash(password, 10)
            await accountsModel.updateOne(
                { email: normalizedEmail },
                { password: hashedPassword, resetAllowed: false }
            )

            return res.status(200).json({ message: 'Password reset successfully!' })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    loginAccount: async (req, res) => {
        const account = req.account

        try {
            const jwtToken = jwt.sign({
                accountId: account._id,
                email: account.email,
                role: account.role
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            })

            return res.status(200).json({ 
                message: 'Login successfully!', 
                token: jwtToken, 
                account: { 
                    _id: account._id, 
                    email: account.email, 
                    role: account.role 
                } 
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    getAllAccounts: async (req, res) => {
        try {
            const accounts = await accountsModel.find().select('-password')
            return res.status(200).json(accounts)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    getAccountById: async (req, res) => {
        const { accountId } = req.params

        try {
            const account = await accountsModel.findById(accountId).select('-password')
            if (!account) return res.status(404).json({ message: 'Account not found!' })
            return res.status(200).json(account)
        } catch (error) {
            res.status(500).json({ message: error.message })
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
    },
    updateRole: async (req, res) => {
        const { accountId, role } = req.body
        const requesterRole = req.account.role

        if (!accountId || !role) return res.status(400).json({ message: 'Account ID and role are required!' })

        if (!['user', 'teacher', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be one of: user, teacher, moderator, admin' })
        }

        try {
            // Check if no admins exist (allowing first admin assignment)
            const adminCount = await accountsModel.countDocuments({ role: 'admin' })
            
            // Only admins can change roles, unless this is the first admin assignment
            if (adminCount > 0 && requesterRole !== 'admin') {
                return res.status(403).json({ message: 'Only administrators can change user roles!' })
            }

            const account = await accountsModel.findById(accountId)
            if (!account) return res.status(404).json({ message: 'Account not found!' })

            // Update the role
            await accountsModel.updateOne(
                { _id: accountId },
                { role }
            )

            return res.status(200).json({ 
                message: 'Role updated successfully!', 
                account: { 
                    _id: account._id, 
                    username: account.username,
                    email: account.email, 
                    role 
                } 
            })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    activateAccount: async (req, res) => {
        const { accountId } = req.params

        try {
            const account = await accountsModel.findById(accountId)
            if (!account) return res.status(404).json({ message: 'Account not found!' })

            await accountsModel.updateOne({ _id: accountId }, { active: true })
            return res.status(200).json({ message: 'Account activated successfully!' })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    deActivateAccount: async (req, res) => {
        const { accountId } = req.params

        try {
            const account = await accountsModel.findById(accountId)
            if (!account) return res.status(404).json({ message: 'Account not found!' })

            await accountsModel.updateOne({ _id: accountId }, { active: false })
            return res.status(200).json({ message: 'Account deactivated successfully!' })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    },
    deleteAccount: async (req, res) => {
        const { accountId } = req.params

        try {
            const account = await accountsModel.findById(accountId)
            if (!account) return res.status(404).json({ message: 'Account not found!' })

            await accountsModel.deleteOne({ _id: accountId })

            return res.status(200).json({ message: 'Account deleted successfully!' })
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }
}

export default accountsController