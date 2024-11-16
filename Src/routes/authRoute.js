import { Router } from "express";
import { loginLimiter } from "../utils/limiter.js";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/auth.middleware.js";

///////// FAQAT ADMIN YANGI FOYDALANUVCHINI QOSHA OLADI ///////////

import tokenMiddleware from "../middlewares/token.middleware.js";

export const auth_router = Router();

auth_router
    .post('/login', authMiddleware.check_login, loginLimiter, authController.login)
    .post('/register', tokenMiddleware.checkAdminToken, authMiddleware.check_register, authController.register)