import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function comparePassword(rawPassword, hash) {
    try {
        return bcrypt.compareSync(rawPassword, hash);
    } catch (error) {
        console.log(error.message);
    }
}

export async function encodePassword(password) {
    try {
        const SALT = bcrypt.genSaltSync();
        return bcrypt.hashSync(password, SALT);
    } catch (error) {
        console.log(error.message);
    }
}


export async function jwtSign(id) {
    try {
        const SECRET_KEY = process.env.SECRET_KEY;
        const expiresIn = 1 * 24 * 60 * 60;
        let jwtData = jwt.sign({ id: id }, SECRET_KEY, { expiresIn });

        return jwtData;
    } catch (error) {
        console.log(error.message);
    }
}