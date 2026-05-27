import accountModel from "../Models/accounts.models.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const registerValidation = async (req, res, next) => {
    try {
        const { username, email, password, confirmPassword } = req.body
        if (!username) return res.status(400).json({ message: 'Username is required!' })
        if (!email) return res.status(400).json({ message: 'Email is required!' })
        if (!password || password.length < 8) return res.status(400).json({ message: 'Password is required and must be at least 8 characters long!' })
        if (!confirmPassword) return res.status(400).json({ message: 'Confirm password is required!' })
        if (password !== confirmPassword) return res.status(400).json({ message: 'Confirm password does not match!' })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format!' })
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!' })

        next()
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message
        });
    }
}

export const authToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid token. Cannot access to features!' })
        }

        const token = authHeader.split(' ')[1]

        if(!token) {
            return res.status(400).json({ message: 'No token. Access denied!' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const account = await accountModel.findById(decoded.accountId)

        if (!account) {
            return res.status(404).json({ message: 'Account not found!' })
        }

        req.account = account
        req.user = decoded

        next()
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token." });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token has expired." });
        }

        return res.status(500).json({
            message: "Internal server error.",
            error: error.message
        });
    }
}

export const checkVerify = async (req, res, next) => {
   if (!req.account.isVerified) {
    return res.status(403).json({ message: 'Account is not verified. Please verify your account to access this feature!' })
   }

   next()
}

export const loginValidation = async (req, res, next) => {
    try {
        const { username, password } = req.body
        if (!username || !password) return res.status(400).json({ message: 'Username and password are required!' })
        
        const account = await accountModel.findOne({ username })
        if (!account) return res.status(404).json({ message: 'Account not found!' })
        
        const isMatch = await bcrypt.compare(password, account.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials!' })

        if (!account.isVerified) return res.status(403).json({ message: 'Account is not verified. Please verify your account to access this feature!' })

        req.account = account
        next()
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message
        });
    }
}

export const checkAdmin = async (req, res, next) => {
    try {
        if(!req.account) return res.status(401).json({ message: 'Access denied!' })

        if(!req.account.isAdmin) return res.status(403).json({ message: 'Only administrators can access this feature!' })

        next()
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message
        });
    }
}

export const checkModerator = async (req, res, next) => {
    try {
        if(!req.account) return res.status(401).json({ message: 'Access denied!' })

        if(!req.account.isModerator) return res.status(403).json({ message: 'Only moderators can access this feature!' })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message
        });
    }
}

export const checkTeacher = async (req, res, next) => {
    try {
        if(!req.account) return res.status(401).json({ message: 'Access denied!' })

        if(!req.account.isTeacher) return res.status(403).json({ message: 'Only teachers can access this feature!' })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error.",
            error: error.message
        });
    }
}