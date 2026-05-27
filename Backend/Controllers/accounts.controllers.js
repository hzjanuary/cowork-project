import accountsModel from '../Models/accounts.models.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { sendAccountVerificationOtp, verifyAccountOtp, sendResetPasswordOtp, verifyResetPasswordOtp } from '../Services/auth.services.js'
import verificationEmail from '../Utils/Verification/verificationMail.js'
import resetPasswordEmail from '../Utils/ResetPassword/resetPassword.js'

const accountsController = {
    createAccount: async (req, res) => {
        const { username, email, password, confirmPassword } = req.body
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
            const normailizedEmail = email.toLowerCase()
            const exist = await accountsModel.findOne({ email: normailizedEmail })
            if (!exist) return res.status(404).json({ message: 'Account not found!' })
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
    }
}

export default accountsController