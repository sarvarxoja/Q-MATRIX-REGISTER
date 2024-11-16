import moment from "moment-timezone";
import { comparePassword, encodePassword, jwtSign } from "../utils/utils.js";
import { UsersModel as Users } from "../models/usersModel.js";

export default {
    async login(req, res) {
        try {
            let { email, password } = req.body;

            let data = await Users.findOne({ email: email });

            if (!data) {
                return res.status(401).json({
                    msg: "Такого пользователя не существует",
                    status: 401,
                });
            }


            if (data.deleted === true) {
                return res.status(401).json({
                    msg: "Ваша учетная запись отключена",
                    status: 401,
                });
            }

            if (data) {
                let check_password = await comparePassword(password, data.password);
                if (check_password) {
                    await Users.updateOne({ _id: data._id }, { last_login: moment.tz('Asia/Tashkent').toDate() });

                    return res.status(200).json({
                        name: data.name,
                        email: data.email,
                        status: 200,
                        access_token: await jwtSign(data._id),
                    });
                }
                if (!check_password) {
                    return res.status(401).json({
                        msg: "wrong email or password",
                        status: 401,
                    });
                }
            }
        } catch (error) {
            console.log(error);

            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async register(req, res) {
        try {
            let { name, email, password, rule, telegram_id } = req.body;
            password = await encodePassword(password);

            let createdData = await Users.create({ name: name, email: email, password: password, rule: rule, telegram_id: telegram_id })


            res.status(201).json({ createdData, status: 201 })
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    }
}