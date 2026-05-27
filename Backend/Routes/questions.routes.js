import questionControllers from "../Controllers/questions.controllers.js";
import { authToken, checkTeacher } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";

const questionsRouter = Router();

questionsRouter.post("/", authToken, questionControllers.createQuestion);
questionsRouter.get('/', authToken, questionControllers.getAllQuestions);
questionsRouter.get('/test/:testId', authToken, questionControllers.getQuestionsByTestId);
questionsRouter.get('/user/:userId', authToken, questionControllers.getQuestionsByUserId);
questionsRouter.put('/:id', authToken, questionControllers.editQuestion);
questionsRouter.delete('/:id', authToken, questionControllers.deleteQuestion);
questionsRouter.post('/answer/:id', authToken, checkTeacher, questionControllers.answerQuestion);

export default questionsRouter;