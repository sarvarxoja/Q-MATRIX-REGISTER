import { Router } from 'express'
import taskController from '../controllers/taskController.js';

export const task_router = Router();

task_router
    .get('/', taskController.getAllTasks)
    .put('/:id', taskController.updateTask)
    .get('/:id', taskController.getTaskById)
    .delete('/:id', taskController.removeTask)
    .get('/my/tasks', taskController.getMyTasks)