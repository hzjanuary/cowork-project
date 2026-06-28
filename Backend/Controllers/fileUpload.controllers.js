import fileUploadModel from "../Models/fileUpload.models.js";
import { extractTextFromImage } from "../Utils/OCR/OCR.utils.js";

const fileUploadController = {
    uploadFile: async (req, res) => {
        let uploadedFileId = null;
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                });
            }

            const fileType = req.file.mimetype.startsWith('image/')
                ? 'image'
                : req.file.mimetype === 'application/pdf'
                    ? 'pdf'
                    : null;

            if (!fileType) {
                return res.status(400).json({
                    message: "Unsupported file type"
                });
            }

            const newFile = await fileUploadModel.create({
                userId: req.account?._id,

                originalName: req.file.originalname,

                fileUrl: req.file.path,

                publicId: req.file.filename,

                fileType
            });
            uploadedFileId = newFile._id;

            const ocrText = await extractTextFromImage(newFile.fileUrl);

            const updatedFile = await fileUploadModel.findByIdAndUpdate(
                newFile._id,
                {
                    ocrText,
                    status: 'ocr_done'
                },
                { new: true }
            );

            return res.status(201).json({
                message: "File uploaded successfully",
                file: updatedFile,
                ocrText
            });
        } catch (error) {
            await fileUploadModel.findByIdAndUpdate(
                uploadedFileId,
                {
                    status: 'failed',
                    errorMessage: error.message
                }
            ).catch(() => {});
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

export default fileUploadController;