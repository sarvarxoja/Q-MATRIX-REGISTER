import { Router } from 'express';
import projectController from "../controllers/projectController.js"

export const project_router = Router()

project_router
    .put('/:id', projectController.updateProject)
    .get('/all', projectController.getAllProjects)
    .get('/:id', projectController.getProjectById)
    .delete('/:id', projectController.removeProject)
    .post('/create', projectController.createProject)
    .get('/project/search', projectController.searchProjects)