///////////// MALUMOTLAR BAZASIGA ULANISH VA .ENV DAGI MALUMOTLARDAN FOYDALANISH UCHUN IMPORT QILINGAN /////////////

import "dotenv/config"
import './config/db.js';

///////////// CORE MODULES NODE JS /////////////

import path from "path";
import cors from 'cors';

///////////// ES6 MODULI ORQALI EXPRESS JS LOYIHA UCHUN IMPORT QILINDI /////////////

import express from 'express';

//////////////////// UTILS ////////////////////

import { upload } from "./utils/multerFile.js";

//////////////////// ROUTERLAR CODENI OQILISHI VA BOSHQARISHNI OSONLASHTIRISHI UCHUN ISHLATILDI ////////////////////

import { part_router } from "./routes/partRoute.js";
import { task_router } from "./routes/taskRoute.js";
import { auth_router } from "./routes/authRoute.js";
import { user_router } from "./routes/userRoute.js";
import { project_router } from "./routes/projectRoute.js";
import { router_folders } from "./routes/foldersRoute.js";
import { notification_router } from "./routes/notificationRoute.js";

//////////////////// CONTROLLERLAR ////////////////////

import { uploadFile } from './controllers/fileController.js';
import { getTaskStatusPercentage } from './controllers/statisticController.js';

//////////////////// REQUST, TOKEN VA API KEY NI TEKSHIRISH UCHUN ISHLATILDI ////////////////////

import tokenMiddleware from './middlewares/token.middleware.js';
import { checkApiKeyAndDomain } from "./middlewares/apiKey.middleware.js"

//////////////////// STARTER FUNCTION LOYIHANI ISHGA TUSHIRISH VA XATOLARNI OSON TOPISHDA YORDAM BERADI ////////////////////

function starter() {
    try {
        const app = express();
        const PORT = process.env.PORT || 5000;


        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));

        app.use(checkApiKeyAndDomain);
        app.use('/auth', auth_router);
        app.use('/part', tokenMiddleware.checkUserToken, part_router);
        app.use('/task', tokenMiddleware.checkUserToken, task_router);
        app.use('/users', tokenMiddleware.checkUserToken, user_router);
        app.use('/folders', tokenMiddleware.checkUserToken, router_folders);
        app.use('/projects', tokenMiddleware.checkUserToken, project_router);
        app.use('/notifications', tokenMiddleware.checkAdminToken, notification_router);
        app.get('/persent/tasks', tokenMiddleware.checkRuleSNB, getTaskStatusPercentage);
        app.post('/upload', tokenMiddleware.checkUserToken, upload.single('file'), uploadFile);


        //////////// BU QISM BIZGA FILELARNI OLISHDA YORDAM BERADI ////////////
        //////////// BU FUNCTION PROJECT LARGA TEGISHLI BOLGAN .DOCX FILE-LARNI OLISHDA YORDAM BERADI ////////////

        app.get('/uploads/projects/:name', (req, res) => {
            const fileName = req.params.name;
            const filePath = path.join(process.cwd(), 'Src', 'uploads', 'projects', fileName);

            res.sendFile(filePath, (err) => {
                if (err) {
                    res.status(404).send('File not found');
                }
            });
        });

        ///////////// BU FUNCTION USERLARNING AVATAR QISMIDAGI RASMLARNINI OLISHDA YORDAM BERADI ////////////////

        app.get('/uploads/avatars/:name', (req, res) => {
            const fileName = req.params.name;
            const filePath = path.join(process.cwd(), 'Src', 'uploads', 'avatars', fileName);

            res.sendFile(filePath, (err) => {
                if (err) {
                    res.status(404).send('Image not found');
                }
            });
        });

        //////////// BU FUNCTION TASK LARGA TEGISHLI BOLGAN .DOCX FILE-LARNI OLISHDA YORDAM BERADI ////////////

        app.get('/uploads/tasks/:name', (req, res) => {
            console.log("s")
            const fileName = req.params.name;
            const filePath = path.join(process.cwd(), 'Src', 'uploads', 'tasks', fileName);

            res.sendFile(filePath, (err) => {
                if (err) {
                    res.status(404).send('Image not found');
                }
            });
        });


        app.use((err, req, res, next) => {
            res.status(500).send({ msg: 'Произошла ошибка на сервере!', status: 500 });
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });

    } catch (error) {
        console.log(error)
    }
}

starter()