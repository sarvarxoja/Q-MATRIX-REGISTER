import { Router } from "express";
import { uploadAvatar } from "../utils/multerAvatar.js";
import userController from "../controllers/userController.js";

export const user_router = Router()

user_router
    .get('/all', userController.usersAll)
    .get('/find/:id', userController.getUserById)
    .get('/profile/me', userController.profileMe)
    .patch('/update/:id', userController.userUpdate)
    .get('/search/result', userController.searchUsers)
    .patch('/update/avatar/data', uploadAvatar.single('avatar'), userController.userAvatarUpdate)
