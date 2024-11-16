
import { Router } from 'express';
import { uploadFolder } from '../utils/multerFolder.js';
import folderController from '../controllers/folderController.js';

export const router_folders = Router();

router_folders
    .delete("/:id", folderController.deleteFolder)
    .patch("/update/file", folderController.updateFile)
    .get("/get/section/:id", folderController.getSection)
    .get("/project/search", folderController.searchProject)
    .get("/get/sections/:id", folderController.getSections)
    .post("/create", uploadFolder.single('file'), folderController.createFolder)