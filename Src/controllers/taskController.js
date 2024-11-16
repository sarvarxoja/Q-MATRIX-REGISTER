import jwt from "jsonwebtoken";
import { TaskModel as Task } from '../models/taskModel.js'
import { NotificationsModel } from '../models/notificationModel.js';

export default {
    async getAllTasks(req, res) {
        try {
            const tasks = await Task.find({})

            res.status(200).json({
                message: 'success',
                tasks: tasks
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async getTaskById(req, res) {
        try {
            const task = await Task.findById(req.params.id)

            if (!task) {
                return res.status(404).json({
                    message: 'Not found'
                })
            }

            return res.status(200).json({
                message: 'success',
                task
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async updateTask(req, res) {
        try {
            const {
                file_name,
                responsable,
                status,
                key,
                value
            } = req.body

            const updatedTask = await Task.findByIdAndUpdate(
                req.params.id,
                {
                    file_name,
                    responsable,
                    status,
                    key,
                    value
                },
                { new: true }
            )

            if (!updatedTask) {
                return res.status(404).json({ message: 'Task not found' })
            }

            res.status(200).json({
                message: 'success',
                updatedTask
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async removeTask(req, res) {
        try {
            const deletedTask = await Task.findByIdAndDelete(req.params.id)

            if (!deletedTask) {
                return res.status(404).json({ message: 'Task not found' })
            }

            res.status(200).json({
                message: 'Deleted'
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async getMyTasks(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            // status query parametrini tekshirish
            const { status } = req.query;
            let filter = { to_user_id: payload.id, status: true };

            if (status === 'tugatilgan') {
                filter.status_content = 'Tugatildi';
            } else if (status === 'jarayonda') {
                filter.status_content = 'Jarayonda';
            }

            let myProjects = await NotificationsModel.find(filter).sort({ createdAt: -1 }).populate("task_id")
                .populate("user_id", "-password");

            res.status(200).json({ myProjects, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },
}