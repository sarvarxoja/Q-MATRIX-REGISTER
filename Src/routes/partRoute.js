import { Router } from 'express';
import partController from '../controllers/partController.js';

export const part_router = Router();

part_router
    .get('/', partController.getAllParts)
    .put('/:id', partController.updatePart)
    .get('/:id', partController.getPartById)
    .delete('/:id', partController.removePart)
    .get('/get/:id', partController.getOnePart)
    .patch('/part/update/:id', partController.partUpdate)