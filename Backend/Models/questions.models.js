// models/Question.js
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  label: String,
  text: String,
  isCorrect: Boolean
});

const questionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  authorRole: { type: String, enum: ["student", "user", "teacher", "admin"], default: "user" },
  sourceFile: { type: mongoose.Schema.Types.ObjectId, ref: "FileUploads" },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Tests" },

  questionText: { type: String, required: true },
  type: { type: String, enum: ["multiple_choice", "true_false", "short_answer"], required: true },
  options: [optionSchema],
  answer: String,

  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  status: {
    type: String,
    enum: ["draft", "pending_verification", "pending_teacher_review", "verified", "rejected"],
    default: "draft"
  },
  verified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "accounts" },
  reviewedAt: Date,
  reviewNotes: String
}, { timestamps: true });

const questionModel = mongoose.model("Questions", questionSchema);
export default questionModel;
