import { UsersModel } from "../models/usersModel.js";

export default {
    async check_login(req, res, next) {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ msg: "информация неполная", staus: 400 });
            }

            return next();
        } catch (error) {
            res.status(500).json({
                msg: "Internal Server Error. Please try again later.",
                status: 500,
            });
        }
    },

    async check_register(req, res, next) {
        try {
            let { name, email, password, rule, telegram_id } = req.body;

            if (!name || !email || !password || !rule || !telegram_id) {
                return res.status(400).json({ msg: "имя, адрес электронной почты, пароль, роль, telegram_id не должны быть пустыми.y", staus: 400 });
            }

            const users = await UsersModel.find()

            let check_email = users.find(
                (user) => user.email.toLowerCase() == email.toLowerCase()
            );

            if (check_email) {
                return res.status(409).json({
                    msg: "этот адрес электронной почты уже существует",
                    status: 409,
                });
            }


            if (password.length > 15 || password.length < 5) {
                return res.status(400).json({ msg: "длина пароля должна быть меньше 15 и больше 5", status: 400 })
            }

            if (name.length > 50 || name.length < 2) {
                return res.status(400).json({ msg: "имя должно быть меньше 50 и больше 2 больших цифр", status: 400 })
            }

            next()
        } catch (error) {
            console.log(error.message)
        }
    }
}