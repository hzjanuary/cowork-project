import testModel from '../Models/tests.models.js';
import testAttemptModel from '../Models/testAttempts.models.js';
import questionModel from '../Models/questions.models.js';
import userModel from '../Models/users.models.js';
import mongoose from 'mongoose';

const hasInvalidQuestionIds = (questions) => (
    questions.some((questionId) => !mongoose.Types.ObjectId.isValid(questionId))
);

const recalculateAttemptScore = (testAttempt) => {
    testAttempt.totalAutoScore = testAttempt.answers.reduce((sum, answer) => (
        answer.needsManualGrading ? sum : sum + (answer.points || 0)
    ), 0);
    testAttempt.teacherScore = testAttempt.answers.reduce((sum, answer) => (
        answer.manualScore === null || answer.manualScore === undefined ? sum : sum + answer.manualScore
    ), 0);
    testAttempt.totalScore = testAttempt.answers.reduce((sum, answer) => sum + (answer.points || 0), 0);
    testAttempt.totalPoints = testAttempt.answers.reduce((sum, answer) => sum + (answer.maxPoints || 1), 0);
    testAttempt.percentage = testAttempt.totalPoints ? (testAttempt.totalScore / testAttempt.totalPoints) * 100 : 0;
};

const getTeacherOwnedTestIds = async (account) => {
    if (account?.role === 'admin') return null;

    const teacherProfile = await userModel.findOne({ accountId: account._id });
    if (!teacherProfile) return [];

    return testModel.find({ userId: teacherProfile._id }).distinct('_id');
};

