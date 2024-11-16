import fs from "fs";
import path from "path";
import multer from "multer";

const storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
        // `uploads` papkasiga avatarlarni joylash
        const uploadPath = path.join(process.cwd(), 'Src','uploads', 'avatars');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        // Faylni nomini `avatar-{timestamp}.jpg` kabi qilib o'zgartiramiz
        const fileExtension = path.extname(file.originalname);
        cb(null, `avatar-${Date.now()}${fileExtension}`);
    },
});

export const uploadAvatar = multer({ storage: storageAvatar });