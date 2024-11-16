import fs from 'fs';
import path from 'path';
import { FilesModel as Files } from "../models/partFilesModel.js"

export const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const { part_id, task_id } = req.body;


        if (!part_id || !task_id) {
            return res.status(400).json({ msg: "Bad request", status: 400 })
        }

        if (!file) {
            return res.status(400).json({ message: "Fayl yuklanmadi" });
        }

        // Fayl URL'si
        const newFileUrl = `/uploads/${file.filename}`;

        // Eski faylni tekshirish
        const existingFile = await Files.findOne({ part_id, task_id });

        if (existingFile) {
            // Agar eski fayl bo'lsa, uni o'chirish
            const existingFilePath = path.join(__dirname, `../public${existingFile.file_url}`);

            if (fs.existsSync(existingFilePath)) {
                fs.unlinkSync(existingFilePath); // Eski faylni o'chirish
            }

            // Eski fayl yozuvini yangilash
            existingFile.file_url = newFileUrl;
            await existingFile.save();
        } else {
            const newFile = await Files.create({
                part_id,
                task_id,
                file_url: newFileUrl
            });
        }

        res.status(200).json({ message: "Fayl muvaffaqiyatli yuklandi", file: newFileUrl });
    } catch (error) {
        res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
    }
};