const testController = {
    createTest: async (req, res) => {
        const { title, userId, timeLimit, visibility, questions = [] } = req.body;
        if (!title || !userId) {
            return res.status(400).json({
                success: false,
                message: "Title and userId are required"
            });
        }

        try {
            if (!Array.isArray(questions)) {
                return res.status(400).json({
                    success: false,
                    message: "questions must be an array of question IDs"
                });
            }
            if (hasInvalidQuestionIds(questions)) {
                return res.status(400).json({
                    success: false,
                    message: "questions contains an invalid question ID"
                });
            }

            const questionCount = questions.length
                ? await questionModel.countDocuments({ _id: { $in: questions } })
                : 0;

            if (questionCount !== questions.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more selected questions do not exist"
                });
            }

            const blockedQuestionCount = questions.length
                ? await questionModel.countDocuments({
                    _id: { $in: questions },
                    status: { $in: ["pending_teacher_review", "rejected"] }
                })
                : 0;

            if (blockedQuestionCount) {
                return res.status(400).json({
                    success: false,
                    message: "Selected questions must be teacher-approved before they can be used in a test"
                });
            }

            const newTest = new testModel({
                title,
                userId,
                questions,
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
            const test = await testModel.findById(id).populate('questions');
            if (!test) {
                return res.status(404).json({
                    success: false,
                    message: "Test not found"
                });
            }
            const testData = test.toObject();
            if (!['teacher', 'admin'].includes(req.account?.role)) {
                testData.questions = (testData.questions || []).map((question) => ({
                    _id: question._id,
                    questionText: question.questionText,
                    type: question.type,
                    options: question.options?.map((option) => ({
                        label: option.label,
                        text: option.text
                    })),
                    difficulty: question.difficulty
                }));
            }

            return res.status(200).json({
                success: true,
                message: "Test fetched successfully",
                data: testData
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

            const { title, timeLimit, visibility, questions } = req.body;
            if (questions !== undefined && !Array.isArray(questions)) {
                return res.status(400).json({
                    success: false,
                    message: "questions must be an array of question IDs"
                });
            }

            if (Array.isArray(questions)) {
                if (hasInvalidQuestionIds(questions)) {
                    return res.status(400).json({
                        success: false,
                        message: "questions contains an invalid question ID"
                    });
                }

                const questionCount = questions.length
                    ? await questionModel.countDocuments({ _id: { $in: questions } })
                    : 0;

                if (questionCount !== questions.length) {
                    return res.status(400).json({
                        success: false,
                        message: "One or more selected questions do not exist"
                    });
                }

                const blockedQuestionCount = questions.length
                    ? await questionModel.countDocuments({
                        _id: { $in: questions },
                        status: { $in: ["pending_teacher_review", "rejected"] }
                    })
                    : 0;

                if (blockedQuestionCount) {
                    return res.status(400).json({
                        success: false,
                        message: "Selected questions must be teacher-approved before they can be used in a test"
                    });
                }
            }

            const updatedTest = await testModel.findByIdAndUpdate(
                id,
                { title, timeLimit, visibility, ...(questions !== undefined ? { questions } : {}) },
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

            const test = await testModel.findById(testId).populate('questions');
            if (!test) return res.status(404).json({ error: "Test not found" });

            const questions = test.questions?.length
                ? test.questions
                : await questionModel.find({ testId: test._id });

            if (!questions.length) {
                return res.status(400).json({
                    success: false,
                    message: "Test has no questions"
                });
            }

            const testAttempt = new testAttemptModel({
                testId,
                studentId,
                answers: questions.map(q => ({ questionId: q._id }))
            });

            await testAttempt.save();

            return res.status(200).json({
                success: true,
                testAttemptId: testAttempt._id,
                test: {
                    _id: test._id,
                    title: test.title,
                    timeLimit: test.timeLimit,
                    questions: questions.map(q => ({
                        _id: q._id,
                        questionText: q.questionText,
                        type: q.type,
                        options: q.options?.map(option => ({
                            label: option.label,
                            text: option.text
                        })),
                        difficulty: q.difficulty
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

            // Auto-grade objective questions and flag open-ended questions for manual grading.
            for (let ans of testAttempt.answers) {
                const question = await questionModel.findById(ans.questionId);
                ans.maxPoints = ans.maxPoints || 1;

                if (question.type === "multiple_choice") {
                    const correctOption = question.options?.find(option => option.isCorrect);
                    ans.isCorrect = ans.studentAnswer === question.answer
                        || ans.studentAnswer === correctOption?.label
                        || ans.studentAnswer === correctOption?.text;
                    ans.points = ans.isCorrect ? 1 : 0;
                    ans.needsManualGrading = false;
                } else if (question.type === "true_false") {
                    ans.isCorrect = String(ans.studentAnswer).toLowerCase() === String(question.answer).toLowerCase();
                    ans.points = ans.isCorrect ? 1 : 0;
                    ans.needsManualGrading = false;
                } else if (question.type === "short_answer") {
                    if (String(question.answer || '').trim()) {
                        ans.isCorrect = String(ans.studentAnswer || '').trim().toLowerCase() === String(question.answer || '').trim().toLowerCase();
                        ans.points = ans.isCorrect ? 1 : 0;
                        ans.needsManualGrading = false;
                    } else {
                        ans.isCorrect = undefined;
                        ans.points = 0;
                        ans.needsManualGrading = true;
                    }
                }
            }

            testAttempt.needsManualGrading = testAttempt.answers.some(answer => answer.needsManualGrading);
            testAttempt.manualGradingStatus = testAttempt.needsManualGrading ? "pending" : "not_required";
            testAttempt.status = testAttempt.needsManualGrading ? "needs_manual_grading" : "graded";
            recalculateAttemptScore(testAttempt);

            await testAttempt.save();

            return res.status(200).json({
                success: true,
                message: "Test submitted successfully",
                score: testAttempt.totalScore,
                percentage: testAttempt.percentage.toFixed(2),
                needsManualGrading: testAttempt.needsManualGrading,
                manualGradingStatus: testAttempt.manualGradingStatus
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
    getPendingGradingAttempts: async (req, res) => {
        try {
            const teacherTestIds = await getTeacherOwnedTestIds(req.account);
            const ownershipFilter = teacherTestIds ? { testId: { $in: teacherTestIds } } : {};
            const attempts = await testAttemptModel
                .find({
                    ...ownershipFilter,
                    $or: [
                        { needsManualGrading: true },
                        { status: "needs_manual_grading" },
                        { manualGradingStatus: "pending" }
                    ]
                })
                .populate('testId', 'title timeLimit visibility userId')
                .populate('studentId', 'username email role')
                .populate('answers.questionId')
                .sort({ submittedAt: 1, updatedAt: 1 });

            return res.status(200).json({
                success: true,
                data: attempts
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching pending grading attempts',
                error: error.message
            });
        }
    },
    manualGradeAttempt: async (req, res) => {
        try {
            const { testAttemptId } = req.params;
            const { grades = [], teacherFeedback } = req.body;

            if (!Array.isArray(grades)) {
                return res.status(400).json({
                    success: false,
                    message: "grades must be an array"
                });
            }

            const testAttempt = await testAttemptModel.findById(testAttemptId);

            if (!testAttempt) {
                return res.status(404).json({
                    success: false,
                    message: "Test attempt not found"
                });
            }

            const teacherTestIds = await getTeacherOwnedTestIds(req.account);
            if (teacherTestIds && !teacherTestIds.some((testId) => testId.toString() === testAttempt.testId.toString())) {
                return res.status(403).json({
                    success: false,
                    message: "You can only grade attempts for your own tests"
                });
            }

            grades.forEach((grade) => {
                const attemptAnswer = testAttempt.answers.find((answer) => (
                    answer.questionId?.toString() === grade.questionId
                ));

                if (!attemptAnswer) return;

                const maxPoints = Number(grade.maxPoints ?? attemptAnswer.maxPoints ?? 1);
                const manualScore = Math.max(0, Math.min(Number(grade.points ?? grade.manualScore ?? 0), maxPoints));

                attemptAnswer.maxPoints = maxPoints;
                attemptAnswer.points = manualScore;
                attemptAnswer.manualScore = manualScore;
                attemptAnswer.isCorrect = manualScore > 0;
                attemptAnswer.needsManualGrading = false;
                attemptAnswer.teacherFeedback = grade.teacherFeedback;
                attemptAnswer.gradedBy = req.account._id;
                attemptAnswer.gradedAt = new Date();
            });

            testAttempt.needsManualGrading = testAttempt.answers.some(answer => answer.needsManualGrading);
            testAttempt.manualGradingStatus = testAttempt.needsManualGrading ? "pending" : "graded";
            testAttempt.status = testAttempt.needsManualGrading ? "needs_manual_grading" : "graded";
            testAttempt.teacherFeedback = teacherFeedback;
            testAttempt.gradedBy = req.account._id;
            testAttempt.gradedAt = new Date();
            recalculateAttemptScore(testAttempt);

            await testAttempt.save();

            return res.status(200).json({
                success: true,
                message: "Test attempt graded successfully",
                data: testAttempt
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error grading test attempt',
                error: error.message
            });
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
