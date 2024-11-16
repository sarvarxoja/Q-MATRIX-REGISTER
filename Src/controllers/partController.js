import jwt from 'jsonwebtoken'
import { partModel } from '../models/partModel.js'
import { TaskModel as Task } from '../models/taskModel.js'
import { UsersModel as usersModel } from '../models/usersModel.js'
import { FilesModel as partFilesModel } from '../models/partFilesModel.js'
import { NotificationsModel as notificationModel } from '../models/notificationModel.js'

export default {
    async getAllParts(req, res) {
        try {
            const parts = await partModel.find()

            res.status(200).json({
                message: 'success',
                parts
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async getPartById(req, res) {
        try {
            const { access_token } = req.headers;
            let SECRET_KEY = process.env.SECRET_KEY;

            // Tokenni verify qilish va payloadni olish
            let payload = jwt.verify(access_token, SECRET_KEY);
            let userId = payload.id;  // payload ichidagi user id

            // Userni olish (rolni tekshirish uchun)
            let user = await usersModel.findById({ _id: userId });
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            // Partlarni olish
            let parts = await partModel.find({ project_id: req.params.id });

            // Har bir part uchun tegishli tasklar sonini hisoblash va admin bo'lsa linkni qo'shish
            let result = await Promise.all(parts.map(async (part) => {
                let taskCount = await Task.countDocuments({ part_id: part._id });

                // Agar user admin bo'lsa, part ichidagi linkni qo'shamiz
                let link = user.super_admin ? part.link : null;

                return {
                    ...part._doc, // Part hujjatini qaytarish
                    taskCount, // Tasklar sonini qo'shish
                    link // Agar admin bo'lsa, linkni qo'shish
                };
            }));

            res.status(200).json({ data: result, count: result.length, status: 200 });

        } catch (err) {
            console.log(err);

            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async getOnePart(req, res) {
        try {
            let { access_token } = req.headers;
            let SECRET_KEY = process.env.SECRET_KEY;
            let payload = jwt.verify(access_token, SECRET_KEY)
            const myData = await usersModel.findOne({ _id: payload.id }).select("-password")

            let { id } = req.params;
            let partData;
            let projectData;

            if (myData.super_admin === true) {
                partData = await Task.find({ part_id: id }).populate({ path: 'access_userId', select: "email" });
                projectData = await partModel.findOne({ _id: id });
            } else {
                partData = await Task.find({
                    part_id: id,
                    access_userId: payload.id
                }).populate({ path: 'access_userId', select: "email" });
                projectData = await partModel.findOne({ _id: id }).select("-link");
            }



            // if (!partData || partData.length === 0) {
            //     return res.status(404).json({ msg: "Data is not found", status: 404 });
            // }

            // 1. part_id qiymati bilan mos keladigan barcha hujjatlarni topish
            const tasks = await Task.find({ part_id: id });
            let number_completed = await Task.countDocuments({ status_content: "Tugatildi" });

            if (tasks.length === 0) {
                return res.status(404).json({ msg: 'Ushbu part_id uchun hech qanday ma\'lumot topilmadi', status: 404 });
            }

            // 2. Har bir status bo'yicha sanash
            const totalTasks = tasks.length;
            const statusCount = {
                qabul_qilmadi: 0,
                qabul_qildi: 0,
                jarayonda: 0,
                tugatildi: 0,
                biriktirilmagan: 0 // Null bo'lganda yoki status_content mavjud bo'lmaganda
            };

            tasks.forEach(task => {
                if (!task.status_content) {
                    statusCount.biriktirilmagan += 1;
                } else {
                    switch (task.status_content) {
                        case 'Qabul qilmadi':
                            statusCount.qabul_qilmadi += 1;
                            break;
                        case 'Qabul qildi':
                            statusCount.qabul_qildi += 1;
                            break;
                        case 'Jarayonda':
                            statusCount.jarayonda += 1;
                            break;
                        case 'Tugatildi':
                            statusCount.tugatildi += 1;
                            break;
                        default:
                            break;
                    }
                }
            });

            // 3. Har bir statusning foizini hisoblash
            const statusPercentage = {
                qabul_qilmadi: ((statusCount.qabul_qilmadi / totalTasks) * 100).toFixed(2) + '%',
                qabul_qildi: ((statusCount.qabul_qildi / totalTasks) * 100).toFixed(2) + '%',
                jarayonda: ((statusCount.jarayonda / totalTasks) * 100).toFixed(2) + '%',
                tugatildi: ((statusCount.tugatildi / totalTasks) * 100).toFixed(2) + '%',
                biriktirilmagan: ((statusCount.biriktirilmagan / totalTasks) * 100).toFixed(2) + '%'
            };

            const notifications = await notificationModel.find({
                part_id: id,
                status: true,
            });

            const currentDate = new Date();
            const lateNotifications = notifications.filter(notification => notification.deadline < currentDate);
            const latePercentage = (lateNotifications.length / notifications.length) * 100;



            const partDataWithFinishedTime = await Promise.all(partData.map(async (part) => {
                // Task modelidan finished_time ni olish
                const finishedTask = await notificationModel.findOne({
                    task_id: part._id,
                    status_content: "Tugatildi"
                }).select("finished_time"); // finished_time ni olish

                const fileDownloadData = await partFilesModel.findOne({
                    task_id: part._id
                })

                return {
                    ...part.toObject(), // part ma'lumotlarini qo'shamiz
                    finished_time: finishedTask ? finishedTask.finished_time : null,
                    fileDownloadData: fileDownloadData ? true : false
                };
            }));

            res.status(200).json({
                partData: partDataWithFinishedTime, parts_count: partData.length, number_completed: number_completed, tasks_status: statusPercentage, projectData, data_tasks: {
                    totalProjects: notifications.length,
                    lateProjects: lateNotifications.length,
                    latePercentage: latePercentage.toFixed(2),
                }, status: 200
            });
        } catch (error) {
            console.log(error);

            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async updatePart(req, res) {
        try {
            const { project_number, part_number } = req.body

            const updatedPart = await partModel.findByIdAndUpdate(
                req.params.id,
                {
                    project_number,
                    part_number
                },
                { new: true }
            )

            if (!updatedPart) {
                return res.status(404).json({ message: 'Part not found' })
            }

            res.status(200).json({
                message: 'success',
                updatedPart
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async removePart(req, res) {
        try {
            const deletedPart = await partModel.findByIdAndDelete(req.params.id)

            if (!deletedPart) {
                return res.status(404).json({ message: 'Part not found' })
            }

            res.status(200).json({
                message: 'Deleted',
                status: 200
            })
        } catch (err) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async partUpdate(req, res) {
        try {
            const updates = req.body;
            const options = { new: true };

            const updatedPart = await partModel.findByIdAndUpdate(req.params.id, updates, options);

            if (!updatedPart) {
                return res.status(404).json({ msg: 'Foydalanuvchi topilmadi!', status: 404 });
            }

            res.status(200).json({ updatedPart, status: 200 });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    }
}