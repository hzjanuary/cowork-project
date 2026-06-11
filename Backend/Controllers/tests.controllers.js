import testModel from '../Models/tests.models.js';
import testAttemptModel from '../Models/testAttempts.models.js';
import questionModel from '../Models/questions.models.js';

const testController = {
    createTest: async (req, res) => {
        const { title, userId, timeLimit, visibility } = req.body;
        if (!title || !userId) {
            return res.status(400).json({
                success: false,
                message: "Title and userId are required"
            });
        }

        try {
            const newTest = new testModel({
                title,
                userId,
                timeLimit: timeLimit || 0,
                visibility: visibility || "private"
            });
            const savedTest = await newTest.save();
            return res.status(201).json({
                success: true,
                message: "Test created successfully",
                data: savedTest
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error creating test",
                error: error.message
            });
        }
    },
    getAllTests: async (req, res) => {
        try {
            const tests = await testModel.find();
            return res.status(200).json({
                success: true,
                message: "Tests fetched successfully",
                data: tests
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching tests",
                error: error.message
            });
        }
    },
    getTestById: async (req, res) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test ID is required"
            });
        }
        try {
            const test = await testModel.findById(id);
            if (!test) {
                return res.status(404).json({
                    success: false,
                    message: "Test not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Test fetched successfully",
                data: test
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching test",
                error: error.message
            });
        }
    },
    getTestsByUserId: async (req, res) => {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        try {
            const tests = await testModel.find({ userId });
            return res.status(200).json({
                success: true,
                message: "Tests fetched successfully",
                data: tests
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching tests",
                error: error.message
            });
        }
    },
    updateTest: async (req, res) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test ID is required"
            });
        }

        try {
            const existingTest = await testModel.findById(id);
            if (!existingTest) {
                return res.status(404).json({
                    success: false,
                    message: "Test not found"
                });
            }

            const { title, timeLimit, visibility } = req.body;
            const updatedTest = await testModel.findByIdAndUpdate(
                id,
                { title, timeLimit, visibility },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Test updated successfully",
                data: updatedTest
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error updating test",
                error: error.message
            });
        }
    },
    deleteTest: async (req, res) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test ID is required"
            });
        }

        try {
            const deletedTest = await testModel.findByIdAndDelete(id);
            if (!deletedTest) {
                return res.status(404).json({
                    success: false,
                    message: "Test not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Test deleted successfully",
                data: deletedTest
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error deleting test",
                error: error.message
            });
        }
    },
    startTest: async (req, res) => {
        try {
            const { testId } = req.params;
            const studentId = req.account._id;

            // Check if test exists and has questions
            const test = await testModel.findById(testId).populate('questions');
            if (!test) return res.status(404).json({ error: "Test not found" });

            // Create new attempt
            const testAttempt = new testAttemptModel({
                testId,
                studentId,
                answers: test.questions.map(q => ({ questionId: q._id }))
            });

            await testAttempt.save();

            // Return test with questions (without answers)
            return res.status(200).json({
                success: true,
                testAttemptId: testAttempt._id,
                test: {
                    _id: test._id,
                    title: test.title,
                    timeLimit: test.timeLimit,
                    questions: test.questions.map(q => ({
                        _id: q._id,
                        questionText: q.questionText,
                        type: q.type,
                        options: q.options,
                        difficulty: q.difficulty
                        // Don't send the answer!
                    }))
                }
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    submitTest: async (req, res) => {
        try {
            const { testAttemptId, answers } = req.body; // answers = [{questionId, studentAnswer}, ...]

            const testAttempt = await testAttemptModel.findById(testAttemptId).populate({
                path: 'testId',
                populate: { path: 'questions' }
            });

            if (!testAttempt) return res.status(404).json({ error: "Test attempt not found" });

            // Update answers
            answers.forEach(answer => {
                const attemptAnswer = testAttempt.answers.find(a => a.questionId.toString() === answer.questionId);
                if (attemptAnswer) {
                    attemptAnswer.studentAnswer = answer.studentAnswer;
                }
            });

            testAttempt.submittedAt = new Date();
            testAttempt.status = "submitted";

            // Auto-grade objective questions
            for (let ans of testAttempt.answers) {
                const question = await questionModel.findById(ans.questionId);

                if (question.type === "multiple_choice" || question.type === "true_false") {
                    ans.isCorrect = ans.studentAnswer === question.answer;
                    ans.points = ans.isCorrect ? 1 : 0;
                }
                // short_answer questions need manual grading
            }

            testAttempt.totalScore = testAttempt.answers.reduce((sum, a) => sum + (a.points || 0), 0);
            testAttempt.totalPoints = testAttempt.answers.length;
            testAttempt.percentage = (testAttempt.totalScore / testAttempt.totalPoints) * 100;
            testAttempt.status = "graded";

            await testAttempt.save();

            return res.status(200).json({
                success: true,
                message: "Test submitted successfully",
                score: testAttempt.totalScore,
                percentage: testAttempt.percentage.toFixed(2)
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    getTestResults: async (req, res) => {
        try {
            const { testAttemptId } = req.params;

            const testAttempt = await testAttemptModel.findById(testAttemptId).populate({
                path: 'answers.questionId'
            });

            return res.status(200).json({
                success: true,
                data: testAttempt
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    getMyTestAttempts: async (req, res) => {
        try {
            const attempts = await testAttemptModel
                .find({ studentId: req.account._id })
                .populate('testId', 'title timeLimit visibility')
                .sort({ updatedAt: -1 })
                .limit(10);

            return res.status(200).json({
                success: true,
                data: attempts
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching test attempts',
                error: error.message
            });
        }
    }
}

export default testController;
