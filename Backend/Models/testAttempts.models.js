import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Questions", required: true },
  studentAnswer: String,
  isCorrect: Boolean,
  points: Number
});

const testAttemptSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "accounts", required: true },
  answers: [answerSchema],
  
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  
  status: { type: String, enum: ["in_progress", "submitted", "graded"], default: "in_progress" },
  totalScore: Number,
  totalPoints: Number,
  percentage: Number
}, { timestamps: true });

const testAttemptModel = mongoose.model("TestAttempt", testAttemptSchema);
export default testAttemptModel;