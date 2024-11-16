import jwt from "jsonwebtoken";
import moment from 'moment-timezone';
import { TaskModel as Task } from "../models/taskModel.js";
import { UsersModel as Users } from "../models/usersModel.js";
import { NotificationsModel as notificationModel } from "../models/notificationModel.js";
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.BOT_TOKEN);
export default {
    async notificationCreate(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY)

            let { to_user_id, link, content, task_id, deadline, part_id } = req.body;

            if (!to_user_id || !content || !task_id || !link || !deadline || !part_id) {
                return res.status(400).json({ msg: "Data is not fully", status: 400 })
            }

            let userData = await Users.findOne({ _id: to_user_id }).select("-password")
            let taskData = await Task.findOne({ _id: task_id });

            if (!userData) {
                return res.status(404).json({ msg: "user not found", status: 404 })
            }

            if (!taskData) {
                return res.status(404).json({ msg: "task not found", status: 404 })
            }

            let createdData = await notificationModel.create({
                user_id: payload.id,
                to_user_id: to_user_id,
                content: content,
                link: link,
                task_id: task_id,
                telegram_id: userData.telegram_id,
                deadline: new Date(deadline),
                part_id: part_id,
                createdAt: moment.tz('Asia/Tashkent').toDate()
            })

            if (!taskData.access_userId.includes(to_user_id)) {
                taskData.access_userId.push(to_user_id);
                await taskData.save();
            } else {
                return res.status(400).json({ msg: "Пользователь уже добавлен", status: 400 });
            }

            res.status(200).json({ createdData, status: 200 })

            const sendMessageToAllUsers = (message) => {
                bot.sendMessage(userData.telegram_id, message);
            };

            sendMessageToAllUsers("sizga habar keldi sitega tashrif buyuring: http://192.168.1.131:3000/notifications");
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async checkNotification(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY)

            let myData = await notificationModel.find({ to_user_id: payload.id })

            if (!myData.length) {
                return res.status(200).json({ have: false, status: 200 })
            }

            res.status(200).json({ have: true, status: 200 })
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async myNotifications(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            // Pagination parametrlari
            const page = parseInt(req.query.page) || 1; // page parametri kiritilmagan bo'lsa, 1-chi sahifa bo'ladi
            const limit = parseInt(req.query.limit) || 10; // limit parametri kiritilmasa, default 10 ta element chiqadi
            const skip = (page - 1) * limit; // Nechta hujjat o'tkazib yuborilishi kerakligini aniqlaymiz

            let myData = await notificationModel
                .find({ to_user_id: payload.id, status: null })
                .populate({ path: "part_id", path: "user_id", select: "-password" })
                .skip(skip) // Ma'lum sondagi hujjatlarni o'tkazib yuborish
                .limit(limit)
                .sort({ createdAt: -1 }); // Limit bo'yicha nechta hujjat ko'rsatiladi

            // Jami hujjat sonini hisoblash (pagination uchun foydali)
            const totalNotifications = await notificationModel.countDocuments({ to_user_id: payload.id, status: null });

            res.status(200).json({
                myData,
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit), // Jami sahifalar soni
                totalNotifications, // Umumiy hujjatlar soni
                status: 200
            });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async getNotificationById(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY)

            const { id } = req.params;
            let data = await notificationModel.findOne({ _id: id }).populate({ path: "part_id", path: "user_id", select: "-password" })

            if (data.to_user_id != payload.id && data.user_id != payload.id) {
                return res.status(404).json({ msg: "data is not found", status: 404 })
            }

            if (!data) {
                return res.status(404).json({ msg: "data is not found", status: 404 })
            }

            if (data.to_user_id == payload.id) {
                await notificationModel.findOneAndUpdate({ _id: data.id }, { seen: true }, { new: true })
            }


            res.status(200).json({ data, status: 200 })
        } catch (error) {
            if (error instanceof mongoose.MongooseError) {
                return res.status(401).json({ msg: "invalid id", status: 401 })
            }
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async notificationUpdate(req, res) {
        const { id } = req.params;
        const { status, comment } = req.body;

        try {

            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY)

            if (typeof status !== 'boolean') {
                return res.status(400).json({ msg: 'Status should be a boolean value.', status: 400 });
            }

            // Agar status false bo'lsa, comment kiritilishi kerak
            if (status === false && !comment) {
                return res.status(400).json({ msg: 'Comment is required when status is false.', status: 400 });
            }

            let notificationData = await notificationModel.findOne({ _id: id })

            if (!notificationData) {
                return res.status(404).json({ msg: 'Notification not found.', status: 400 });
            }

            if (notificationData.user_id != payload.id && notificationData.to_user_id != payload.id) {
                return res.status(403).json({ msg: "Forbidden", status: 403 })
            }

            // Yangilanish qiymatlari (comment faqat status false bo'lsa qo'shiladi)
            const updateData = { status: status };
            if (status === false) {
                updateData.comment = comment;
                await Task.findOneAndUpdate(
                    { _id: notificationData.task_id },
                    { $pull: { access_userId: payload.id } }
                );
            }

            const notification = await notificationModel.updateOne(
                { _id: id },
                updateData,
                { new: true }
            );

            res.status(200).json({ notification, status: 200 });

            let adminData = await Users.findOne({ _id: notificationData.user_id }).select("-password")

            if (updateData.status === true) {
                await Task.findOneAndUpdate({ _id: notificationData.task_id }, { status_content: "Jarayonda" })
                await notificationModel.findOneAndUpdate({ _id: notificationData._id }, { status_content: "Jarayonda" })
            }

            const sendMessageToAllUsers = (message) => {
                bot.sendMessage(adminData.telegram_id, message);
            };

            const messageToAdmin = status ? "Сотрудник принял задачу" : "Сотрудник отказался от задачи";
            sendMessageToAllUsers(messageToAdmin + ` Профиль сотрудника: http://192.168.1.131:2323/user/${notificationData.to_user_id}, Причина отказа: ${comment}`);
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async mySentNotifications(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            // Pagination parametrlarini olish
            const page = parseInt(req.query.page) || 1; // page: qaysi sahifa
            const limit = parseInt(req.query.limit) || 10; // limit: nechta yozuv

            // Skip va limit orqali paginationni aniqlash
            const skip = (page - 1) * limit;

            let mySentNotifications = await notificationModel
                .find({ user_id: payload.id })
                .populate({ path: "part_id", path: "to_user_id", select: "-password" })
                .skip(skip) // Sahifalararo yozuvlarni o'tkazib yuborish
                .limit(limit)
                .sort({ createdAt: -1 }); // Qancha yozuvni olish

            // Jami yozuvlar sonini hisoblash
            const totalNotifications = await notificationModel.countDocuments({ user_id: payload.id });

            res.status(200).json({
                mySentNotifications,
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit),
                totalNotifications,
                status: 200
            });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async deleteNotification(req, res) {
        try {
            let { id } = req.params;
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY)

            let deletedData = await notificationModel.findOneAndDelete({ _id: id })

            if (!deletedData) {
                return res.status(404).json({ msg: "data not found", status: 404 })
            }

            if (deletedData.user_id != payload.id) {
                return res.status(404).json({ msg: "data is not found", status: 404 })
            }

            await Task.findOneAndUpdate(
                { _id: deletedData.task_id },
                { $pull: { access_userId: deletedData.to_user_id } }
            );

            res.status(200).json({ deletedData, msg: "data successfully", status: 200 })
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async notificationSuccessUpdate(req, res) {
        const { id } = req.params;
        const { status_content } = req.body;

        const { access_token } = req.headers;
        const SECRET_KEY = process.env.SECRET_KEY;
        const payload = jwt.verify(access_token, SECRET_KEY)

        try {
            // Bildirishnomani ID bo'yicha topish
            const notification = await notificationModel.findById({ _id: id }); // NotificationModel o'zingizning model nomingiz

            if (!notification) {
                return res.status(404).json({ message: "Notification not found" }); // Agar topilmasa, xato qaytaradi
            }

            if (!status_content) {
                return res.status(400).json({ msg: "Bad request", status: 400 })
            }

            if (notification.to_user_id != payload.id) {
                return res.status(403).json({ msg: "Forbidden", status: 403 })
            }

            notification.status_content = status_content;

            if (status_content === "Tugatildi") {
                await Task.findOneAndUpdate({ _id: notification.task_id }, { status_content: "Tugatildi" }, { new: true })
                notification.finished_time = moment.tz('Asia/Tashkent').toDate()

            }

            await notification.save();

            return res.status(200).json({ msg: "Notification updated successfully", notification });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },
}

