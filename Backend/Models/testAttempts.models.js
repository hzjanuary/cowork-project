import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Questions", required: true },
  studentAnswer: String,
  isCorrect: Boolean,
  points: { type: Number, default: 0 },
  maxPoints: { type: Number, default: 1 },
  needsManualGrading: { type: Boolean, default: false },
  manualScore: { type: Number, default: null },
  teacherFeedback: String,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "accounts" },
  gradedAt: Date
});

const testAttemptSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "accounts", required: true },
  answers: [answerSchema],
  
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  
  status: { type: String, enum: ["in_progress", "submitted", "needs_manual_grading", "graded"], default: "in_progress" },
  needsManualGrading: { type: Boolean, default: false },
  manualGradingStatus: {
    type: String,
    enum: ["not_required", "pending", "graded"],
    default: "not_required"
  },
  totalAutoScore: { type: Number, default: 0 },
  teacherScore: { type: Number, default: 0 },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "accounts" },
  gradedAt: Date,
  teacherFeedback: String,
  totalScore: Number,
  totalPoints: Number,
  percentage: Number
}, { timestamps: true });

const testAttemptModel = mongoose.model("TestAttempt", testAttemptSchema);
export default testAttemptModel;
