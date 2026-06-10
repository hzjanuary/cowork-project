import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Questions", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "accounts", required: true },
  userAnswer: String,
  isCorrect: Boolean,
  answeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index to quickly check if a user answered a question
answerSchema.index({ questionId: 1, userId: 1 }, { unique: true });

const answerModel = mongoose.model("Answer", answerSchema);
export default answerModel;
