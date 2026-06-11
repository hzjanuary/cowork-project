import accountController from "../Controllers/accounts.controllers.js";
import { registerValidation, authToken, loginValidation, checkAdmin } from '../Middlewares/auth.middlewares.js';
import { Router } from "express";

const accountsRouter = Router();

accountsRouter.post("/register", registerValidation, accountController.createAccount);
accountsRouter.post('/sent-otp', accountController.sendOtp);
accountsRouter.post('/verify-otp', accountController.verifyOtp);
accountsRouter.post('/forgot-password', accountController.forgetPassword);
accountsRouter.post("/reset-password", accountController.resetPassword);
accountsRouter.post("/login", loginValidation, accountController.loginAccount);
accountsRouter.put("/change-password", authToken, accountController.changePassword);
accountsRouter.get("/profile", authToken, accountController.getAccountById);
accountsRouter.get("/admin/accounts", authToken, checkAdmin, accountController.getAllAccounts);
accountsRouter.post("/admin/accounts/:accountId/activate", authToken, checkAdmin, accountController.activateAccount);
accountsRouter.post("/admin/accounts/:accountId/deactivate", authToken, checkAdmin, accountController.deActivateAccount);
accountsRouter.delete("/admin/accounts/:accountId", authToken, checkAdmin, accountController.deleteAccount);
accountsRouter.post("/update-role", authToken, accountController.updateRole);
accountsRouter.post("/verify-email", accountController.activateAccount);
accountsRouter.post("/deactivate", authToken, accountController.deActivateAccount);
accountsRouter.post("/activate", authToken, accountController.activateAccount);
accountsRouter.delete("/delete", authToken, accountController.deleteAccount);

export default accountsRouter;
