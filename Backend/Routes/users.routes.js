import userControllers from "../Controllers/users.controllers.js";
import { authToken, checkAdmin } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";
import avatarUpload from "../Middlewares/avatarUpload.middlewares.js";

const usersRouter = Router();

usersRouter.post("/", authToken, userControllers.createUser);
usersRouter.get("/me", authToken, userControllers.getCurrentUser);
usersRouter.get("/", authToken, checkAdmin, userControllers.getAllUsers);
usersRouter.put("/:id", authToken, userControllers.updateUser);
usersRouter.post("/upload-avatar", authToken, avatarUpload.single('avatar'), userControllers.updateAvatar);

export default usersRouter;