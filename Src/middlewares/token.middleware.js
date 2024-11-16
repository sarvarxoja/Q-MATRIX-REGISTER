import jwt from "jsonwebtoken";
import { UsersModel } from "../models/usersModel.js";

export default {
    async checkAdminToken(req, res, next) {
        try {
            let { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            if (payload) {
                let userData = await UsersModel.findOne({ _id: payload.id });

                if (!userData) {
                    return res.status(401).json({ msg: "invalide token", status: 401 });
                }

                if (userData.super_admin !== true) {
                    return res.status(401).json({
                        msg: "You cat'n do this",
                        status: 401,
                    });
                }

                if (userData.deleted === true) {
                    return res.status(401).json({ msg: "your profile deleted", status: 401 });
                }

                return next();
            }
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ msg: "invalide token", status: 401 });
            }
        }
    },

    async checkRuleSNB(req, res, next) {
        try {
            let { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            if (payload) {
                let userData = await UsersModel.findOne({ _id: payload.id });

                if (!userData) {
                    return res.status(401).json({ msg: "invalide token", status: 401 });
                }

                if (userData.rule !== "SNB") {
                    return res.status(401).json({
                        msg: "You cat'n do this",
                        status: 401,
                    });
                }

                return next();
            }
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ msg: "invalide token", status: 401 });
            }
        }
    },

    async checkRuleSTB(req, res, next) {
        try {
            let { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            if (payload) {
                let userData = await UsersModel.findOne({ _id: payload.id });

                if (!userData) {
                    return res.status(401).json({ msg: "invalide token", status: 401 });
                }

                if (userData.rule !== "STB") {
                    return res.status(401).json({
                        msg: "You cat'n do this",
                        status: 401,
                    });
                }

                return next();
            }
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ msg: "invalide token", status: 401 });
            }
        }
    },

    async checkRuleICHB(req, res, next) {
        try {
            let { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            if (payload) {
                let userData = await UsersModel.findOne({ _id: payload.id });

                if (!userData) {
                    return res.status(401).json({ msg: "invalide token", status: 401 });
                }

                if (userData.rule !== "ICHB") {
                    return res.status(401).json({
                        msg: "You cat'n do this",
                        status: 401,
                    });
                }

                return next();
            }
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ msg: "invalide token", status: 401 });
            }
        }
    },

    async checkUserToken(req, res, next) {
        try {
            let { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);

            if (payload) {
                let userData = await UsersModel.findOne({ _id: payload.id });

                if (!userData) {
                    return res.status(401).json({ msg: "invalide token", status: 401 });
                }

                if (userData.deleted === true) {
                    return res.status(401).json({ msg: "your profile deleted", status: 401 });
                }

                return next();
            }
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ msg: "invalide token", status: 401 });
            }
        }
    },

    async checkSTB_SNB(req, res, next) {
        try {
            let { access_token } = req.headers;
            const SECRET_KEY = process.env.SECRET_KEY;
            const payload = jwt.verify(access_token, SECRET_KEY);
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ msg: "invalide token", status: 401 });
            }
        }
    }
}