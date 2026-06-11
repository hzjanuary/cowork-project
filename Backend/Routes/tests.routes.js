import testController from "../Controllers/tests.controllers.js";
import { authToken } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";

const testsRouter = Router();

testsRouter.post("/", authToken, testController.createTest);
testsRouter.get('/', authToken, testController.getAllTests);
testsRouter.get('/:id', authToken, testController.getTestById);
testsRouter.get('/user/:userId', authToken, testController.getTestsByUserId);
testsRouter.put('/:id', authToken, testController.updateTest);
testsRouter.delete('/:id', authToken, testController.deleteTest);
testsRouter.post('/tests/:testId/start', authToken, testController.startTest);
testsRouter.post('/test-attempts/submit', authToken, testController.submitTest);
testsRouter.get('/test-attempts/:testAttemptId/results', authToken, testController.getTestResults);

export default testsRouter;