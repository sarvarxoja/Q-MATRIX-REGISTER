import fs from "fs";
import path from 'path';
import PizZip from "pizzip";
import { fileURLToPath } from 'url'
import moment from 'moment-timezone';
import { TaskModel } from "../models/taskModel.js";
import { projectModel } from "../models/projectModel.js";
import { FoldersModel as googleFolderModel } from "../models/googleFolderModel.js";


//////////// BU FUNCTION .DOCX FILE ICHIDAGI MEN TANLAGAN SOZLARNI MEN AYTGAN SOZGA OZGARTIRAD ////////////

async function replaceTextInDocx(inputFilePath, outputFilePath, oldText, newText) {
    try {
        const content = fs.readFileSync(inputFilePath, "binary");
        const zip = new PizZip(content);

        // document.xml ni yuklash
        // input 
        const docXml = zip.file("word/document.xml").asText();

        // matnni almashtirish
        const updatedXml = docXml.replace(new RegExp(oldText, "g"), newText);

        // yangilangan document.xml faylini yozish
        zip.file("word/document.xml", updatedXml);

        // yangilangan faylni yaratish
        const buffer = zip.generate({ type: "nodebuffer" });
        fs.writeFileSync(outputFilePath, buffer);
    } catch (error) {
        console.log(error)
    }
}

export default {
    async createFolder(req, res) {
        try {
            let { section, oldText, project_id } = req.body;

            if (!section || !oldText || !project_id || !req.file) {
                return res.status(400).json({ msg: "Добавляемая информация неполная", status: 400 });
            }

            let checkProject = await projectModel.findOne({ _id: project_id });
            if (!checkProject) {
                return res.status(404).json({ msg: "Информация не найдена", status: 404 })
            }

            let createdData = await googleFolderModel.create({ section: section, oldText: oldText, folder_link: `/uploads/projects/${req.file.filename}`, project_id: project_id, createdAt: moment.tz('Asia/Tashkent').toDate() })

            res.status(201).json({ createdData, status: 201 })
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async searchProject(req, res) {
        try {
            let { name } = req.query;

            if (!name) {
                return res.status(400).json({ msg: "Добавляемая информация неполная", status: 400 });
            }

            const regexValue = new RegExp(name, "i");
            let projectData = await projectModel.find({ project_number: { $regex: regexValue } })

            if (!projectData.length) {
                return res.status(404).json({ msg: "Информация не найдена", status: 404 })
            }

            res.status(200).json({ projectData, status: 200 })
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async getSections(req, res) {
        try {
            let { id } = req.params;
            let sectionsData = await googleFolderModel.find({ project_id: id }).sort({ createdAt: -1 })
            let projectData = await projectModel.findOne({ _id: id })

            if (!sectionsData.length) {
                return res.status(404).json({ msg: "Информация не найдена", status: 404 })
            }

            res.status(200).json({ sectionsData, projectData, status: 200 })
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async getSection(req, res) {
        try {
            let { id } = req.params;
            let sectionData = await googleFolderModel.findOne({ _id: id }).populate("project_id");

            if (!sectionData) {
                return res.status(404).json({ msg: "Информация не найдена", status: 404 })
            }

            res.status(200).json({ sectionData, status: 200 })
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    async deleteFolder(req, res) {
        try {
            let { id } = req.params;
            let deletedData = await googleFolderModel.findOneAndDelete({ _id: id })

            if (!deletedData) {
                return res.status(404).json({ msg: "Информация не найдена", status: 404 });
            }

            res.status(200).json({ deletedData, status: 200 })
        } catch (error) {
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    },

    //////////// BU FUNCTION replaceTextInDocx FUNCTIONNI ISHLATISHDA YORDAM BERADI  ////////////

    async updateFile(req, res) {
        try {
            let { fieldsToUpdate } = req.body;
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            if (!fieldsToUpdate || typeof fieldsToUpdate !== 'object') {
                return res.status(400).json({ msg: "Добавляемая информация неполная", status: 400 });
            }

            const sectionsData = await TaskModel.find();

            if (!sectionsData.length) {
                return res.status(404).json({ msg: "Информация не найдена", status: 404 });
            }

            // Hujjatlarni yangilash uchun va'dalarni yaratish
            const updatePromises = sectionsData.map(async (section) => {
                const inputFilePath = path.join(process.cwd(), 'Src', section.link);
                const outputFilePath = path.join(__dirname, '../uploads/tasks', `updated-${path.basename(section.link)}`);

                // Read and update the .docx file content for each field
                let fileUpdated = false;
                for (const [field, newText] of Object.entries(fieldsToUpdate)) {
                    const oldText = section[field];

                    if (oldText) {
                        // Update text in the document for each field if it exists
                        await replaceTextInDocx(inputFilePath, outputFilePath, oldText, newText);
                        section[field] = newText; // Update MongoDB field
                        fileUpdated = true;
                    }
                }

                if (fileUpdated) {
                    section.link = `/uploads/tasks/updated-${path.basename(section.link)}`;
                    await section.save(); // Save the updated fields in MongoDB
                }
            });

            await Promise.all(updatePromises); // Execute all promises

            res.status(200).json({
                msg: "Все файлы успешно обновлены и сохранены!", status: 200
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Произошла ошибка. Повторите попытку позже.', status: 500 });
        }
    }
}