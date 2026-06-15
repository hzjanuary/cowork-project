import testController from "../Controllers/tests.controllers.js";
import { authToken, checkTeacher } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";

const testsRouter = Router();

testsRouter.post("/", authToken, testController.createTest);
testsRouter.get('/', authToken, testController.getAllTests);
testsRouter.get('/user/:userId', authToken, testController.getTestsByUserId);
testsRouter.get('/test-attempts/me', authToken, testController.getMyTestAttempts);
testsRouter.get('/test-attempts/pending-grading', authToken, checkTeacher, testController.getPendingGradingAttempts);
testsRouter.post('/tests/:testId/start', authToken, testController.startTest);
testsRouter.post('/test-attempts/submit', authToken, testController.submitTest);
testsRouter.put('/test-attempts/:testAttemptId/grade', authToken, checkTeacher, testController.manualGradeAttempt);
testsRouter.get('/test-attempts/:testAttemptId/results', authToken, testController.getTestResults);
testsRouter.get('/:id', authToken, testController.getTestById);
testsRouter.put('/:id', authToken, testController.updateTest);
testsRouter.delete('/:id', authToken, testController.deleteTest);

export default testsRouter;
