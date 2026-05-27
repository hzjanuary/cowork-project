import userControllers from "../Controllers/users.controllers.js";
import { authToken } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";
import avatarUpload from "../Middlewares/avatarUpload.middlewares.js";

const usersRouter = Router();

usersRouter.post("/", authToken, userControllers.createUser);
usersRouter.put("/:id", authToken, userControllers.updateUser);
usersRouter.put("/change-password", authToken, userControllers.changePassword);
usersRouter.post("/upload-avatar", authToken, avatarUpload.single('avatar'), userControllers.updateAvatar);

export default usersRouter;