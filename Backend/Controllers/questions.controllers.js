import questionModel from "../Models/questions.models.js";
import answerModel from "../Models/answers.models.js";

const questionControllers = {
    createQuestion: async (req, res) => {
        try {
            const { sourceFile, testId, questionText, type, options, answer, difficulty } = req.body;
            const userId = req.account._id; // Extract from authenticated user

            // Validate required fields
            if (!questionText || !type) {
                return res.status(400).json({
                    success: false,
                    message: "questionText and type are required"
                });
            }

            // Validate type enum
            const validTypes = ["multiple_choice", "true_false", "short_answer"];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid type. Must be one of: ${validTypes.join(", ")}`
                });
            }

            // Validate difficulty if provided
            if (difficulty) {
                const validDifficulties = ["easy", "medium", "hard"];
                if (!validDifficulties.includes(difficulty)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}`
                    });
                }
            }

            // Create new question
            const newQuestion = new questionModel({
                userId,
                sourceFile,
                testId,
                questionText,
                type,
                options: options || [],
                answer,
                difficulty: difficulty || "easy",
                status: "draft",
                verified: false
            });

            // Save to database
            const savedQuestion = await newQuestion.save();

            return res.status(201).json({
                success: true,
                message: "Question created successfully",
                data: savedQuestion
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error creating question",
                error: error.message
            });
        }
    },
    getAllQuestions: async (req, res) => {
        try {
            // Students only see verified questions, teachers see all
            const query = req.account?.role === 'teacher' ? {} : { status: 'verified' };
            const questions = await questionModel.find(query);
            
            // Add hasAnswered flag for each question
            const userId = req.account?._id;
            const questionsWithAnswerStatus = await Promise.all(
                questions.map(async (q) => {
                    const answer = await answerModel.findOne({ 
                        questionId: q._id, 
                        userId 
                    });
                    return {
                        ...q.toObject(),
                        hasAnswered: !!answer,
                        userAnswer: answer ? answer.userAnswer : null,
                        isUserAnswerCorrect: answer ? answer.isCorrect : null
                    };
                })
            );

            return res.status(200).json({
                success: true,
                message: "Questions fetched successfully",
                data: questionsWithAnswerStatus
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching questions",
                error: error.message
            });
        }
    },
    getQuestionById: async (req, res) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        try {
            const question = await questionModel.findById(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: "Question not found"
                });
            }

            // Check if user has answered this question
            const userId = req.account?._id;
            const userAnswer = await answerModel.findOne({ 
                questionId: id, 
                userId 
            });

            let responseData = question.toObject();
            responseData.hasAnswered = !!userAnswer;
            responseData.userAnswer = userAnswer ? userAnswer.userAnswer : null;
            responseData.isUserAnswerCorrect = userAnswer ? userAnswer.isCorrect : null;

            return res.status(200).json({
                success: true,
                message: "Question fetched successfully",
                data: responseData
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching question",
                error: error.message
            });
        }
    },
    getQuestionsByUserId: async (req, res) => {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        try {
            const questions = await questionModel.find({ userId });
            return res.status(200).json({
                success: true,
                message: "Questions fetched successfully",
                data: questions
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching questions",
                error: error.message
            });
        }
    },
    getQuestionsByTestId: async (req, res) => {
        const { testId } = req.params;
        if (!testId) {
            return res.status(400).json({
                success: false,
                message: "Test ID is required"
            });
        }
        try {
            const questions = await questionModel.find({ testId });
            return res.status(200).json({
                success: true,
                message: "Questions fetched successfully",
                data: questions
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching questions",
                error: error.message
            });
        }
    },
    answerQuestion: async (req, res) => {
        const { id } = req.params;
        const { answer } = req.body;
        const userId = req.account?._id;

        try {
            const question = await questionModel.findById(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: "Question not found"
                });
            }

            // Check if answer is correct based on question type
            let isCorrect = false;
            if (question.type === 'multiple_choice') {
                const correctOption = question.options?.find(opt => opt.isCorrect);
                isCorrect = answer === correctOption?.label;
            } else if (question.type === 'true_false') {
                isCorrect = answer === question.answer;
            } else if (question.type === 'short_answer') {
                isCorrect = answer.toLowerCase().trim() === (question.answer || '').toLowerCase().trim();
            }

            // Save or update the user's answer
            await answerModel.findOneAndUpdate(
                { questionId: id, userId },
                { 
                    questionId: id, 
                    userId, 
                    userAnswer: answer, 
                    isCorrect 
                },
                { upsert: true, new: true }
            );

            return res.status(200).json({
                success: true,
                message: "Question answered successfully",
                data: {
                    isCorrect,
                    correctAnswer: question.answer,
                    correctLabel: question.type === 'multiple_choice' 
                        ? question.options?.find(opt => opt.isCorrect)?.label 
                        : null
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error answering question",
                error: error.message
            });
        }
    },
    editQuestion: async (req, res) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        const existingQuestion = await questionModel.findById(id);
        if (!existingQuestion) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        const { questionText, type, options, answer, difficulty, testId } = req.body;

        try {
            const updatedQuestion = await questionModel.findByIdAndUpdate(
                id,
                {
                    questionText: questionText || existingQuestion.questionText,
                    type: type || existingQuestion.type,
                    options: options || existingQuestion.options,
                    answer: answer || existingQuestion.answer,
                    difficulty: difficulty || existingQuestion.difficulty,
                    testId: testId !== undefined ? testId : existingQuestion.testId
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Question updated successfully",
                data: updatedQuestion
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error editing question",
                error: error.message
            });
        }
    },
    deleteQuestion: async (req, res) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        try {
            const deletedQuestion = await questionModel.findByIdAndDelete(id);
            if (!deletedQuestion) {
                return res.status(404).json({
                    success: false,
                    message: "Question not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Question deleted successfully",
                data: deletedQuestion
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error deleting question",
                error: error.message
            });
        }
    },
    reviewQuestion: async (req, res) => {
        const { id } = req.params;
        const { approved } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        try {
            const question = await questionModel.findById(id);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: "Question not found"
                });
            }

            const updatedQuestion = await questionModel.findByIdAndUpdate(
                id,
                { 
                    status: approved ? 'verified' : 'draft',
                    verified: approved
                },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: `Question ${approved ? 'approved' : 'rejected'} successfully`,
                data: updatedQuestion
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error reviewing question",
                error: error.message
            });
        }
    }
}

export default questionControllers