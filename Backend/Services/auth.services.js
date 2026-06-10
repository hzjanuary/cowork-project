import otpModel from "../Models/otp.models.js";
import { PIN4Generator } from "../Utils/PIN/PIN.js";
import verificationEmail from '../Utils/Verification/verificationMail.js'
import resetPasswordEmail from "../Utils/ResetPassword/resetPassword.js";
import bcrypt from 'bcrypt'
import accountModel from "../Models/accounts.models.js";

// Configuration
export const sendOtpByType = async (email, type, emailFn) => {
    const pin = PIN4Generator()

    const hashedPin = await bcrypt.hash(String(pin), 10)

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await otpModel.deleteMany({ email, type })

    await otpModel.create({
        email,
        pin: hashedPin,
        type,
        expiresAt
    })

    await emailFn(email, pin)

    return { message: `${type} OTP send successfully` }
}

export const verifyOtpByType = async (email, inputPin, type) => {
    const record = await otpModel.findOne({ email, type })

    if (!record) {
        throw new Error("Otp not found!")
    }

    if (record.expiresAt < new Date()) {
        throw new Error("Otp expired!")
    }

    const isMatch = await bcrypt.compare(inputPin, record.pin)
    if (!isMatch) {
        throw new Error("Invalid OTP!")
    }

    await otpModel.deleteOne({ _id: record._id })

    return { message: `${type} OTP verification successfully!` }
}

// Verification
export const sendAccountVerificationOtp = async (email) => {
    return sendOtpByType(email, 'verify', verificationEmail)
}

export const verifyAccountOtp = async (email, inputPin) => {
    const result = await verifyOtpByType(email, inputPin, 'verify')

    await accountModel.updateOne(
        { email }, 
        { isVerified: true }
    )

    return result
}

// Reset Password
export const sendResetPasswordOtp = async (email) => {
    return sendOtpByType(email, 'reset', resetPasswordEmail)
}

export const verifyResetPasswordOtp = async (email, inputPin) => {
    const result = await verifyOtpByType(email, inputPin, 'reset')

    await accountModel.updateOne(
        { email }, 
        { resetAllowed: true }
    )

    return result
}
