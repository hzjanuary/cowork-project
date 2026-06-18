import questionControllers from "../Controllers/questions.controllers.js";
import { authToken, checkTeacher } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";
import multer from "multer";

const questionsRouter = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Specific routes first (before generic :id routes)
questionsRouter.post("/", authToken, questionControllers.createQuestion);
questionsRouter.get('/', authToken, questionControllers.getAllQuestions);
questionsRouter.post('/extract-from-file', authToken, checkTeacher, upload.single('file'), questionControllers.extractQuestionsFromFile);
questionsRouter.post('/answer/:id', authToken, questionControllers.answerQuestion);
questionsRouter.put('/review/:id', authToken, checkTeacher, questionControllers.reviewQuestion);
questionsRouter.put('/edit/:id', authToken, questionControllers.editQuestion);
questionsRouter.delete('/delete/:id', authToken, questionControllers.deleteQuestion);
questionsRouter.get('/test/:testId', authToken, questionControllers.getQuestionsByTestId);
questionsRouter.get('/user/:userId', authToken, questionControllers.getQuestionsByUserId);

// Generic routes last (can match any :id parameter)
questionsRouter.get('/:id', authToken, questionControllers.getQuestionById);

export default questionsRouter;
