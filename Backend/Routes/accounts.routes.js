import accountController from "../Controllers/accounts.controllers.js";
import { registerValidation, authToken, loginValidation, checkAdmin } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";

const accountsRouter = Router();

accountsRouter.post("/register", registerValidation, accountController.createAccount);
accountsRouter.post ('/sent-otp', accountController.sendOtp);
accountsRouter.post ('/verify-otp', accountController.verifyOtp);
accountsRouter.post ('/forgot-password', accountController.forgetPassword);
accountsRouter.post("/login", loginValidation, accountController.loginAccount);
accountsRouter.get("/profile", authToken, accountController.getAccountById);
accountsRouter.get("/admin/accounts", authToken, checkAdmin, accountController.getAllAccounts);

export default accountsRouter;