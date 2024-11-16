import jwt from "jsonwebtoken"
import { UsersModel as Users } from "../models/usersModel.js";

export default {
    async getUserById(req, res) {
        try {
            const { access_token } = req.headers;
            const payload = jwt.verify(access_token, process.env.SECRET_KEY);

            let { id } = req.params;
            let userData = await Users.findOne({ _id: id }).select("-password");

            if (!userData || userData.deleted !== false) {
                return res.status(404).json({ msg: "User not found", status: 404 });
            }

            let my_profile = false;

            if (userData._id == payload.id) {
                my_profile = true
            }


            res.status(200).json({ userData, my_profile, status: 200 });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async searchUsers(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY; // 'process' to'g'ri yozilishi kerak
            const payload = jwt.verify(access_token, SECRET_KEY);

            let { value } = req.query;

            if (!value) {
                return res.status(400).json({ msg: "bad request", status: 400 });
            }

            const regexValue = new RegExp(value, "i");
            let userData = await Users.find({
                $and: [
                    {
                        _id: { $ne: payload.id }, // payload.id ga teng bo'lmagan foydalanuvchilar
                    },
                    {
                        $or: [
                            { name: { $regex: regexValue } },
                            { email: { $regex: regexValue } },
                        ],
                    },
                ],
            }).select("-password");

            if (!userData.length) {
                return res.status(404).json({ msg: "user not found", status: 404 });
            }

            res.status(200).json({ userData, status: 200 });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async usersAll(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            // O'zingizni (payload.id) tashlab ketish uchun filter qo'shildi
            let employees = await Users.find({ deleted: false, _id: { $ne: payload.id } })
                .sort({ createdAt: -1 })
                .select("-password");

            res.status(200).json({ employees, status: 200 });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async userAvatarUpdate(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY)

            if (req.file) {
                const avatarUrl = `/uploads/avatars/${req.file.filename}`;

                const user = await Users.findByIdAndUpdate(payload.id, { avatar: avatarUrl }, { new: true }).select("-password");

                if (user) {
                    return res.status(200).json({
                        msg: 'Аватар успешно обновлен',
                        avatarUrl: avatarUrl,
                        user: user,
                    });
                } else {
                    return res.status(404).json({ message: 'Пользователь не найден' });
                }
            } else {
                return res.status(400).json({ message: 'Файл аватара не найден' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async userUpdate(req, res) {
        try {
            const updates = req.body;
            const options = { new: true };

            if (updates.email) {
                const users = await Users.find()

                let check_email = users.find(
                    (user) => user.email.toLowerCase() == updates.email.toLowerCase()
                );

                if (check_email) {
                    return res.status(409).json({
                        msg: "этот адрес электронной почты уже существует",
                        status: 409,
                    });
                }
            }

            if (updates.password) {
                if (updates.password.length > 15 || updates.password.length < 5) {
                    return res.status(400).json({ msg: "длина пароля должна быть меньше 15 и больше 5", status: 400 })
                }
            }

            if (updates.name) {
                if (updates.name.length > 50 || updates.name.length < 2) {
                    return res.status(400).json({ msg: "имя должно быть меньше 50 и больше 2 больших цифр", status: 400 })
                }
            }

            if (updates.deleted) {
                if (typeof updates.deleted !== "boolean") {
                    return res.status(400).json({ msg: "удаленный тип должен быть логическим", status: 400 })
                }
            }

            const updatedUser = await Users.findByIdAndUpdate(req.params.id, updates, options);

            if (!updatedUser) {
                return res.status(404).send({ error: 'Foydalanuvchi topilmadi!' });
            }

            res.status(200).json({ user_id: updatedUser._id, msg: "Пользователь обновлен успешно", status: 200 });
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async profileMe(req, res) {
        try {
            const { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY
            const payload = jwt.verify(access_token, SECRET_KEY);

            let myData = await Users.findOne({ _id: payload.id }).select("-password");

            if (!myData) {
                return res.status(403).json({ success: false, status: 403 });
            }

            if (myData.deleted === true) {
                return res.status(403).json({ success: false, status: 403 });
            }

            res.status(200).json({ myData, status: 200, success: true });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(403).json({ success: false, status: 403 });
            }
            console.log(error)
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    }
}