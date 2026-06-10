import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema({

  // Owner
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
    required: true
  },

  // Cloudinary
  originalName: {
    type: String,
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  publicId: {
    type: String,
    required: true
  },

  // image | pdf
  fileType: {
    type: String,
    enum: ["image", "pdf"],
    required: true
  },

  // Upload workflow
  status: {
    type: String,
    enum: [
      "uploaded",
      "processing",
      "ocr_done",
      "ai_done",
      "failed"
    ],
    default: "uploaded"
  },

  // OCR result
  ocrText: {
    type: String,
    default: ""
  },

  // Raw AI response
  aiRawResponse: {
    type: String,
    default: ""
  },

  // Generated questions
  extractedQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions"
    }
  ],

  // Error logging
  errorMessage: {
    type: String,
    default: ""
  }

}, {
  timestamps: true
});

const fileUploadModel = mongoose.model(
  "FileUploads",
  fileUploadSchema
);

export default fileUploadModel;