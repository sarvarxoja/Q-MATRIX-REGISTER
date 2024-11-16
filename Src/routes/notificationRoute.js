import { Router } from "express";
import notificationController from "../controllers/notificationController.js";

export const notification_router = Router()

notification_router
    .get('/my', notificationController.myNotifications)
    .get('/check', notificationController.checkNotification)
    .delete('/:id', notificationController.deleteNotification)
    .post('/create', notificationController.notificationCreate)
    .get('/my/sent', notificationController.mySentNotifications)
    .get('/find/:id', notificationController.getNotificationById)
    .patch('/update/:id', notificationController.notificationUpdate)
    .patch('/success/update/:id', notificationController.notificationSuccessUpdate)
