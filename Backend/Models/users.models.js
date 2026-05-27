import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
    phoneNumber: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    avatar: {
        type: String,
        default: null
    }
}, { timestamps: true })

const userModel = mongoose.model('Users', userSchema)

export default userModel