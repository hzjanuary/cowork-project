import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phoneNumber: { type: String, required: true },
    age: { type: Number, required: true },
    avatar: {
        type: String,
        default: 'http://localhost:5174/images/default-img.jpg'
    }
}, { timestamps: true })

const userModel = mongoose.model('Users', userSchema)

export default userModel