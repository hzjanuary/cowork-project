import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'teacher', 'admin'], default: 'user', required: true },
    isVerified: { type: Boolean, default: false },
    resetAllowed: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now() },
}, { timestamps: true })

const accountModel = mongoose.model("accounts", accountSchema);

export default accountModel;